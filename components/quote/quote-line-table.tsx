import type { Currency } from "@/lib/constants";
import { basisPointsToPercent, formatCents } from "@/lib/money";
import { formatQuantity } from "@/lib/quote-math";

type Line = {
  id: string;
  name: string;
  description: string | null;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
  type: string;
};

/** The itemised work. Quantities are only shown when they add information. */
export function LineTable({
  lines,
  currency,
}: {
  lines: Line[];
  currency: Currency;
}) {
  return (
    <ul className="divide-y divide-hairline">
      {lines.map((line) => (
        <li key={line.id} className="flex items-start gap-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="font-medium">{line.name}</p>
            {line.description ? (
              <p className="mt-1 text-sm text-ink-60">{line.description}</p>
            ) : null}
            {line.quantity !== 100 || line.unit !== "job" ? (
              <p className="tabular mt-1 text-sm text-ink-60">
                {formatQuantity(line.quantity)} {line.unit} ×{" "}
                {formatCents(line.unitPrice, currency)}
              </p>
            ) : null}
          </div>
          <span className="tabular shrink-0 font-medium">
            {formatCents(line.total, currency)}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function TotalsBlock({
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
    <div className="mt-4 space-y-2 border-t border-hairline pt-4">
      <Row label="Subtotal" value={formatCents(subtotal, currency)} />
      {discount > 0 ? (
        <Row label="Discount" value={`− ${formatCents(discount, currency)}`} />
      ) : null}
      {/*
        Shown whenever a rate is set, even when the tax comes to zero — a
        customer who is exempt, or whose lines are all non-taxable, should see
        that tax was considered and came to nothing rather than wonder whether
        it was forgotten.
      */}
      {taxRate > 0 ? (
        <Row
          label={
            taxExempt
              ? "Tax (exempt)"
              : `Tax (${basisPointsToPercent(taxRate)}%)`
          }
          value={formatCents(tax, currency)}
        />
      ) : null}
      <div className="flex items-baseline justify-between border-t border-hairline pt-3">
        <span className="font-semibold">Total</span>
        <span className="tabular text-2xl font-semibold">
          {formatCents(total, currency)}
        </span>
      </div>
    </div>
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
