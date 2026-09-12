import type { Currency } from "@/lib/constants";
import { formatCents } from "@/lib/money";

/*
 * The running total, pinned.
 *
 * On a phone the keyboard takes roughly half the viewport, so a totals block at
 * the end of the document is invisible during every edit that changes it — the
 * owner cannot feel the link between changing a line and changing the price,
 * which is the core feedback loop of quoting. This is the one number that must
 * never require scrolling.
 *
 * Phone only. From lg the preview pane is on screen with the real totals block
 * in it, and a second total competing with it would be noise.
 */
export function QuoteTotalBar({
  total,
  currency,
  itemCount,
}: {
  total: number;
  currency: Currency;
  itemCount: number;
}) {
  return (
    <div className="sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-30 lg:hidden">
      <div className="flex items-baseline justify-between gap-4 rounded-lg border border-hairline bg-surface px-4 py-3 shadow-nav">
        <span className="text-sm text-ink-60">
          {itemCount} {itemCount === 1 ? "line" : "lines"}
        </span>
        <span className="flex items-baseline gap-2">
          <span className="text-sm text-ink-60">Total</span>
          <span className="tabular text-xl font-semibold">
            {formatCents(total, currency)}
          </span>
        </span>
      </div>
    </div>
  );
}
