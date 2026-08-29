# QuotePilot — Project Rules

QuotePilot is a quote-first SaaS for **residential electricians** (V1). It turns a
job description into a professional quote that is sent, tracked, and followed up.
The full plan lives in `SPEC.md` — always follow it and build **phase by phase**
(SPEC §14). Do not jump ahead to later phases. The visual system lives in `DESIGN.md`
— read it before building or styling any screen.

## Stack

Next.js (App Router) + TypeScript · Tailwind CSS + shadcn/ui · Supabase (Postgres + Auth)
· Drizzle ORM · OpenAI SDK · Resend (email) · Paddle (billing) · Vercel.

## Golden rules (follow on EVERY task)

1. **Mobile-first, always.** The main user is an electrician on a phone at a job site.
   Design and test for small screens first; large tap targets; fast load.
2. **Build phase by phase** per `SPEC.md` §14. Implement only the requested phase.
   At the end, list how to verify the phase's acceptance criteria.
3. **TypeScript strict.** No `any` unless justified in a comment. Type all data.
4. **Wrap external services.** All calls to OpenAI, Resend, Paddle, and the
   Supabase admin client go through one module in `/lib` (e.g. `lib/ai.ts`,
   `lib/email.ts`, `lib/billing.ts`, `lib/db.ts`). No raw external calls in components.
5. **Server-side secrets only.** AI calls, email, billing, and any use of the
   Supabase service-role key run server-side. NEVER expose secret keys to the client.
6. **Multi-tenant safety.** Every business owns its own data. Every DB query is
   scoped by `business_id`/owner, AND protected by Row Level Security (see the
   supabase skill). Never trust the client to send the right business_id.
7. **Money as integer cents.** Store all money as integers (cents). Never use floats
   for money. Format to dollars only in the UI.
8. **AI never sets an unmatched price.** The pricebook is the source of truth. If the
   AI can't match a pricebook item, mark it `needs_price` and let the owner set it.
   The owner reviews every quote before it is sent.
9. **Record `quote_events`** (sent / viewed / accepted / declined / follow_up_sent)
   from day one. This is the product's long-term moat — never skip it.
10. **Validate AI output** against the schema in SPEC §9. On invalid output, retry
    once, then show a graceful error. Never crash on model output.
11. **Prefer boring, well-documented libraries.** Small, single-purpose functions.
    No clever abstractions before they're needed.
12. **Every screen handles loading, empty, and error states.** No blank screens.
13. **Commit after each phase.** Clear messages.

## Design system — read `DESIGN.md` before any UI work

`DESIGN.md` is the source of truth for how QuotePilot looks. Never style a screen from
memory or invent a color, radius, or font — open `DESIGN.md` first. The short version:

- **Warm paper.** Canvas `#F6F5F4` (never a pure-white page), white cards, flat — no gradients.
- **Hairlines, not shadows.** Cards are separated by a 1px `rgba(0,0,0,.08)` border. Shadows
  exist in exactly two places: the sticky nav and the floating customer quote card.
- **One blue per screen.** A single filled `#0075DE` primary action; everything else is
  ghost (`#E6F3FE` wash) or text. Never two filled chromatic buttons in one view.
- **Hierarchy from black alpha** (100/90/60/40), not new grays. Accent hues (marigold, coral,
  sky, midnight) go in card backgrounds and pills only — never body text.
- **Inter** for all UI; Source Serif 4 only for sparing editorial moments, never nav or labels.
- **Money is tabular** (`tnum`), formatted from integer cents → `$2,850.00`.
- **Radius:** card 12px · button 8px · pill 9999px · small 4px. Nothing rounder.

## Skills

Deep guides live in `.claude/skills/`. Use them when relevant:

- `ui-design` — the working summary of `DESIGN.md` plus screen behaviour (states, a11y).
- `database` — schema, Drizzle, migrations, money, multi-tenant queries.
- `supabase` — auth, Row Level Security, storage, safe key usage.

## Code quality standards

- Simplicity first: build only the current phase; rule of three before abstracting.
- Folder structure: app/ (routes), components/ (ui + features), lib/ (wrappers + utils),
  db/ (schema + migrations), types/. Server logic never in client components.
- Naming: files kebab-case, components PascalCase, DB tables snake_case plural; names
  state intent.
- One source of truth: infer types from Drizzle; statuses/limits/plans in lib/constants.ts;
  no magic strings or numbers.
- Validate all input at boundaries with Zod; trust nothing from the client.
- Errors: never swallowed; friendly user messages; log server errors with context.
- Split files/functions over ~200 lines; comments explain why; no dead code or stray logs.
- Consistency over cleverness: one pattern per concern, repeated.
- Tests for money math, AI parsing, and the accept-quote flow — not everything.
- Rate-limit the free tool, public quote page, and AI calls (cost + abuse control).
