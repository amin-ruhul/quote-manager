import { describe, expect, it } from "vitest";

import { pushTagForQuote } from "@/lib/constants";
import { acceptedNotification, viewedNotification } from "@/lib/push-templates";
import { formatCents } from "@/lib/money";

/*
 * The alert text is what the owner actually reads on a lock screen, and it
 * carries money — so it gets the same scrutiny as the quote totals.
 */

describe("accepted alert", () => {
  it("leads with the win and shows the money in full", () => {
    const alert = acceptedNotification({
      customerName: "John Smith",
      quoteTitle: "Panel replacement",
      totalFormatted: formatCents(285000, "USD"),
    });

    expect(alert.title).toBe("You won the job");
    expect(alert.body).toBe(
      "John Smith accepted Panel replacement — $2,850.00",
    );
  });

  it("stays readable when the quote has no customer", () => {
    const alert = acceptedNotification({
      customerName: null,
      quoteTitle: "EV charger install",
      totalFormatted: formatCents(120050, "USD"),
    });

    expect(alert.body).toBe(
      "Your customer accepted EV charger install — $1,200.50",
    );
  });

  it("formats from cents, never from a float", () => {
    // 999999 cents is the case that would read as $10,000 with sloppy rounding.
    const alert = acceptedNotification({
      customerName: "Dana",
      quoteTitle: "Rewire",
      totalFormatted: formatCents(999999, "USD"),
    });

    expect(alert.body).toContain("$9,999.99");
  });
});

describe("viewed alert", () => {
  it("names who opened it", () => {
    const alert = viewedNotification({
      customerName: "Sarah Lopez",
      quoteTitle: "Ceiling fan",
      quoteNumber: "Q-1043",
    });

    expect(alert.title).toBe("Sarah Lopez opened your quote");
    expect(alert.body).toBe("Ceiling fan (Q-1043)");
  });

  it("falls back when there is no customer name", () => {
    const alert = viewedNotification({
      customerName: null,
      quoteTitle: "Ceiling fan",
      quoteNumber: "Q-1043",
    });

    expect(alert.title).toBe("Someone opened your quote");
  });
});

describe("notification tags", () => {
  it("groups both alerts about one quote under the same tag", () => {
    // Same tag means the win replaces "opened" on the lock screen instead of
    // stacking two notices about one job.
    const quoteId = "11111111-1111-4111-8111-111111111111";
    expect(pushTagForQuote(quoteId)).toBe(`quote:${quoteId}`);
  });

  it("keeps different quotes apart", () => {
    expect(pushTagForQuote("a")).not.toBe(pushTagForQuote("b"));
  });
});
