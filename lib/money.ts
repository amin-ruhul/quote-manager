import {
  BASIS_POINTS_PER_PERCENT,
  type Currency,
  MAX_TAX_RATE_BASIS_POINTS,
} from "@/lib/constants";

/*
 * Money is integer cents everywhere in the app and the database. These helpers
 * are the only place dollars exist, so rounding happens once, at the boundary.
 */

/** Format integer cents for display: 285000 -> "$2,850.00". */
export function formatCents(cents: number, currency: Currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

/**
 * Parse user-typed dollars into integer cents. Accepts "2850", "2,850.00",
 * "$2850.5". Returns null when the input isn't a usable amount, so callers can
 * show a friendly "Enter a price" rather than storing NaN.
 */
export function parseDollarsToCents(input: string): number | null {
  const cleaned = input.trim().replace(/[$,\s]/g, "");
  if (cleaned === "") return null;

  // Reject anything that isn't a plain positive decimal with <= 2 places.
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;

  // Work on the string, not a float: 19.99 * 100 is 1998.9999... in binary.
  const [whole = "0", fraction = ""] = cleaned.split(".");
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));

  return Number.isSafeInteger(cents) ? cents : null;
}

/** Format integer cents as a bare editable value: 285000 -> "2850.00". */
export function centsToInputValue(cents: number): string {
  return (cents / 100).toFixed(2);
}

/**
 * Parse a typed percentage into integer basis points: "8.25" -> 825.
 * Returns null on invalid or out-of-range input.
 */
export function parsePercentToBasisPoints(input: string): number | null {
  const cleaned = input.trim().replace(/[%\s]/g, "");
  if (cleaned === "") return null;
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;

  const [whole = "0", fraction = ""] = cleaned.split(".");
  const basisPoints =
    Number(whole) * BASIS_POINTS_PER_PERCENT + Number(fraction.padEnd(2, "0"));

  return basisPoints <= MAX_TAX_RATE_BASIS_POINTS ? basisPoints : null;
}

/** Format integer basis points for display: 825 -> "8.25". */
export function basisPointsToPercent(basisPoints: number): string {
  return (basisPoints / BASIS_POINTS_PER_PERCENT).toFixed(2);
}
