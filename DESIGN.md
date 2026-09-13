# QuotePace — DESIGN.md (Notion-inspired "warm paper" system)

Build every screen to this system. The feel: a **well-loved paper notebook under afternoon
light** — a warm off-white canvas, crisp white cards held by **hairline borders (no shadows)**,
near-monochrome text with a **single blue** for the primary action, and color used sparingly
as punctuation (accent-hued cards, status pills). Calm, editorial, trustworthy — exactly right
for a quote a homeowner must believe. Light-first. Mobile-first. Flat — **no gradients**.

Reference brands: Notion, Linear, Stripe, Craft. When in doubt: fewer colors, more whitespace,
hairlines not shadows.

## Fonts (Google Fonts)

```html
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Serif+4:opsz,wght@8..60,400&display=swap"
/>
```

- **Inter** — everything (body 400, UI/nav 500, headings 600–700).
- **Source Serif 4** — optional, used _sparingly_ (landing/free-tool intros, a pull-quote) for
  editorial voice. Never for UI labels or nav.
- **Money & numbers:** Inter with `font-feature-settings: "tnum"` (tabular). Format cents → `$2,850.00`.
- **Display headings:** tighten letter-spacing as size grows: ~ -0.04em at 60px+, -0.02em at 32–48px,
  normal at body sizes. This is the signature "confident, compact" headline feel.

## Color tokens

### Core (light — the identity)

```
--canvas:      #F6F5F4   /* warm off-white — the PAGE background. never pure white. */
--surface:     #FFFFFF   /* cards / panels — reads as "on top of the page" */
--surface-2:   #F1F0EE   /* subtle fills, input backgrounds, hover */
--border:      rgba(0,0,0,0.08)   /* hairline card/border — used INSTEAD of shadows */
--border-strong: rgba(0,0,0,0.14) /* inputs, stronger dividers */

--ink:         #000000   /* text — used at alpha 100/95/60/40, NOT always full */
--ink-90:      rgba(0,0,0,0.90)
--ink-60:      rgba(0,0,0,0.60)   /* = Stone #757575, secondary text. THE FLOOR for text. */
--ink-40:      rgba(0,0,0,0.40)   /* NOT FOR TEXT — see below */
--body:        #615D59   /* Graphite — warm body text that harmonizes with the canvas */

--brand:       #0075DE   /* Notion Blue — the ONE chromatic filled button, links, active nav */
--brand-wash:  #E6F3FE   /* Sky Tint — ghost button bg, soft hover, "sent" status */
```

> **`--ink-40` is not a text colour.** It resolves to `#999999`: **2.85:1** on white and
> **2.65:1** on the canvas. WCAG AA needs **4.5:1** for normal text and **3:1** for meaningful
> icons, so it fails everywhere it is read. `--ink-60` (`#666666`) is **5.74:1** and passes.
>
> **`--ink-60` is the floor for anything a user has to read** — hints, captions, table headers,
> timestamps, units, chart labels, inactive nav icons. Hierarchy below that comes from **size and
> weight, not more transparency.**
>
> `--ink-40` survives only for marks that carry no information on their own: the `—` standing in
> for an empty cell, and input `placeholder` text (which must never be the only label).

### Accent cast (for colored cards & pills only — never for body text)

```
--marigold: #FFB110   --coral: #F64932   --sky: #62AEF0   --saffron: #E89D01
--mocha:    #B18164   --midnight: #02093A  (dark "island" panels, white text)
```

### Status (quote lifecycle)

```
--st-draft:    Stone   text rgba(0,0,0,.55) on --surface-2
--st-sent:     Blue    text #0075DE on --brand-wash
--st-viewed:   Marigold text #8A5A00 on #FFF3D6
--st-accepted: Green   text #0F7A38 on #E4F4EB   /* added: the palette had no status-green;
                                                    a quoting app needs a clear "won" state */
--st-declined: Coral   text #B0230F on #FDE7E2
```

> Note: the Notion source palette is marketing-focused and had no success-green. QuotePace
> needs a clear **Accepted / Won** signal, so `--st-accepted` green is a deliberate, restrained
> extension. Everything else stays faithful.

### Optional dark theme (later — keep light as the identity)

If you add dark: canvas `#17161A`, surface `#201F24`, border `rgba(255,255,255,.10)`, text
white at alpha, brand `#4C9BEA`. Keep it optional; the warm-light look is the brand.

## Shape & spacing

```
--radius-card: 12px   --radius-btn: 8px   --radius-pill: 9999px   --radius-sm: 4px
base unit: 4px   ·   element gap: 8px   ·   card padding: 24px (16–20px on phones)
section gap: 80px (marketing) / 24–32px (in-app)   ·   content max-width: ~1200px
```

## App shell: white chrome, warm page

The signed-in app has three pieces of chrome — the left rail, the top bar, the phone
tab bar — and all three are `--surface` with a hairline on the edge that meets content.
The page behind them stays `--canvas`.

This is not an inversion: the page is still warm paper, and cards are still white islands
on it. The chrome is simply a different plane. Canvas chrome on a canvas page has nothing
to separate it from the content — a sticky bar in the same colour as the thing scrolling
under it reads as absent, which is exactly what happened to the first top bar.

**No shadow on any of it.** A sticky nav is allowed elevation, but the app chrome does not
need it once it is a different surface from the page — the hairline already lands the edge.
The rail has never had one, so a shadow on the bar made two sides of the same frame behave
differently. `--shadow-nav` stays for the marketing nav, which sits on the canvas it scrolls
over and has nothing else to separate it.

## Elevation (used almost nowhere — this is the point)

- **Cards: NO shadow.** Separate them from the canvas with the 1px `--border` hairline only.
- Shadows appear in exactly two places: the sticky **nav** (`0 .7px 1.5px rgba(0,0,0,.015), 0 3px 9px rgba(0,0,0,.03)`)
  and the floating **customer quote card / product mockup** (`0 4px 12px rgba(0,0,0,.10)`) so it lifts off the page.

## Components (map to QuotePace)

- **Primary button** — bg `--brand`, white text, weight 500, radius 8px, padding 6–12px×15px.
  The ONLY filled chromatic button on a screen (Send quote, Generate quote).
- **Ghost button** — bg `--brand-wash`, text `--brand`. The lower-commitment sibling (Preview).
- **Text button** — transparent, `--ink-90`. Tertiary actions (Cancel).
- **Customer ACCEPT button** — by the Notion rule this is the screen's single primary → solid
  `--brand` blue, full-width, larger. _Sanctioned exception:_ if you want stronger "yes" signal,
  make Accept solid `--st-accepted` green — that's the one place green may be a button.
- **Inputs** — bg `--surface-2`, 1px `--border-strong`, radius 8px; focus = `--brand` border +
  3px `--brand-wash` ring. Label above in `--ink-60`.
- **Card** — bg `--surface`, 1px `--border`, radius 12px, padding 24px, **no shadow**.
- **Accent card** — full-bleed single accent hue (marigold/coral/sky/midnight), no border, radius
  12px. Use for: dashboard "won this month" celebration, empty states, the free-tool landing
  feature blocks. Text inside is black or white by contrast.
- **Status pill** — radius 9999px, small, per the status table above.
- **Hero highlight pill** — wraps ONE verb in a headline (e.g. "**Win** the job before you leave
  the driveway") in a marigold/coral pill. The signature typographic move — use on the landing
  and free tool.
- **Money** — always tabular, formatted from cents.

## Do

- Warm `#F6F5F4` canvas, white cards. Never invert (never a warm card on a white page).
- One blue primary action per screen; everything else ghost/text.
- Build text hierarchy with black **alpha** (100/90/60), not new grays. 60 is the floor — below it,
  use size and weight instead of more transparency.
- Separate cards with **1px hairlines, not shadows**.
- Put color in **card backgrounds and pills**, not in multiple buttons.
- 12px cards, 8px buttons, 9999px pills, 4px small. Nothing more rounded than 12px except pills.
- Keep motion ~200ms ease; save any springy bounce for tiny playful marks, used rarely (this is a
  pro tool, not a toy).

## Don't

- No pure-white page background. No gradients. No shadows on content cards.
- No two chromatic filled buttons in one view. No Source Serif for UI/nav.
- No full-black wall of text — use alpha. No radius bigger than 12px on rectangles.
- **Never `text-ink-40`.** It fails contrast at every size. Placeholders and empty-cell dashes only.

## Tailwind config (extend theme — back with CSS vars so values stay in one place)

```js
colors: {
  canvas: "#F6F5F4", surface: "#FFFFFF", "surface-2": "#F1F0EE",
  brand: { DEFAULT: "#0075DE", wash: "#E6F3FE" },
  body: "#615D59",
  marigold:"#FFB110", coral:"#F64932", sky:"#62AEF0", saffron:"#E89D01",
  mocha:"#B18164", midnight:"#02093A",
  good:"#16A34A", bad:"#DC2626",
},
fontFamily: { sans:['Inter','system-ui','sans-serif'], serif:['"Source Serif 4"','serif'] },
borderRadius: { sm:"4px", btn:"8px", card:"12px" },
```

Set `body { background:#F6F5F4 }`, `card border: 1px solid rgba(0,0,0,.08)` with no shadow, and
tabular numerals on all money.

```

```
