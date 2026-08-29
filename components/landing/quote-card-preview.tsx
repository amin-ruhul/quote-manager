/**
 * The money shot: the screen the homeowner actually taps Accept on.
 *
 * Rebuilt from the same design tokens as the real /q/[token] page rather than
 * shipped as a screenshot — it stays sharp on every display, reflows on a
 * phone, and costs no image bytes on a page that has to load in under three
 * seconds. Replace with a real screenshot only if the live page drifts from it.
 *
 * This is the one component on the page allowed a shadow (DESIGN.md elevation).
 */
export function QuoteCardPreview() {
  return (
    <figure className="m-0">
      <div className="rounded-lg border border-hairline bg-surface p-5 shadow-quote sm:p-6">
        {/* Business identity — the part that has to look legitimate. */}
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-md bg-midnight text-xs font-semibold text-white">
            BS
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold">Bright Spark Electric</p>
            <p className="text-xs text-ink-40">License EC-124589</p>
          </div>
          <span className="ml-auto rounded-pill bg-status-accepted-bg px-2 py-0.5 text-xs font-medium text-status-accepted">
            Accepted
          </span>
        </div>

        <div className="mt-4 border-t border-hairline pt-4">
          <p className="tabular text-xs text-ink-40">Q-0007</p>
          <p className="mt-1 text-lg font-semibold text-balance">
            Kitchen lighting &amp; panel upgrade
          </p>
          <p className="mt-0.5 text-xs text-ink-60">
            Prepared for Sarah Mitchell
          </p>
        </div>

        <ul className="mt-4 divide-y divide-hairline text-sm">
          <Line name="Panel replacement (200A)" price="$2,850.00" />
          <Line name="Recessed light" detail="6 each" price="$1,110.00" />
          <Line name="Permit fee" price="$250.00" />
        </ul>

        <div className="mt-3 flex items-baseline justify-between border-t border-hairline pt-3">
          <span className="text-sm font-semibold">Total</span>
          <span className="tabular text-xl font-semibold">$4,541.09</span>
        </div>

        {/* The single decision the whole product exists for. */}
        <div className="mt-4 flex h-11 items-center justify-center rounded-md bg-status-accepted text-sm font-medium text-white">
          Accept · $4,541.09
        </div>
      </div>

      <figcaption className="mt-3 text-center text-sm text-ink-40">
        This is what your customer sees. No app, no login.
      </figcaption>
    </figure>
  );
}

function Line({
  name,
  detail,
  price,
}: {
  name: string;
  detail?: string;
  price: string;
}) {
  return (
    <li className="flex items-baseline justify-between gap-4 py-2.5">
      <span className="min-w-0">
        <span className="block truncate">{name}</span>
        {detail ? (
          <span className="tabular text-xs text-ink-40">{detail}</span>
        ) : null}
      </span>
      <span className="tabular shrink-0 font-medium">{price}</span>
    </li>
  );
}
