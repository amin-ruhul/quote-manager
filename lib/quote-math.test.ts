import { describe, expect, it } from "vitest";

import {
  formatQuantity,
  lineTotal,
  parseQuantity,
  quoteTotals,
  sumLines,
  taxOn,
} from "@/lib/quote-math";

describe("lineTotal", () => {
  it("multiplies a scaled quantity by a cents price", () => {
    // 1 x $185.00
    expect(lineTotal({ quantity: 100, unitPrice: 18500 })).toBe(18500);
    // 6 x $185.00
    expect(lineTotal({ quantity: 600, unitPrice: 18500 })).toBe(111000);
    // 2.5 hours x $125.00
    expect(lineTotal({ quantity: 250, unitPrice: 12500 })).toBe(31250);
  });

  it("rounds a fractional cent rather than storing a float", () => {
    // 0.33 x $10.00 = $3.30
    expect(lineTotal({ quantity: 33, unitPrice: 1000 })).toBe(330);
    // 1.5 x $0.01 = 0.015c -> 2c (half away from zero)
    expect(lineTotal({ quantity: 150, unitPrice: 1 })).toBe(2);
    expect(Number.isInteger(lineTotal({ quantity: 133, unitPrice: 999 }))).toBe(
      true,
    );
  });

  it("subtracts discount lines without the owner typing a minus", () => {
    expect(
      lineTotal({ quantity: 100, unitPrice: 5000, type: "discount" }),
    ).toBe(-5000);
  });
});

describe("sumLines", () => {
  it("sums per-line rounded totals", () => {
    expect(
      sumLines([
        { quantity: 100, unitPrice: 285000 },
        { quantity: 600, unitPrice: 18500 },
        { quantity: 250, unitPrice: 12500 },
      ]),
    ).toBe(285000 + 111000 + 31250);
  });

  it("is zero for an empty quote", () => {
    expect(sumLines([])).toBe(0);
  });
});

describe("taxOn", () => {
  it("applies a basis-point rate", () => {
    expect(taxOn(100000, 825)).toBe(8250); // $1000 @ 8.25%
    expect(taxOn(285000, 2000)).toBe(57000); // $2850 @ 20%
  });

  it("never taxes a zero or negative base", () => {
    expect(taxOn(0, 825)).toBe(0);
    expect(taxOn(-5000, 825)).toBe(0);
    expect(taxOn(100000, 0)).toBe(0);
  });
});

describe("quoteTotals", () => {
  const lines = [
    { quantity: 100, unitPrice: 285000 }, // panel swap
    { quantity: 600, unitPrice: 18500 }, // 6 recessed lights
  ];

  it("computes subtotal, tax and total in cents", () => {
    expect(quoteTotals({ lines, taxRateBasisPoints: 825 })).toEqual({
      subtotal: 396000,
      discount: 0,
      tax: 32670,
      total: 428670,
    });
  });

  it("taxes the discounted base, not the subtotal", () => {
    const result = quoteTotals({
      lines,
      discount: 96000,
      taxRateBasisPoints: 825,
    });
    expect(result.subtotal).toBe(396000);
    expect(result.discount).toBe(96000);
    expect(result.tax).toBe(taxOn(300000, 825));
    expect(result.total).toBe(300000 + result.tax);
  });

  it("clamps a discount larger than the subtotal", () => {
    const result = quoteTotals({ lines, discount: 999999 });
    expect(result.discount).toBe(396000);
    expect(result.total).toBe(0);
  });

  it("ignores a negative discount", () => {
    expect(quoteTotals({ lines, discount: -5000 }).discount).toBe(0);
  });

  it("handles an empty quote without NaN", () => {
    expect(quoteTotals({ lines: [], taxRateBasisPoints: 825 })).toEqual({
      subtotal: 0,
      discount: 0,
      tax: 0,
      total: 0,
    });
  });

  it("keeps every field an integer", () => {
    const result = quoteTotals({
      lines: [{ quantity: 133, unitPrice: 999 }],
      discount: 7,
      taxRateBasisPoints: 825,
    });
    for (const value of Object.values(result)) {
      expect(Number.isInteger(value)).toBe(true);
    }
  });
});

/*
 * A US electrician's quote mixes taxable and non-taxable work on one document —
 * Texas separated contracts tax materials but not labour. These cases are the
 * reason the flag is per line rather than per quote.
 */
describe("quoteTotals — taxable lines only", () => {
  // $200 of taxable materials, $100 of non-taxable labour.
  const mixed = [
    { quantity: 100, unitPrice: 20000, taxable: true },
    { quantity: 100, unitPrice: 10000, taxable: false },
  ];

  it("taxes only the taxable lines", () => {
    const result = quoteTotals({ lines: mixed, taxRateBasisPoints: 1000 });
    expect(result.subtotal).toBe(30000);
    // 10% of $200, not of $300.
    expect(result.tax).toBe(2000);
    expect(result.total).toBe(32000);
  });

  it("treats a line with no flag as taxable, as it behaved before", () => {
    const result = quoteTotals({
      lines: [{ quantity: 100, unitPrice: 20000 }],
      taxRateBasisPoints: 1000,
    });
    expect(result.tax).toBe(2000);
  });

  it("allocates a discount proportionally across taxable and non-taxable", () => {
    // $30 off $300 is 10%, so the $200 taxable base drops by $20 to $180.
    const result = quoteTotals({
      lines: mixed,
      discount: 3000,
      taxRateBasisPoints: 1000,
    });
    expect(result.discount).toBe(3000);
    expect(result.tax).toBe(1800);
    expect(result.total).toBe(30000 - 3000 + 1800);
  });

  it("charges no tax at all when every line is exempt", () => {
    const result = quoteTotals({
      lines: mixed.map((line) => ({ ...line, taxable: false })),
      taxRateBasisPoints: 1000,
    });
    expect(result.tax).toBe(0);
    expect(result.total).toBe(30000);
  });

  it("charges no tax for a tax-exempt customer, whatever the lines say", () => {
    const result = quoteTotals({
      lines: mixed,
      taxRateBasisPoints: 1000,
      taxExempt: true,
    });
    expect(result.tax).toBe(0);
    expect(result.total).toBe(30000);
  });

  it("keeps every field an integer when the split doesn't divide evenly", () => {
    const result = quoteTotals({
      lines: [
        { quantity: 133, unitPrice: 999, taxable: true },
        { quantity: 77, unitPrice: 333, taxable: false },
      ],
      discount: 7,
      taxRateBasisPoints: 825,
    });
    for (const value of Object.values(result)) {
      expect(Number.isInteger(value)).toBe(true);
    }
  });
});

describe("parseQuantity", () => {
  it("scales typed quantities", () => {
    expect(parseQuantity("1")).toBe(100);
    expect(parseQuantity("6")).toBe(600);
    expect(parseQuantity("2.5")).toBe(250);
    expect(parseQuantity("0.25")).toBe(25);
  });

  it("rejects zero, negative and malformed input", () => {
    expect(parseQuantity("0")).toBeNull();
    expect(parseQuantity("-2")).toBeNull();
    expect(parseQuantity("1.234")).toBeNull();
    expect(parseQuantity("abc")).toBeNull();
    expect(parseQuantity("")).toBeNull();
  });

  it("round-trips through the display formatter", () => {
    for (const quantity of [100, 250, 600, 25]) {
      expect(parseQuantity(formatQuantity(quantity))).toBe(quantity);
    }
  });
});
