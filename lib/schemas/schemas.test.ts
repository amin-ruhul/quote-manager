import { describe, expect, it } from "vitest";

import {
  MAX_EMAIL_LENGTH,
  MAX_PASSWORD_LENGTH,
  MAX_PHONE_DIGITS,
  MAX_PRICE_CENTS,
} from "@/lib/constants";
import { phoneDigits } from "@/lib/customers";
import { registerSchema } from "@/lib/schemas/auth";
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
  taxable: "true" as const,
};

const quoteItem = {
  name: "Recessed light",
  description: "",
  quantity: "2.5",
  unit: "hour" as const,
  unitPrice: "185",
  type: "qty" as const,
  optionId: "none",
  taxable: "true" as const,
};

const quoteDetails = {
  title: "Panel replacement",
  scopeOfWork: "",
  terms: "",
  customerId: "none",
  discount: "",
  taxRate: "",
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

/*
 * Every money and quantity column is an int4. A value that parses cleanly but
 * doesn't fit reaches the INSERT and dies there, where the owner can only see
 * "try again" — so the ceiling has to be caught on the field.
 */
describe("bounds that keep a value inside its column", () => {
  it("rejects a price above the cap", () => {
    const result = pricebookItemSchema.safeParse({
      ...pricebookItem,
      price: "1000000.01",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["price"]);
  });

  it("accepts a price exactly at the cap", () => {
    expect(
      pricebookItemSchema.parse({ ...pricebookItem, price: "1000000" }).price,
    ).toBe(MAX_PRICE_CENTS);
  });

  it("rejects a quantity above the cap", () => {
    const result = quoteItemSchema.safeParse({
      ...quoteItem,
      quantity: "10001",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["quantity"]);
  });

  it("rejects a line whose total overflows, though both fields are in range", () => {
    const result = quoteItemSchema.safeParse({
      ...quoteItem,
      quantity: "10000",
      unitPrice: "1000000",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["unitPrice"]);
  });

  it("still accepts an ordinary line", () => {
    const parsed = quoteItemSchema.parse({
      ...quoteItem,
      quantity: "6",
      unitPrice: "185",
    });
    expect(parsed.quantity).toBe(600);
    expect(parsed.unitPrice).toBe(18500);
  });

  it("caps a discount too, not just a price", () => {
    const result = quoteDetailsSchema.safeParse({
      ...quoteDetails,
      discount: "2000000",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["discount"]);
  });
});

describe("credentials are bounded at both ends", () => {
  const account = {
    fullName: "Jo Sparks",
    email: "jo@brightspark.com",
    password: "electric-avenue",
    confirmPassword: "electric-avenue",
    next: "/onboarding",
  };

  it("rejects a password past bcrypt's 72-byte limit", () => {
    const long = "a".repeat(MAX_PASSWORD_LENGTH + 1);
    const result = registerSchema.safeParse({
      ...account,
      password: long,
      confirmPassword: long,
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues.some((i) => i.path[0] === "password")).toBe(
      true,
    );
  });

  it("accepts a password exactly at the limit", () => {
    const exact = "a".repeat(MAX_PASSWORD_LENGTH);
    expect(
      registerSchema.safeParse({
        ...account,
        password: exact,
        confirmPassword: exact,
      }).success,
    ).toBe(true);
  });

  it("rejects an over-long email rather than passing it to Supabase", () => {
    const result = registerSchema.safeParse({
      ...account,
      email: `${"a".repeat(MAX_EMAIL_LENGTH)}@example.com`,
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues.some((i) => i.path[0] === "email")).toBe(true);
  });
});

/*
 * The duplicate check matches on these two normalisations, and the SQL side
 * mirrors them exactly (lower(), and regexp_replace to digits). If this drifts,
 * the same customer gets added twice under different punctuation.
 */
describe("phoneDigits — what makes two numbers the same number", () => {
  it.each([
    "(555) 123-4567",
    "555.123.4567",
    "555 123 4567",
    "+1 (555) 123-4567 ",
  ])("reduces %o to its digits", (phone) => {
    expect(phoneDigits(phone)).toMatch(/^1?5551234567$/);
  });

  it("agrees that two punctuations of one number are equal", () => {
    expect(phoneDigits("(555) 123-4567")).toBe(phoneDigits("555.123.4567"));
  });

  it("returns nothing for a string with no digits", () => {
    expect(phoneDigits("call the office")).toBe("");
  });
});

describe("empty optional boxes become NULL, not empty strings", () => {
  // A customer you can't reach can't be sent a quote, so the contact fields are
  // required; only the three that nothing downstream depends on are optional.
  const customer = {
    firstName: "Jo",
    lastName: "Sparks",
    company: "",
    phone: "(555) 123-4567",
    email: "jo@brightspark.com",
    address: "",
    notes: "",
    taxExempt: "false" as const,
  };

  it("nulls every untouched optional field", () => {
    const parsed = customerSchema.parse(customer);
    expect(parsed).toMatchObject({
      firstName: "Jo",
      lastName: "Sparks",
      company: null,
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

  it.each([
    ["firstName", "Enter a first name."],
    ["lastName", "Enter a last name."],
    ["phone", "Enter a phone number."],
    ["email", "Enter an email address."],
  ])("requires %s", (field, message) => {
    const result = customerSchema.safeParse({ ...customer, [field]: "  " });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual([field]);
    expect(result.error?.issues[0]?.message).toBe(message);
  });

  it.each([
    "(555) 123-4567",
    "555.123.4567",
    "+1 555 123 4567",
    "5551234567",
    "555-1234",
  ])("accepts %o, however it is punctuated", (phone) => {
    expect(customerSchema.safeParse({ ...customer, phone }).success).toBe(true);
  });

  it.each(["x", "123", "call the office", "555-123"])(
    "rejects %o as a phone number",
    (phone) => {
      const result = customerSchema.safeParse({ ...customer, phone });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.path).toEqual(["phone"]);
      expect(result.error?.issues[0]?.message).toBe(
        "That doesn't look like a full phone number.",
      );
    },
  );

  it("rejects a number with more digits than any real one", () => {
    const result = customerSchema.safeParse({
      ...customer,
      phone: "1".repeat(MAX_PHONE_DIGITS + 1),
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["phone"]);
  });

  it("stores the email lowercased, so case can't make two customers", () => {
    const parsed = customerSchema.parse({
      ...customer,
      email: "  Jo@BrightSpark.com  ",
    });
    expect(parsed.email).toBe("jo@brightspark.com");
  });

  it("separates a missing email from a malformed one", () => {
    const malformed = customerSchema.safeParse({ ...customer, email: "jo@" });
    expect(malformed.success).toBe(false);
    expect(malformed.error?.issues[0]?.path).toEqual(["email"]);
    expect(malformed.error?.issues[0]?.message).toBe(
      "Enter a valid email address.",
    );
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
