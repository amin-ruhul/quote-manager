import { describe, expect, it } from "vitest";

import {
  isQuoteLocked,
  LOCKED_QUOTE_STATUSES,
  QUOTE_STATUSES,
  type QuoteStatus,
} from "@/lib/constants";

/*
 * An accepted quote is the record of what a customer agreed to, so its contents
 * are fixed (SPEC §9 — the quote_events trail has to keep describing a document
 * that still exists). These guard the rule itself; `requireEditableQuote` in
 * lib/quotes.ts is what applies it to every mutating action.
 */

describe("isQuoteLocked", () => {
  it("locks an accepted quote", () => {
    expect(isQuoteLocked("accepted")).toBe(true);
  });

  it("leaves every other status editable", () => {
    const editable = QUOTE_STATUSES.filter((s) => s !== "accepted");

    for (const status of editable) {
      expect(isQuoteLocked(status)).toBe(false);
    }
  });

  it("keeps declined editable, so a lost job can be requoted", () => {
    // The deliberate asymmetry: nothing was agreed, so reworking the price and
    // trying again is the point. Accepting is what closes the document.
    expect(isQuoteLocked("declined")).toBe(false);
    expect(isQuoteLocked("expired")).toBe(false);
  });

  it("only locks statuses that actually exist", () => {
    for (const status of LOCKED_QUOTE_STATUSES) {
      expect(QUOTE_STATUSES).toContain(status);
    }
  });

  it("agrees with the locked list for every status in the lifecycle", () => {
    // Catches a status being added to one list and not the other.
    for (const status of QUOTE_STATUSES) {
      const expected = (
        LOCKED_QUOTE_STATUSES as readonly QuoteStatus[]
      ).includes(status);
      expect(isQuoteLocked(status)).toBe(expected);
    }
  });
});
