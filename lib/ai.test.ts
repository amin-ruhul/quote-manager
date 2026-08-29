import { describe, expect, it } from "vitest";

import {
  normalizeDraft,
  toScaledQuantity,
  type PricebookEntry,
} from "@/lib/ai";

const pricebook: PricebookEntry[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Recessed light",
    description: "LED recessed light",
    category: "Lighting",
    unit: "each",
    price: 18500,
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    name: "Standard Labor",
    description: null,
    category: "Labor & Fees",
    unit: "hour",
    price: 12500,
  },
];

describe("normalizeDraft — the AI never sets a price", () => {
  it("takes the price from the pricebook, not from the model", () => {
    // The model claims $1.00 for an item the pricebook prices at $185.00.
    const draft = normalizeDraft(
      {
        scope_of_work: "Install lights.",
        line_items: [
          {
            name: "Recessed light",
            description: "",
            quantity: 6,
            unit: "each",
            type: "qty",
            pricebook_item_id: pricebook[0]!.id,
            unit_price: 100,
            needs_price: false,
          },
        ],
        suggested_additions: [],
      },
      pricebook,
    );

    expect(draft.lineItems[0]?.unitPrice).toBe(18500);
    expect(draft.lineItems[0]?.needsPrice).toBe(false);
  });

  it("marks an unmatched item needs_price with no price", () => {
    const draft = normalizeDraft(
      {
        scope_of_work: "",
        line_items: [
          {
            name: "New outlet",
            description: "",
            quantity: 1,
            unit: "each",
            type: "qty",
            pricebook_item_id: null,
            unit_price: null,
            needs_price: true,
          },
        ],
        suggested_additions: [],
      },
      pricebook,
    );

    expect(draft.lineItems[0]).toMatchObject({
      pricebookItemId: null,
      unitPrice: null,
      needsPrice: true,
    });
  });

  it("refuses a price the model attached to an unmatched item", () => {
    // The dangerous case: model invents both a price and needs_price=false.
    const draft = normalizeDraft(
      {
        scope_of_work: "",
        line_items: [
          {
            name: "Hot tub wiring",
            description: "",
            quantity: 1,
            unit: "job",
            type: "fixed",
            pricebook_item_id: null,
            unit_price: 250000,
            needs_price: false,
          },
        ],
        suggested_additions: [],
      },
      pricebook,
    );

    expect(draft.lineItems[0]?.unitPrice).toBeNull();
    expect(draft.lineItems[0]?.needsPrice).toBe(true);
  });

  it("treats a hallucinated pricebook id as no match", () => {
    const draft = normalizeDraft(
      {
        scope_of_work: "",
        line_items: [
          {
            name: "Mystery item",
            description: "",
            quantity: 1,
            unit: "each",
            type: "qty",
            pricebook_item_id: "99999999-9999-4999-8999-999999999999",
            unit_price: 50000,
            needs_price: false,
          },
        ],
        suggested_additions: [],
      },
      pricebook,
    );

    expect(draft.lineItems[0]?.pricebookItemId).toBeNull();
    expect(draft.lineItems[0]?.unitPrice).toBeNull();
    expect(draft.lineItems[0]?.needsPrice).toBe(true);
  });
});

describe("normalizeDraft — tolerating bad output", () => {
  it("does not crash on a missing line_items array", () => {
    const draft = normalizeDraft({ scope_of_work: "Hello" }, pricebook);
    expect(draft.lineItems).toEqual([]);
    expect(draft.suggestedAdditions).toEqual([]);
    expect(draft.scopeOfWork).toBe("Hello");
  });

  it("throws on a non-object reply rather than guessing", () => {
    expect(() => normalizeDraft("nope", pricebook)).toThrow();
    expect(() => normalizeDraft(null, pricebook)).toThrow();
  });

  it("falls back on an unknown unit and type", () => {
    const draft = normalizeDraft(
      {
        scope_of_work: "",
        line_items: [
          {
            name: "Odd item",
            description: "",
            quantity: 2,
            unit: "furlong",
            type: "sorcery",
            pricebook_item_id: null,
            unit_price: null,
            needs_price: true,
          },
        ],
        suggested_additions: [],
      },
      pricebook,
    );

    expect(draft.lineItems[0]?.unit).toBe("each");
    expect(draft.lineItems[0]?.type).toBe("qty");
  });

  it("never produces a zero or negative quantity", () => {
    const draft = normalizeDraft(
      {
        scope_of_work: "",
        line_items: [
          { name: "A", quantity: 0, pricebook_item_id: null },
          { name: "B", quantity: -5, pricebook_item_id: null },
          { name: "C", quantity: "lots", pricebook_item_id: null },
        ],
        suggested_additions: [],
      },
      pricebook,
    );

    for (const item of draft.lineItems) {
      expect(item.quantity).toBeGreaterThan(0);
    }
  });

  it("drops nameless suggested additions", () => {
    const draft = normalizeDraft(
      {
        scope_of_work: "",
        line_items: [],
        suggested_additions: [
          { name: "Permit", reason: "Panel work usually requires one" },
          { name: "", reason: "orphan" },
        ],
      },
      pricebook,
    );

    expect(draft.suggestedAdditions).toEqual([
      { name: "Permit", reason: "Panel work usually requires one" },
    ]);
  });
});

describe("toScaledQuantity", () => {
  it("scales whole units to the stored integer", () => {
    expect(toScaledQuantity(1)).toBe(100);
    expect(toScaledQuantity(6)).toBe(600);
    expect(toScaledQuantity(2.5)).toBe(250);
  });

  it("never returns zero", () => {
    expect(toScaledQuantity(0)).toBe(100);
    expect(toScaledQuantity(-3)).toBe(100);
  });
});
