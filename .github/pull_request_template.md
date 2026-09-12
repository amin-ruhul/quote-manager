## What and why

<!-- One or two sentences. What changed, and what problem it solves. -->

Closes #

## How to verify

<!-- The exact commands you ran, and for UI work how to check it at phone width. -->

- [ ] `npm run format:check`
- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm test`
- [ ] Checked at ~375px wide

## Project rules touched

<!-- Tick what applies and say how it is handled. Leave the rest. -->

- [ ] **Money** — stored and computed as integer cents
- [ ] **Multi-tenant** — every query scoped by `business_id`/owner, RLS in place
- [ ] **Secrets** — server-side only; nothing sensitive under `NEXT_PUBLIC_*`
- [ ] **External services** — called through their `lib/` wrapper
- [ ] **AI output** — validated against the SPEC §9 schema; unmatched items are `needs_price`
- [ ] **`quote_events`** — recorded for this flow
- [ ] **States** — loading, empty and error handled on every screen touched
- [ ] **Design** — colours, radii and type taken from `DESIGN.md`

## Left out / unsure about

<!-- Anything deliberately not done, and any decision a reviewer should check hardest. -->
