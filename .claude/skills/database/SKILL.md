---
name: database
description: Use when creating or changing database tables, Drizzle schema, migrations, or writing queries for QuotePace. Enforces the SPEC data model, money-as-cents, and safe multi-tenant queries.
---

# Database (QuotePace)

Stack: Postgres (Supabase) + Drizzle ORM. Follow the data model in SPEC §8.

## Rules

1. **IDs & time:** `uuid` primary keys (`gen_random_uuid()`), `timestamptz` timestamps
   with `default now()`.
2. **Money is integer cents.** All price/total/tax/discount columns are `integer`
   (cents). Never `float`/`numeric` for money in app logic. Convert to dollars only in UI.
3. **Generic engine.** Do NOT add electrician-specific columns to core tables. Trade
   specifics live in `pricebook_items.metadata` (jsonb) and the `industry_config` table.
4. **Multi-tenant scoping.** Every table that holds business data has a `business_id`.
   Every query filters by the current user's business. Add indexes on `business_id`
   and on all foreign keys.
5. **Relations:** define Drizzle relations so joins are typed. Use transactions when
   writing a quote + its items + options together.
6. **Migrations:** use Drizzle migrations. Never hand-edit the DB. Migrations are
   additive and reviewed; avoid destructive changes without an explicit note.
7. **Seed data:** seed one `industry_config` row for `electrician` (categories,
   default pricebook, AI instructions, default terms) so new accounts start ready.

## Tables (from SPEC §8)

profiles · businesses · customers · quotes · quote_items · quote_options ·
quote_events · quote_attachments · pricebook_items · industry_config · subscriptions.

## When writing a query, always

- Scope by `business_id` (get it from the authenticated session, never the client).
- Return typed results. Handle "not found" cleanly.
- For money math, add integers (cents); round only when converting for display.
