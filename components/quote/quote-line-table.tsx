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

/**
 * The itemised work, as a real table.
 *
 * A <table> rather than a list because it is tabular — and because `thead`
 * carries `display: table-header-group`, which is what makes the column
 * headings repeat on the second printed page. A list of rows cannot do that.
 *
 * Qty and Rate are columns from sm up and fold into the description cell below
 * it, so a phone never has to scroll sideways to read a price.
 */
export function LineTable({
  lines,
  currency,
}: {
  lines: Line[];
  currency: Currency;
}) {
  return (
    <table className="mt-3 w-full border-collapse text-left">
      <thead>
        <tr className="border-b border-ink-90/20">
          <Th>Description</Th>
          <Th className="hidden text-right sm:table-cell">Qty</Th>
          <Th className="hidden text-right sm:table-cell">Rate</Th>
          <Th className="text-right">Amount</Th>
        </tr>
      </thead>

      <tbody>
        {lines.map((line) => (
          <tr key={line.id} className="border-b border-hairline align-top">
            <td className="py-3 pr-4">
              <p className="font-medium">{line.name}</p>
              {line.description ? (
                <p className="mt-0.5 text-sm text-ink-60">{line.description}</p>
              ) : null}
              {/* The two columns that are hidden on a phone, inline instead. */}
              <p className="tabular mt-0.5 text-sm text-ink-60 sm:hidden">
                {formatQuantity(line.quantity)} {line.unit} ×{" "}
                {formatCents(line.unitPrice, currency)}
              </p>
            </td>

            <td className="tabular hidden py-3 text-right text-sm whitespace-nowrap text-ink-60 sm:table-cell">
              {formatQuantity(line.quantity)} {line.unit}
            </td>
            <td className="tabular hidden py-3 pl-4 text-right text-sm whitespace-nowrap text-ink-60 sm:table-cell">
              {formatCents(line.unitPrice, currency)}
            </td>
            <td className="tabular py-3 pl-4 text-right font-medium whitespace-nowrap">
              {formatCents(line.total, currency)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Th({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <th
      scope="col"
      className={`pb-2 text-xs font-medium tracking-wide text-ink-60 uppercase ${className}`}
    >
      {children}
    </th>
  );
}

/**
 * Subtotal through total, right-aligned under the Amount column.
 *
 * Narrow and pushed right on purpose: the eye reads down the amounts and lands
 * on the total, rather than tracking across the full page width for each row.
 */
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
    <div className="mt-4 flex justify-end">
      <div className="w-full max-w-xs space-y-2">
        <Row label="Subtotal" value={formatCents(subtotal, currency)} />

        {discount > 0 ? (
          <Row
            label="Discount"
            value={`− ${formatCents(discount, currency)}`}
          />
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

        <div className="flex items-baseline justify-between border-t-2 border-ink-90/20 pt-3">
          <span className="font-semibold">Total</span>
          <span className="tabular text-2xl font-semibold">
            {formatCents(total, currency)}
          </span>
        </div>
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
