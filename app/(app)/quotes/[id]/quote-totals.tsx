import { Panel } from "@/components/panel";
import type { Currency } from "@/lib/constants";
import { basisPointsToPercent, formatCents } from "@/lib/money";

/**
 * Totals as stored on the quote. Every figure is computed server-side by
 * lib/quote-math.ts — this only formats cents for display.
 */
export function QuoteTotals({
  subtotal,
  discount,
  tax,
  taxRate,
  taxExempt = false,
  total,
  currency,
}: {
  subtotal: number;
  discount: number;
  tax: number;
  taxRate: number;
  taxExempt?: boolean;
  total: number;
  currency: Currency;
}) {
  return (
    <Panel className="space-y-2">
      <Row label="Subtotal" value={formatCents(subtotal, currency)} />
      {discount > 0 ? (
        <Row label="Discount" value={`− ${formatCents(discount, currency)}`} />
      ) : null}
      {/* Shown whenever a rate is set, so a zero reads as considered, not lost. */}
      {taxRate > 0 ? (
        <Row
          label={
            taxExempt
              ? "Tax (customer is exempt)"
              : `Tax (${basisPointsToPercent(taxRate)}%)`
          }
          value={formatCents(tax, currency)}
        />
      ) : null}
      <div className="mt-3 flex items-baseline justify-between border-t border-hairline pt-3">
        <span className="font-semibold">Total</span>
        <span className="tabular text-xl font-semibold">
          {formatCents(total, currency)}
        </span>
      </div>
    </Panel>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between text-sm">
      <span className="text-ink-60">{label}</span>
      <span className="tabular">{value}</span>
    </div>
  );
}
