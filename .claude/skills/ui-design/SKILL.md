---
name: ui-design
description: Use when building or styling any screen or component in QuotePilot — layouts, forms, the dashboard, and especially the customer-facing quote page. Applies the "warm paper" design system from DESIGN.md, mobile-first.
---

# UI Design (QuotePilot)

**`DESIGN.md` in the repo root is the source of truth for the visual system.** Read it before
styling anything new. This skill is the working summary plus the behaviour rules (states,
accessibility, screen patterns) that DESIGN.md doesn't cover.

The feel: a **well-loved paper notebook under afternoon light** — warm off-white canvas, crisp
white cards held by hairline borders, near-monochrome text, a single blue for the primary action.
Calm, editorial, trustworthy. Light-first. Mobile-first. Flat.

## Who sees the screens

- The **electrician**: busy, on a phone, at a job site. Wants speed and big buttons.
- The **homeowner**: receives the quote link. Must instantly trust it looks professional.

## Principles

1. **Mobile-first.** Build for ~375px first, then `sm:`/`md:`/`lg:`. Single column, thumb-friendly,
   min 44px tap targets.
2. **Hairlines, not shadows.** Cards sit on the canvas via a 1px `--border` line. Shadows appear in
   exactly two places app-wide: the sticky nav, and the floating customer quote card.
3. **One blue per screen.** Exactly one filled chromatic button (the primary action). Everything
   else is ghost (`--brand-wash`) or text. Never two filled chromatic buttons in one view.
4. **Hierarchy from alpha, not new grays.** Black at 100/90/60/40. No full-black wall of text.
5. **Calm.** One clear action per screen. This is a money document — established, not flashy.
6. **Fast.** No heavy libraries, no layout shift. The quote page must open instantly.
7. **shadcn/ui + Tailwind** for everything. Don't hand-build inputs, buttons, dialogs, toasts.
8. **Accessible.** Semantic HTML, labels above inputs, visible focus rings, good contrast.

## Tokens (quick reference — full set in DESIGN.md)

```
canvas #F6F5F4 (page bg, never pure white)   surface #FFFFFF (cards)   surface-2 #F1F0EE (inputs, hover)
border rgba(0,0,0,.08)   border-strong rgba(0,0,0,.14)
ink 100/90/60/40 (alpha)   body #615D59
brand #0075DE   brand-wash #E6F3FE
accents (cards & pills ONLY): marigold #FFB110 · coral #F64932 · sky #62AEF0 · midnight #02093A
radius: card 12px · button 8px · pill 9999px · small 4px      base unit 4px
```

Type: **Inter** for all UI (body 400, nav/UI 500, headings 600–700). **Source Serif 4** only for
sparing editorial moments (landing, free tool) — never UI labels or nav. Display headings tighten
letter-spacing as they grow (-0.02em at 32–48px, -0.04em at 60px+).

## Component conventions

- **Primary button** — `bg-brand`, white text, weight 500, radius 8px. One per screen.
- **Ghost button** — `bg-brand-wash`, brand text. The lower-commitment sibling that
  still reads as a button. This is Button's `soft` variant.
- **Text button** — transparent, ink-90. Tertiary (Cancel). This is Button's `ghost`
  variant — the names are offset by one, because shadcn already used `ghost` for the
  transparent case. Check the variant, not the word.
- **Card** — white, 1px hairline border, radius 12px, padding 24px (16–20px on phones), **no shadow**.
- **Accent card** — full-bleed single accent hue, no border, radius 12px. Use for the dashboard
  "won this month" moment, empty states, and free-tool feature blocks. Text black or white by contrast.
- **Inputs** — `bg-surface-2`, 1px `border-strong`, radius 8px; focus = brand border + 3px brand-wash
  ring. Label above in ink-60. Inline validation, friendly errors ("Enter a price", not "invalid").
- **Status pill** — radius 9999px, small. Quote lifecycle colors:
  draft stone on surface-2 · sent `#0075DE` on brand-wash · viewed `#8A5A00` on `#FFF3D6` ·
  accepted `#0F7A38` on `#E4F4EB` · declined `#B0230F` on `#FDE7E2`.
- **Money** — always tabular (`tnum`), formatted from integer cents to `$2,850.00`. Never a float.
- **Motion** — ~200ms ease. No bounce; this is a pro tool.
- **Button rows** — Button carries `shrink-0`, so two `w-full` buttons in one flex
  row demand 200% and cannot shrink; with `flex-row-reverse` the overflow escapes
  to the left, outside its card. Use `w-full sm:w-auto`: stacked full-width on a
  phone, content-width row on desktop with the primary action on the right.

## Every screen

Loading, empty, and error states — never a blank page. Empty states are a good place for an accent
card with one clear next action.

## The customer quote page (/q/[token]) — highest priority

- No login, no PWA prompt. Opens perfectly on a phone, zero layout shift.
- Shows: business name + logo, project title, scope of work, price (or Good/Better/Best options),
  photos, terms/warranty, "valid until" date, and a large full-width **ACCEPT** button.
- The quote card is one of the two places a shadow is allowed (`0 4px 12px rgba(0,0,0,.10)`) so it
  lifts off the canvas.
- **ACCEPT button:** solid brand blue by default; solid accepted-green is the one sanctioned place
  green may be a button, for a stronger "yes" signal. Pick one and keep it consistent.
- Accept flow: optional name + signature, then a clear confirmation. Writes a `quote_events` row.
- Footer "Made with QuotePilot" on Free/Pro (removable on Business).

## Don't

- No pure-white page background. No gradients. No shadows on content cards.
- No two chromatic filled buttons in one view. No Source Serif for UI or nav.
- No accent hue in body text. No radius above 12px on rectangles (pills excepted).

## When designing something, deliver

A responsive component (mobile → desktop), all states handled, shadcn/ui primitives, tokens from
DESIGN.md, money formatted from cents, accessible markup.
