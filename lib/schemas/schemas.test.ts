import { describe, expect, it } from "vitest";

import { businessProfileSchema } from "@/lib/schemas/business";
import { customerSchema } from "@/lib/schemas/customer";
import { pricebookItemSchema } from "@/lib/schemas/pricebook";
import { quoteDetailsSchema, quoteItemSchema } from "@/lib/schemas/quote";

/*
 * These schemas are the only thing standing between a typed box and a row, and
 * they run twice — once in the browser, once in the server action. What is
 * pinned down here is the crossing: strings in, integers and NULLs out.
 */

const pricebookItem = {
  name: "Recessed light",
  description: "",
  category: "",
  unit: "each" as const,
  price: "185.00",
};

const quoteItem = {
  name: "Recessed light",
  description: "",
  quantity: "2.5",
  unit: "hour" as const,
  unitPrice: "185",
  type: "qty" as const,
  optionId: "none",
};

const quoteDetails = {
  title: "Panel replacement",
  scopeOfWork: "",
  terms: "",
  customerId: "none",
  discount: "",
  validUntil: "",
};

describe("money crosses as integer cents", () => {
  it("parses dollars into cents", () => {
    const parsed = pricebookItemSchema.parse({
      ...pricebookItem,
      price: "249.99",
    });
    expect(parsed.price).toBe(24999);
  });

  it("does not lose a cent to binary floating point", () => {
    // 19.99 * 100 is 1998.9999... as a float; the schema must not go near it.
    const parsed = pricebookItemSchema.parse({
      ...pricebookItem,
      price: "19.99",
    });
    expect(parsed.price).toBe(1999);
    expect(Number.isInteger(parsed.price)).toBe(true);
  });

  it("accepts a typed dollar sign and thousands separators", () => {
    const parsed = pricebookItemSchema.parse({
      ...pricebookItem,
      price: "$2,850.00",
    });
    expect(parsed.price).toBe(285000);
  });

  it.each(["", "abc", "-5", "1.005", "12.3.4"])(
    "rejects %o as a price",
    (price) => {
      const result = pricebookItemSchema.safeParse({
        ...pricebookItem,
        price,
      });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.path).toEqual(["price"]);
    },
  );

  it("treats an empty discount as zero, not an error", () => {
    expect(quoteDetailsSchema.parse(quoteDetails).discount).toBe(0);
  });

  it("parses a discount that was typed", () => {
    const parsed = quoteDetailsSchema.parse({
      ...quoteDetails,
      discount: "150",
    });
    expect(parsed.discount).toBe(15000);
  });
});

describe("quantity crosses as a scaled integer", () => {
  it("scales a fractional quantity", () => {
    expect(quoteItemSchema.parse(quoteItem).quantity).toBe(250);
  });

  it("scales a whole quantity", () => {
    const parsed = quoteItemSchema.parse({ ...quoteItem, quantity: "6" });
    expect(parsed.quantity).toBe(600);
  });

  it.each(["0", "", "-1", "two"])("rejects %o as a quantity", (quantity) => {
    const result = quoteItemSchema.safeParse({ ...quoteItem, quantity });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["quantity"]);
  });
});

describe("tax rate crosses as integer basis points", () => {
  const profile = {
    name: "Bright Spark Electric",
    phone: "",
    email: "",
    website: "",
    address: "",
    licenseNumber: "",
    currency: "USD" as const,
    followUpDays: "2",
    defaultTaxRate: "8.25",
  };

  it("parses a percentage into basis points", () => {
    expect(businessProfileSchema.parse(profile).defaultTaxRate).toBe(825);
  });

  it("treats an empty rate as zero", () => {
    const parsed = businessProfileSchema.parse({
      ...profile,
      defaultTaxRate: "",
    });
    expect(parsed.defaultTaxRate).toBe(0);
  });

  it("rejects a rate above 100%", () => {
    const result = businessProfileSchema.safeParse({
      ...profile,
      defaultTaxRate: "101",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["defaultTaxRate"]);
  });

  it("keeps the follow-up cadence to the offered options", () => {
    expect(businessProfileSchema.parse(profile).followUpDays).toBe(2);
    expect(
      businessProfileSchema.safeParse({ ...profile, followUpDays: "3" })
        .success,
    ).toBe(false);
    // Empty must not quietly read as 0 ("don't follow up").
    expect(
      businessProfileSchema.safeParse({ ...profile, followUpDays: "" }).success,
    ).toBe(false);
  });
});

describe("empty optional boxes become NULL, not empty strings", () => {
  const customer = {
    firstName: "Jo",
    lastName: "",
    company: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  };

  it("nulls every untouched optional field", () => {
    const parsed = customerSchema.parse(customer);
    expect(parsed).toMatchObject({
      firstName: "Jo",
      lastName: null,
      company: null,
      phone: null,
      email: null,
      address: null,
      notes: null,
    });
  });

  it("trims what was typed", () => {
    const parsed = customerSchema.parse({
      ...customer,
      firstName: "  Jo  ",
      company: "  Bright Spark  ",
    });
    expect(parsed.firstName).toBe("Jo");
    expect(parsed.company).toBe("Bright Spark");
  });

  it("requires a first name", () => {
    const result = customerSchema.safeParse({ ...customer, firstName: "  " });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Enter a first name.");
  });

  it("allows an empty email but not a malformed one", () => {
    expect(customerSchema.parse(customer).email).toBeNull();
    const result = customerSchema.safeParse({ ...customer, email: "jo@" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["email"]);
  });

  it("turns the select's 'none' sentinel into NULL", () => {
    expect(quoteDetailsSchema.parse(quoteDetails).customerId).toBeNull();
    expect(quoteItemSchema.parse(quoteItem).optionId).toBeNull();
  });

  it("keeps a real id and rejects one that isn't a uuid", () => {
    const id = "3f1c9d2e-5a4b-4c8d-9e1f-2a3b4c5d6e7f";
    expect(
      quoteDetailsSchema.parse({ ...quoteDetails, customerId: id }),
    ).toHaveProperty("customerId", id);
    expect(
      quoteDetailsSchema.safeParse({ ...quoteDetails, customerId: "nope" })
        .success,
    ).toBe(false);
  });
});
