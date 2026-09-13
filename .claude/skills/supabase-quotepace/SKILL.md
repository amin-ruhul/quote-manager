---
name: supabase-quotepace
description: QuotePace's own Supabase rules — how THIS app does auth, multi-tenant scoping, RLS policy shape, the public quote page, and logo/photo storage. Use alongside the vendor `supabase` skill whenever touching auth, RLS, storage, or any query that reads business-owned data. The vendor skill covers Supabase in general; this one covers the decisions already made here.
---

# Supabase (QuotePace)

The vendor `supabase` skill covers Supabase in general and is the authority on
Postgres traps, RLS pitfalls, and CLI/MCP usage — read it too. This file covers
only what is specific to QuotePace and already decided.

## The two-layer rule (most important thing here)

Tenant data is protected twice, and **both layers are required** (golden rule 6):

1. **Explicit scoping.** Drizzle connects over the pooler as the database owner,
   so **RLS does not apply to Drizzle queries.** Every Drizzle query must filter
   by `ownerId`/`businessId` taken from the session. An unscoped Drizzle query is
   a bug, not a style problem — RLS will not catch it.
2. **RLS.** Covers the paths Drizzle doesn't use: the browser Supabase client,
   Storage, and anything reached with a user JWT.

Ownership always comes from the session. Never from a form field, query param, or
anything else the client sends.

```ts
// lib/auth.ts — the only way to get the current business
const { user, business } = await requireBusiness();

// Correct: predicate on business.id from the session
await db.select().from(pricebookItems)
  .where(eq(pricebookItems.businessId, business.id));

// Mutations scope too, so one owner can't touch another's row by id
await db.update(pricebookItems)
  .set(values)
  .where(and(
    eq(pricebookItems.id, parsedId),
    eq(pricebookItems.businessId, business.id),
  ));
```

## API keys — current names only

| Use              | Key                                  | Env var                                |
| ---------------- | ------------------------------------ | -------------------------------------- |
| Browser / server | **publishable** `sb_publishable_...` | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` |
| Admin / bypass   | **secret** `sb_secret_...`           | `SUPABASE_SECRET_KEY`                  |

`anon` and `service_role` are the legacy names, deprecated end of 2026. Don't
introduce them in new code.

## Clients — keep them separate

- `lib/supabase/client.ts` — browser, publishable key, RLS enforced.
- `lib/supabase/server.ts` — Server Components / Actions / Route Handlers.
  Publishable key plus the session cookie, so RLS still applies.
- **Secret-key admin client** — does not exist yet. Add it only when something
  genuinely must bypass RLS (the public quote page in Phase 3). Server-only,
  never in a component, never in a `NEXT_PUBLIC_*` var.

## Auth

- Email/password today (`app/login/`). Google and the rest of the polish is Phase 6.
- `proxy.ts` refreshes the session cookie on every request.
- **Always `getUser()`, never `getSession()`** — only `getUser()` revalidates the
  token with Supabase; `getSession()` trusts the cookie as-is.
- `ensureProfile()` creates the `profiles` row on first authenticated request.
  Deliberately app-side rather than a database trigger so the logic lives in the repo.
- A user with no `businesses` row gets redirected to `/onboarding`.

## RLS — required on every data table

Declare policies in the Drizzle schema with `pgPolicy` + `.enableRLS()`, not as
hand-written SQL. That way `drizzle-kit generate` carries them into the migration
and won't later diff them away.

```ts
export const quotes = pgTable("quotes", { /* … */ }, (table) => [
  index("quotes_business_id_idx").on(table.businessId),
  pgPolicy("quotes_all_own_business", {
    for: "all",
    to: authenticatedRole,
    using: sql`${table.businessId} in (select id from businesses where owner_id = ${authUid})`,
    withCheck: sql`${table.businessId} in (select id from businesses where owner_id = ${authUid})`,
  }),
]).enableRLS();
```

- `authUid` from `drizzle-orm/supabase` already expands to `(select auth.uid())` —
  don't wrap it in another `select`.
- Ownership resolves **through `businesses`**, never by trusting a column.
- `for: "all"` needs `withCheck` as well as `using`, or a user can reassign a row
  to someone else.
- Seed tables (`industry_config`) get select-only policies; rows come from the seed script.

## The public quote page (`/q/[token]`) — Phase 3

- Must **not** rely on a user session; the homeowner has no account.
- Serve it server-side with the secret-key client, looked up by `public_token` only.
- Return **only** the fields the customer should see. Never spread a whole row.
- Write the `viewed` / `accepted` events server-side (SPEC §11) — the moat.

## Storage

- Bucket `logos` exists (migration `0001`). Quote photos get their own bucket in Phase 2.
- Path convention: `<auth.uid()>/<file>`. The policy checks
  `(storage.foldername(name))[1] = (select auth.uid())::text`, so a business can
  only write inside its own folder.
- **Upsert needs INSERT + SELECT + UPDATE policies.** With INSERT alone, replacing
  a logo fails silently.
- Public read is fine for images rendered on the customer quote page.
- Enforce size and MIME limits in both places: the bucket definition and
  `lib/constants.ts`.

## Migrations

- Keep migrations in the repo via Drizzle; don't hand-edit the database.
- `DIRECT_URL` (session pooler, `:5432`) runs migrations — DDL can't go through the
  transaction pooler on `:6543`. `DATABASE_URL` is for app queries.
- Storage buckets and policies live in a hand-authored `--custom` migration.

## Never

- Never put the secret key in client code or a `NEXT_PUBLIC_*` var.
- Never disable RLS to make something work — fix the policy.
- Never trust a client-sent `business_id`, price, or plan.
- Never rely on RLS to save an unscoped Drizzle query.
