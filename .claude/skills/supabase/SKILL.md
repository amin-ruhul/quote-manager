---
name: supabase
description: Use when working with Supabase in QuotePilot — Auth, Row Level Security (RLS) policies, storage for logos/photos, and client-vs-server usage. Keeps tenant data isolated and secret keys server-side.
---

# Supabase (QuotePilot)

## Clients — keep them separate

- **Browser client** (anon key): only for the signed-in user's own data, protected by RLS.
- **Server client / service-role key**: server-side ONLY (Route Handlers, Server Actions,
  webhooks). NEVER import the service-role key into a client component or expose it.

## Auth

- Email/password + Google. On first sign-up, create a `profiles` row and a `businesses`
  row for that user. Get the user from the server session, never trust a client-sent id.

## Row Level Security (RLS) — REQUIRED on every data table

Enable RLS on every table and add policies so a user can only touch their own business's
rows. This is the real protection for multi-tenant data.

Example (quotes belong to a business owned by the user):

```sql
alter table quotes enable row level security;

create policy "own business quotes"
on quotes for all
using ( business_id in (
  select id from businesses where owner_id = auth.uid()
) )
with check ( business_id in (
  select id from businesses where owner_id = auth.uid()
) );
```

- The **public quote page** (`/q/[token]`) must NOT rely on the user session. Serve it
  from the server using the service-role client, looked up by the quote's `public_token`
  only — return just the fields the customer should see. Never expose other quotes.

## Storage

- Buckets for business logos and quote photos. Add storage policies so a business can
  only write to its own folder. Public read only for images shown on quote pages.

## Tips

- You can install Supabase's official agent skill for extra guidance:
  `npx skills add supabase/agent-skills`.
- Prefer the Supabase MCP tools (if connected) for schema changes and checking advisors,
  but keep migrations in the repo via Drizzle.

## Never

- Never put the service-role key in client code or `NEXT_PUBLIC_*`.
- Never disable RLS to "make it work" — fix the policy instead.
