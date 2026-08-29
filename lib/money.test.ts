import { describe, expect, it } from "vitest";

import {
  basisPointsToPercent,
  centsToInputValue,
  formatCents,
  parseDollarsToCents,
  parsePercentToBasisPoints,
} from "@/lib/money";

describe("parseDollarsToCents", () => {
  it("parses plain and decorated amounts", () => {
    expect(parseDollarsToCents("2850")).toBe(285000);
    expect(parseDollarsToCents("2850.00")).toBe(285000);
    expect(parseDollarsToCents("$2,850.00")).toBe(285000);
    expect(parseDollarsToCents(" 2850 ")).toBe(285000);
  });

  it("keeps precision that a float would lose", () => {
    // 19.99 * 100 === 1998.9999999999998 in binary floating point.
    expect(parseDollarsToCents("19.99")).toBe(1999);
    expect(parseDollarsToCents("0.07")).toBe(7);
    expect(parseDollarsToCents("1.1")).toBe(110);
    expect(parseDollarsToCents("1234.56")).toBe(123456);
  });

  it("returns null rather than NaN for unusable input", () => {
    expect(parseDollarsToCents("")).toBeNull();
    expect(parseDollarsToCents("abc")).toBeNull();
    expect(parseDollarsToCents("-50")).toBeNull();
    expect(parseDollarsToCents("1.234")).toBeNull();
    expect(parseDollarsToCents("1.2.3")).toBeNull();
  });

  it("round-trips through the input formatter", () => {
    for (const cents of [0, 7, 110, 1999, 285000]) {
      expect(parseDollarsToCents(centsToInputValue(cents))).toBe(cents);
    }
  });
});

describe("formatCents", () => {
  it("formats cents as currency", () => {
    expect(formatCents(285000)).toBe("$2,850.00");
    expect(formatCents(0)).toBe("$0.00");
    expect(formatCents(7)).toBe("$0.07");
  });
});

describe("parsePercentToBasisPoints", () => {
  it("parses percentages into basis points", () => {
    expect(parsePercentToBasisPoints("8.25")).toBe(825);
    expect(parsePercentToBasisPoints("0")).toBe(0);
    expect(parsePercentToBasisPoints("20%")).toBe(2000);
  });

  it("rejects out-of-range and malformed rates", () => {
    expect(parsePercentToBasisPoints("101")).toBeNull();
    expect(parsePercentToBasisPoints("abc")).toBeNull();
    expect(parsePercentToBasisPoints("")).toBeNull();
  });

  it("round-trips through the display formatter", () => {
    for (const basisPoints of [0, 825, 2000]) {
      expect(parsePercentToBasisPoints(basisPointsToPercent(basisPoints))).toBe(
        basisPoints,
      );
    }
  });
});
