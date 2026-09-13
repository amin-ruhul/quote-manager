/**
 * The three mini-UIs that sit inside the How it works steps.
 *
 * Built from the real design tokens rather than shipped as screenshots — same
 * reasoning as `quote-card-preview`: sharp on every display, reflows on a
 * phone, and costs no image bytes on a page that has to load fast on site.
 * These are illustrations of real screens; if the app drifts, update them.
 *
 * They are decorative in the accessibility sense — every claim they make is
 * also made in the step's prose — so each is marked `aria-hidden` and the
 * screen-reader user reads three clean paragraphs instead of stray fragments.
 */

/**
 * Step 01 — searching your own pricebook and tapping lines in.
 *
 * Deliberately the free path rather than the AI description box this used to
 * show: the picture beside a step is read as "this is what you get", and AI
 * drafting is granted by hand while we test it. The step's prose still mentions
 * AI as the other way in.
 */
export function BuildMockup() {
  return (
    <Frame>
      <p className="text-[0.65rem] font-medium tracking-[0.08em] text-ink-60 uppercase">
        Add from your pricebook
      </p>

      <div className="mt-2 flex items-center gap-2 rounded-md border border-hairline-strong bg-surface-2 px-3 py-2.5">
        <svg viewBox="0 0 16 16" className="size-3.5 shrink-0 text-ink-60">
          <circle
            cx="7"
            cy="7"
            r="4.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
          />
          <path
            d="M10.5 10.5L14 14"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
        <p className="text-sm text-ink-90">
          panel
          <span className="ml-0.5 inline-block h-4 w-px translate-y-0.5 bg-brand" />
        </p>
      </div>

      <ul className="mt-2.5 space-y-1.5">
        <PricebookLine name="Panel replacement (200A)" price="$2,850.00" />
        <PricebookLine name="Recessed light — each" price="$185.00" />
      </ul>

      <p className="mt-3 flex items-center gap-1.5 text-[0.7rem] font-medium text-brand">
        <span className="size-1.5 rounded-pill bg-brand" />
        Your prices, already set
      </p>
    </Frame>
  );
}

/** A pricebook row, with the tap target that puts it on the quote. */
function PricebookLine({ name, price }: { name: string; price: string }) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-md border border-hairline bg-surface px-2.5 py-2 text-xs">
      <span className="min-w-0 truncate text-ink-90">{name}</span>
      <span className="flex shrink-0 items-center gap-2">
        <span className="tabular font-medium">{price}</span>
        <span className="flex size-4 items-center justify-center rounded-sm bg-brand-wash text-[0.7rem] leading-none font-medium text-brand">
          +
        </span>
      </span>
    </li>
  );
}

/**
 * Step 02 — the review screen, with the unmatched line flagged.
 *
 * This mockup exists to show the rule the product will not break: the AI never
 * sets a price it could not find in the pricebook, so the third line is empty
 * and waiting for the owner. It is the most trust-building thing on the page.
 */
export function ReviewMockup() {
  return (
    <Frame>
      <div className="flex items-center justify-between">
        <p className="text-[0.65rem] font-medium tracking-[0.08em] text-ink-60 uppercase">
          Review before sending
        </p>
        <span className="rounded-pill bg-status-draft-bg px-1.5 py-0.5 text-[0.65rem] font-medium text-status-draft">
          Draft
        </span>
      </div>

      <ul className="mt-3 divide-y divide-hairline">
        <ReviewLine name="Panel replacement (200A)" price="$2,850.00" />
        <ReviewLine name="Recessed light" detail="6 each" price="$1,110.00" />

        {/* The needs_price case, shown rather than described. */}
        <li className="flex items-baseline justify-between gap-3 py-2 text-xs">
          <span className="min-w-0 truncate text-ink-90">
            Permit — city of Leeds
          </span>
          <span className="shrink-0 rounded-sm bg-status-viewed-bg px-1.5 py-0.5 text-[0.65rem] font-medium text-status-viewed">
            Set price
          </span>
        </li>
      </ul>

      <div className="mt-2 flex items-baseline justify-between border-t border-hairline pt-2">
        <span className="text-xs font-semibold">Total so far</span>
        <span className="tabular text-sm font-semibold">$3,960.00</span>
      </div>

      <div className="mt-3 flex h-8 items-center justify-center rounded-md bg-brand text-xs font-medium text-white">
        Send quote
      </div>
    </Frame>
  );
}

function ReviewLine({
  name,
  detail,
  price,
}: {
  name: string;
  detail?: string;
  price: string;
}) {
  return (
    <li className="flex items-baseline justify-between gap-3 py-2 text-xs">
      <span className="min-w-0">
        <span className="block truncate text-ink-90">{name}</span>
        {detail ? (
          <span className="tabular text-[0.65rem] text-ink-60">{detail}</span>
        ) : null}
      </span>
      <span className="tabular shrink-0 font-medium">{price}</span>
    </li>
  );
}

/** Step 03 — the customer's phone, mid-accept, and the event it writes. */
export function AcceptMockup() {
  return (
    <Frame>
      {/* A phone-shaped inner frame: the only screen in the flow the
          electrician never touches, so it should look like someone else's. */}
      <div className="mx-auto w-full max-w-[13rem] rounded-lg border border-hairline bg-surface p-3">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-sm bg-midnight text-[0.6rem] font-semibold text-white">
            BS
          </span>
          <p className="truncate text-[0.7rem] font-semibold">
            Bright Spark Electric
          </p>
        </div>

        <p className="mt-2.5 text-[0.7rem] text-ink-60">Total</p>
        <p className="tabular text-lg font-semibold">$4,541.09</p>

        <div className="mt-2.5 flex h-9 items-center justify-center rounded-md bg-status-accepted text-[0.7rem] font-medium text-white">
          Accept · $4,541.09
        </div>
        <p className="mt-1.5 text-center text-[0.6rem] text-ink-60">
          Sign with your name
        </p>
      </div>

      {/* The quote_event the tap writes — the product's long-term moat, and
          the reason the electrician gets told at all. */}
      <div className="mt-3 flex items-center gap-2 rounded-md border border-hairline bg-surface px-2.5 py-2">
        <span className="size-1.5 shrink-0 rounded-pill bg-status-accepted" />
        <p className="truncate text-[0.7rem] text-ink-90">
          <span className="font-medium">Accepted</span> by Sarah Mitchell
        </p>
        <span className="tabular ml-auto shrink-0 text-[0.65rem] text-ink-60">
          2 min ago
        </span>
      </div>
    </Frame>
  );
}

/** The shared inset the three mockups sit in. */
function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mt-5 rounded-lg border border-hairline bg-surface-2 p-3 select-none"
      aria-hidden
    >
      {children}
    </div>
  );
}
