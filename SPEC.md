# QuotePace — Product & Build Spec (V1 / MVP)

**Golden rules for the agent:** mobile-first always (contractors work from a phone at the customer's house); every external call (AI, email, payments) goes through one wrapper module in `/lib`; the generic quote engine must not be hardcoded to electricians (Section 8).

---

## 1. Product summary & positioning

**QuotePace helps a solo electrician win more jobs by turning a customer request into a professional quote — sent, tracked, and followed up — in about 5 minutes, from the phone, on-site.**

Do **not** position this as "business management software" or a "contractor CRM" — those categories are full of giants (Jobber, Housecall Pro, ServiceTitan). Position on the **outcome**:

> **Homepage headline:** "Win the job before you leave the driveway."
> **Sub-line:** "Describe the job, send a professional quote in minutes, and let your customer approve it from their phone."

The product is **quote-first**. Not scheduling, dispatch, inventory, or accounting. Those come later only if customers demand them.

### The sharpened wedge (why this beats Joist / Word+Email)

1. **Outcome, not feature.** Sell _won jobs_, not "fast PDFs."
2. **On-site mobile speed.** The magic moment: the electrician quotes from the customer's kitchen and the customer approves before he drives away. The mobile experience is the product — build it excellent.
3. **It manages the whole loop:** Create → Send → Track → **Get "Yes"** (with automatic follow-up). A document tool only does the first step.

---

## 2. Target customer (start narrow)

**V1 = residential electricians only.** One trade. Own it completely, then add plumbers, then HVAC (Section 15). Do not launch two trades at once.

Ideal customer:

- Solo or 1–3 person residential electrician (the owner does the quoting).
- Sends several estimates per week.
- Lives on phone/SMS/email; uses spreadsheets or Word today.
- Hates admin; does **not** want a complicated CRM.
- **US first** (largest market, highest willingness to pay, most trades online).

The underlying engine stays generic so other trades plug in later without a rewrite.

---

## 3. What it does — the core loop

```
Customer asks for a price
        ↓
Describe the job (type or speak)   ← on the phone, on-site
        ↓
AI drafts line items from the electrician's own pricebook
        ↓
Owner reviews & edits (owner controls price, always)
        ↓
Professional quote (web link) sent by email/SMS
        ↓
Customer opens on phone → taps ACCEPT
        ↓
If no answer → app follows up automatically
        ↓
Dashboard tracks: sent · viewed · accepted · won $
```

---

## 4. Moat (bake in from day 1, even if features come later)

AI is **not** a moat — competitors copy it. The real, compounding advantages, in priority:

1. **The business's own pricebook + quote history** — once their prices and past jobs live here, switching is painful. (Build in V1.)
2. **Acceptance data** — record every view/accept/decline from day 1 (the `QuoteEvent` table, Section 8) so that later you can show _"your panel quotes win 71% of the time."_ No competitor and no ChatGPT can produce this for them.
3. **Cross-business benchmarks (later)** — _"electricians like you charge $2,400 for a panel swap."_ A dataset that grows stronger every month. This is the long-term moat; design the data to allow it now.
4. **The "Powered by QuotePace" loop** — every quote is seen by a homeowner (and sometimes other contractors). This is free, built-in distribution (Section 16).

---

## 5. Scope

### In V1

- Business profile + branding (logo on quotes).
- Lightweight customer list (no full CRM).
- Pricebook (seeded with common electrician items, fully editable).
- Quote builder: line items from pricebook, manual add, totals, optional Good/Better/Best.
- AI: job description → suggested line items (matched to pricebook; never invents price).
- Customer-facing quote page (public link, no customer account) + **Accept** + optional signature.
- Photo attachments on a quote (trades need this).
- Quote lifecycle: Draft · Sent · Viewed · Accepted · Declined · Expired.
- Send by email; automatic follow-up.
- Simple dashboard (sent / accepted / acceptance rate / $ won).
- Paddle subscription billing + freemium gate.
- Free public lead-magnet tool (Section 13) — the growth engine.

### Out of V1 (Section 15 roadmap)

- SMS sending, deposit-on-accept payments, cross-business benchmarks, job→invoice→payment, scheduling, additional trades, team accounts, public API.

---

## 6. Tech stack (defaults — swappable)

| Concern                      | Choice                                                                                      |
| ---------------------------- | ------------------------------------------------------------------------------------------- |
| Framework                    | Next.js (App Router) + TypeScript                                                           |
| UI                           | Tailwind CSS + shadcn/ui, **mobile-first**                                                  |
| DB                           | Postgres via Supabase                                                                       |
| Auth                         | Supabase Auth (email/password + Google)                                                     |
| DB access                    | Drizzle ORM (typed + migrations)                                                            |
| AI                           | OpenAI SDK (`openai`)                                                                       |
| Email                        | Resend (transactional + quote delivery)                                                     |
| PDF (optional export)        | server-side HTML→PDF (e.g. Playwright/`@react-pdf`)                                         |
| Billing (your subscriptions) | **Paddle** (Merchant of Record — no US company needed; pays out to Bangladesh via Payoneer) |
| Hosting                      | Vercel                                                                                      |

> Keep the AI model id in `OPENAI_MODEL` (env), not hardcoded. Use a cheap model for suggestions (a GPT‑5 mini class model) and a stronger one where quality matters — check OpenAI's current model list for exact names.
> **Paddle note:** apply early (they vet sellers/KYC). Paddle bills the _electrician's subscription to you_ — it is NOT the same as taking a customer deposit (that's a harder flow, roadmap only, Section 15).

### PWA — make the app installable (light; for the electrician only)

Give the electrician an app-like experience without the app stores. Keep it minimal — do NOT over-build it.

**In V1 (do this, it's small):** — _built after Phase 5, ahead of Phase 6._

- Web app manifest (`app/manifest.ts`): `name`, `short_name`, theme/background colors, `display: "standalone"`, and icons (192px + 512px, plus a maskable icon and an `apple-touch-icon`). Icons are generated from one shared mark by `npm run icons:generate` (`lib/brand.ts` → `public/icons/` and `app/apple-icon.png`).
- A minimal **hand-written** service worker (`public/sw.js`) — just enough for installability + caching the hashed build assets for fast loads. **No offline features** beyond a fallback page (`public/offline.html`), which Chrome's installability check requires.
  - _Deviation from the original plan:_ `@serwist/next` was dropped. Push (Section 15) needs custom `push` / `notificationclick` handlers in the worker anyway, which means driving Serwist in `injectManifest` mode — a build plugin to keep compatible with Next 16 in exchange for precaching we don't want. The whole worker is ~60 readable lines instead.
  - **It never caches an HTML document or an API response.** Every signed-in page holds one business's customers and money, and the cache is shared across sessions in a browser profile.
- Result: the electrician taps **"Add to Home Screen"** and QuotePace opens full-screen like a native app. The nudge to do so is one dismissible card on the dashboard (`components/pwa/install-card.tsx`).
- This is for the **electrician's app only.** The public customer quote page (`/q/[token]`) stays a plain, fast web page — **never** prompt a homeowner to install. The worker is registered from the signed-in shell only, and skips `/q/` in its fetch handler.

Push notifications and real offline are roadmap (Section 15). Note that the manifest is the **precondition for push on iPhone** — Safari only allows notifications once the app is installed.

---

## 7. Environment variables

```env
NEXT_PUBLIC_APP_URL=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=   # sb_publishable_... (replaces the legacy anon key)
SUPABASE_SECRET_KEY=                    # sb_secret_...      (replaces the legacy service_role key)
DATABASE_URL=                           # transaction pooler :6543 — app queries
DIRECT_URL=                             # session pooler :5432 — migrations only

# OpenAI
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5-mini          # example — set the current model id you want

# Resend (email)
RESEND_API_KEY=
EMAIL_FROM=

# Web push (npx web-push generate-vapid-keys)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:you@yourdomain.com

# Paddle (Billing)
PADDLE_ENVIRONMENT=sandbox
PADDLE_API_KEY=
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=
PADDLE_WEBHOOK_SECRET=
NEXT_PUBLIC_PADDLE_PRICE_PRO=
NEXT_PUBLIC_PADDLE_PRICE_BUSINESS=
```

---

## 8. Data model (generic engine + industry config)

Drizzle migrations. `uuid` ids, `timestamptz` timestamps. **Keep the quote engine generic** — no electrician-specific columns; trade specifics live in `industry_config` + `pricebook_item.metadata`.

**profiles** (1:1 with auth user): `id`, `email`, `plan` (free|pro|business, default free), `paddle_customer_id`, `quotes_used_this_month`, `created_at`.

**businesses**: `id`, `owner_id`, `name`, `logo_url`, `phone`, `email`, `website`, `address`, `license_number`, `industry` (default `electrician`), `currency`, `default_tax_rate`, `settings` (jsonb), `created_at`.

**customers**: `id`, `business_id`, `first_name`, `last_name`, `company`, `phone`, `email`, `address`, `notes`.

**quotes**: `id`, `business_id`, `customer_id`, `quote_number`, `title`, `scope_of_work` (text), `status` (draft|sent|viewed|accepted|declined|expired), `subtotal`, `discount`, `tax`, `total`, `valid_until`, `public_token` (for the shareable link), `created_at`, `updated_at`.

**quote_items**: `id`, `quote_id`, `option_id` (nullable), `name`, `description`, `quantity`, `unit`, `unit_price`, `total`, `type` (fixed|qty|hourly|material|labor|permit|fee|discount).

**quote_options** (Good/Better/Best — optional): `id`, `quote_id`, `name`, `description`, `total`, `is_recommended`.

**quote_events** (THE MOAT — record everything): `id`, `quote_id`, `type` (sent|viewed|accepted|declined|follow_up_sent), `meta` (jsonb: signature name, ip, etc.), `created_at`.

**quote_attachments**: `id`, `quote_id`, `url`, `caption`.

**pricebook_items**: `id`, `business_id`, `name`, `description`, `category`, `unit`, `price`, `cost` (nullable), `metadata` (jsonb, industry-specific).

**industry_config** (seed data, not per-user): `industry`, `categories` (jsonb), `default_pricebook` (jsonb), `ai_instructions` (text), `default_terms` (text), `quote_wording` (jsonb). One row for `electrician` in V1.

**subscriptions**: `id`, `user_id`, `paddle_subscription_id`, `plan`, `status`, `current_period_end`.

---

## 9. AI quote generation (`lib/ai.ts`)

```ts
export async function draftQuote(input: {
  jobDescription: string;
  pricebook: PricebookItem[];
  industryInstructions: string; // from industry_config
}): Promise<QuoteDraft>;
```

Use OpenAI **Structured Outputs** (`response_format: { type: "json_schema", json_schema: {…}, strict: true }`) so the result is always valid JSON that matches the schema.

### Output schema (`QuoteDraft`)

```jsonc
{
  "scope_of_work": "string", // short professional paragraph
  "line_items": [
    {
      "name": "string",
      "description": "string",
      "quantity": 1,
      "unit": "each|hour|ft|job",
      "type": "fixed|qty|hourly|material|labor|permit|fee",
      "pricebook_item_id": "uuid|null", // matched item, or null
      "unit_price": 0, // ONLY if matched; else null
      "needs_price": false, // true when no pricebook match
    },
  ],
  "suggested_additions": [
    // things the job implies but owner must confirm
    { "name": "Permit", "reason": "Panel work usually requires a permit" },
  ],
}
```

### System prompt (starting point — iterate)

```
You are an estimating assistant for a residential electrician.
Turn a plain-language job description into structured quote line items.

STRICT RULES:
- Use ONLY prices from the provided pricebook JSON. NEVER invent a price.
- If a line item matches a pricebook item, return its id and unit_price.
- If there is no match, return the item with pricebook_item_id=null,
  unit_price=null, needs_price=true. The owner will set the price.
- Also list commonly-required items the description implies but didn't
  mention (permit, materials, labor) under suggested_additions — do NOT
  price these; the owner decides.
- Write a short, professional scope_of_work paragraph in plain English.
- Return ONLY the structured tool output.
```

**Safety (non-negotiable):** the owner always reviews before sending. When `needs_price` is true, the UI shows "Price not set — [Add price]". The pricebook is the single source of truth for money.

---

## 10. Pricebook & pricing models

Seed new electrician accounts from `industry_config.default_pricebook`, e.g. Panel Replacement, EV Charger Install, Outlet, Ceiling Fan, Recessed Light, Surge Protector, Grounding Upgrade — all editable.

The engine supports item `type`s: fixed price, quantity × unit price, hourly labor, material, permit, fee, discount, tax. **Good/Better/Best** is supported but optional (a quote can have one price or three options; option labels are renameable, e.g. Standard/Premium/Complete).

---

## 11. Customer-facing quote page

- Reached by a **public link** (`/q/[public_token]`) — customer needs **no account**.
- Mobile-first. Shows: business name + logo, project title, scope of work, pricing (or Good/Better/Best options), photos, terms/warranty, "valid until" date, and a big **ACCEPT** button.
- On accept: optional name + signature + date; write a `quote_events` row (type `accepted`), set quote status `accepted`.
- Opening the page writes a `viewed` event (this powers "your customer opened it").
- Footer: **"Made with QuotePace"** (the growth loop) — only on Free/Pro; removable on Business.

---

## 12. Sending, follow-up, notifications, dashboard

- **Send:** email via Resend with the quote link. (SMS is roadmap.)
- **Follow-up automation (a cron / scheduled job):** if a sent quote isn't accepted after N days, auto-send a friendly nudge ("Hi John, any questions about your electrical quote?"). Owner configures: follow up after 2 days / 5 days / stop when accepted. Log a `follow_up_sent` event. **This directly drives the "win more jobs" promise.**
- **Owner notifications:** email on quote viewed / accepted, plus a web push alert to the owner's phone on the same two events (Section 15). Both channels fire from `lib/notify-owner.ts` and are best-effort — a notification must never fail the customer's tap.
- **Dashboard:** greeting + this-month stats (Quotes sent, Accepted, Acceptance rate, $ Quoted, $ Won) + recent quotes with status. Keep it one simple screen.

---

## 13. The free lead-magnet tool (your growth engine — spec it as part of the app)

Because you won't do sales, the product must pull customers in. Build a **free, public, no-login tool** that ranks on Google and feeds signups:

- **"Free Electrician Quote Template / Job Price Calculator"** at `/free/quote-calculator`.
- Electrician enters a couple of job details → gets a clean, shareable quote they can download/email — **without an account**.
- Every output carries "Made with QuotePace" + a soft CTA: "Save your prices & send quotes that customers can approve online → Sign up free."
- Capture email to send the result (optional) → your top-of-funnel list.
- This page is SEO bait for searches like "electrician quote template", "electrical job price calculator". It brings in the exact people who become paying users.

Build this early (it can start collecting emails before the full app is polished).

---

## 14. Build phases (in order)

### Phase 0 — Scaffold

Next.js + TS + Tailwind + shadcn (mobile-first). Supabase + Drizzle configured. Paddle sandbox keys. Landing page placeholder.
**Done when:** app runs, DB connects, migrations apply.

### Phase 1 — Business profile + pricebook

Onboarding: business name, logo, contact, license, currency, tax. Editable pricebook seeded from `industry_config` (electrician).
**Done when:** an owner can set up their business and edit their pricebook; the info is ready to appear on quotes.

### Phase 2 — Customers + quote builder (manual)

Customer list. Create a quote: pick/add customer, add line items from the pricebook, edit quantities/prices, totals compute (subtotal, tax, discount, total). Optional Good/Better/Best. Attach photos.
**Done when:** an owner can hand-build a complete, correct quote and save it as a draft.

### Phase 3 — Customer quote page + Accept + tracking (the core value — shippable)

Public `/q/[token]` page (mobile-first) with scope, pricing/options, photos, terms, ACCEPT + signature. `viewed`/`accepted` events; status lifecycle. "Made with QuotePace" footer.
**Done when:** a real customer can open a link on their phone and accept, and the owner sees the status change. **This is the emotional core — get it beautiful.**

### Phase 4 — AI job → line items

`lib/ai.ts` per Section 9: description → suggested items matched to pricebook, `needs_price` handling, scope text, suggested additions. Owner review before it enters the quote.
**Done when:** typing a job description produces a good draft the owner can accept/edit in seconds; AI never sets an unmatched price.

### Phase 5 — Send + follow-up + dashboard

Email send via Resend. Follow-up cron with owner settings. Owner notifications (viewed/accepted). Dashboard stats.
**Done when:** owner sends a quote by email, gets notified on view/accept, an unanswered quote auto-nudges, and the dashboard shows sent/accepted/won.

### Phase 6 — Auth polish + Paddle billing + freemium gate

Supabase Auth (email + Google). Paddle.js checkout for Pro/Business, webhook (`/api/webhooks/paddle`, signature-verified) sets `profiles.plan`. Enforce limits (`lib/quota.ts`). Sandbox first. ~~Also add the installable PWA manifest + icons~~ — the PWA shipped early, see the PWA section.
**Done when:** a Paddle sandbox purchase unlocks the paid tier and the free tier is limited.

### Phase 7 — Free lead-magnet tool (growth)

Build `/free/quote-calculator` (Section 13) + "Powered by" loop. Can be pulled earlier to start collecting emails.
**Done when:** a stranger can generate a quote with no login and is invited to sign up.

**MVP complete after Phase 6; Phase 7 is the growth on-ramp.**

---

## 15. Post-MVP roadmap

- **SMS sending** (Twilio) — trades love text.
- ~~**Push notifications (PWA)**~~ — **built** after Phase 5, alongside the PWA shell. "Quote viewed / accepted" alerts land on the owner's phone and pull them back in.
  - `push_subscriptions` (owner-scoped, one row per device) · `lib/push.ts` (the only module that talks to web push) · `/api/push/subscribe|unsubscribe|test` · the `push` / `notificationclick` / `pushsubscriptionchange` handlers in `public/sw.js` · the toggle on the Business screen.
  - Dead subscriptions are pruned on 404/410. Devices are capped per owner. Both alerts about one quote share a tag, so the win replaces "opened" rather than stacking.
  - **On iPhone, web push only works once the app is installed to the home screen** (Apple's rule), which is why the toggle tells the owner to install first instead of showing a switch that does nothing. Android is simpler.
  - Set `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` and `VAPID_SUBJECT` (Section 7) or the feature hides itself.
- **Deposit-on-accept** — customer pays a deposit when they accept. Powerful ("get the money committed"), but it means collecting money _on behalf of other businesses_ — a marketplace/Connect flow that is **complex and harder to set up from Bangladesh**. Roadmap, not V1.
- **Benchmark data moat** — "electricians like you charge $X; quotes at this price win Y%." Built from accumulated `quote_events`.
- **More trades** — plumber → HVAC → handyman → painter → landscaper (add an `industry_config` row each; engine unchanged).
- **Job → invoice → payment** — extend accepted quotes into the rest of the job lifecycle, only if customers ask.

---

## 16. Pricing & path to $5k

- **Free:** 5 quotes/month, basic template, customer quote page, "Made with QuotePace".
- **Pro — $29/mo:** unlimited quotes, custom branding (remove badge), pricebook, tracking, email send.
- **Business — $49/mo:** everything + AI drafting, Good/Better/Best, follow-up automation, analytics (later SMS).

| Customers |  @ $29 |  @ $49 |
| --------: | -----: | -----: |
|        25 |   $725 | $1,225 |
|        50 | $1,450 | $2,450 |
|       100 | $2,900 | $4,900 |

**~100 paying electricians ≈ $5k MRR.** First milestone is **5 strangers paying**, then 25, then 100.

---

## 17. Go-to-market for a no-sales founder

You don't cold-call. The product and content pull customers in:

1. **Free calculator/template (Section 13)** ranks on Google for electrician searches → signups.
2. **"Made with QuotePace" loop** — every quote markets you to homeowners and other contractors for free.
3. **Trade communities + YouTube** — be helpful in r/electricians and electrician Facebook groups; give electrician YouTubers free Business access for an honest review.
4. **Validation without 30 cold calls:** read the **1–2 star reviews of Jobber, Housecall Pro, and Joist** on G2/Capterra to mine real pain for free; ship the free tool and watch real usage. Aim: 30 signups on the free tool → 10 try the app → **5 pay**. If 5 strangers pay $29–49/mo, keep going.

---

## 18. Conventions & guardrails for the agent

- **Mobile-first**, always — the primary user is on a phone at a job site.
- Generic quote engine; electrician specifics only in `industry_config` + `metadata`.
- AI never sets an unmatched price; owner reviews every quote before sending.
- All external calls (OpenAI, Resend, Paddle) go through `/lib` wrappers.
- Record every quote view/accept/decline in `quote_events` from day 1 (future moat).
- Never expose the Supabase secret key or any API key to the client; AI + sending run server-side.
- Keep secrets in env; validate AI output against the schema (retry once, then graceful error).
- Commit after each phase.

## 19. Definition of done (MVP)

An electrician signs up, sets up their business + pricebook, describes a job, gets an AI-drafted quote they review in seconds, sends a professional quote link, the customer opens it on their phone and taps Accept, the app auto-follows-up if they don't, the dashboard shows what's sent/accepted/won — and a free public calculator is pulling in the next electricians. All billed through Paddle, no US company required.

## 20. Names

QuotePace (working) · QuoteSnap · TradeQuote · JobQuote · QuoteFlow · FastQuote. Check name + domain before committing; don't block validation on branding.
