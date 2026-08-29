import { BASIS_POINTS_PER_PERCENT, QUANTITY_SCALE } from "@/lib/constants";

/*
 * Every quote calculation lives here, so the arithmetic is in one tested place.
 *
 * Rules:
 * - All money is integer cents. All quantities are integers scaled by
 *   QUANTITY_SCALE (2.5 -> 250). Nothing is ever a float.
 * - Rounding happens once per line, with Math.round, then lines are summed.
 *   Summing first and rounding once would drift from what the customer sees on
 *   the printed quote, where each line is already rounded.
 */

export type LineInput = {
  quantity: number;
  unitPrice: number;
  type?: string;
};

export type QuoteTotals = {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
};

/**
 * A single line's total in cents. Discount lines are stored with a positive
 * price and subtracted here, so the owner never has to type a minus sign.
 */
export function lineTotal(line: LineInput): number {
  const magnitude = Math.round(
    (line.quantity * line.unitPrice) / QUANTITY_SCALE,
  );
  return line.type === "discount" ? -magnitude : magnitude;
}

/** Sum of line totals, in cents. */
export function sumLines(lines: LineInput[]): number {
  return lines.reduce((running, line) => running + lineTotal(line), 0);
}

/**
 * Tax in cents on an already-discounted base, from a rate in basis points
 * (8.25% is 825). Never taxes a negative base.
 */
export function taxOn(
  taxableCents: number,
  taxRateBasisPoints: number,
): number {
  if (taxableCents <= 0 || taxRateBasisPoints <= 0) return 0;
  return Math.round(
    (taxableCents * taxRateBasisPoints) /
      (BASIS_POINTS_PER_PERCENT * BASIS_POINTS_PER_PERCENT),
  );
}

/**
 * The whole quote, in cents.
 *
 * `discount` is a quote-level amount the owner enters, on top of any discount
 * lines. It is clamped so a quote can never total less than zero.
 */
export function quoteTotals({
  lines,
  discount = 0,
  taxRateBasisPoints = 0,
}: {
  lines: LineInput[];
  discount?: number;
  taxRateBasisPoints?: number;
}): QuoteTotals {
  const subtotal = sumLines(lines);
  const appliedDiscount = Math.min(
    Math.max(discount, 0),
    Math.max(subtotal, 0),
  );
  const taxable = subtotal - appliedDiscount;
  const tax = taxOn(taxable, taxRateBasisPoints);

  return {
    subtotal,
    discount: appliedDiscount,
    tax,
    total: taxable + tax,
  };
}

/** Parse a typed quantity ("2.5") into the scaled integer. Null when unusable. */
export function parseQuantity(input: string): number | null {
  const cleaned = input.trim();
  if (cleaned === "") return null;
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;

  const [whole = "0", fraction = ""] = cleaned.split(".");
  const scaled =
    Number(whole) * QUANTITY_SCALE + Number(fraction.padEnd(2, "0"));

  if (scaled <= 0) return null;
  return Number.isSafeInteger(scaled) ? scaled : null;
}

/** Format a scaled quantity for display: 250 -> "2.5", 100 -> "1". */
export function formatQuantity(quantity: number): string {
  const value = quantity / QUANTITY_SCALE;
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}
