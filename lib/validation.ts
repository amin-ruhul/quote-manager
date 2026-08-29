import { z } from "zod";

import {
  CURRENCIES,
  FOLLOW_UP_DAY_OPTIONS,
  type FollowUpDays,
  MAX_DESCRIPTION_LENGTH,
  MAX_NAME_LENGTH,
  MAX_TAX_RATE_BASIS_POINTS,
  PRICEBOOK_UNITS,
  QUOTE_ITEM_TYPES,
} from "@/lib/constants";
import { parseDollarsToCents, parsePercentToBasisPoints } from "@/lib/money";
import { parseQuantity } from "@/lib/quote-math";

/*
 * Zod schemas for every server-action boundary. Nothing from the client is
 * trusted — including business_id, which is always resolved from the session.
 * Error messages are what the owner reads, so they say what to do.
 */

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Keep this under ${max} characters.`)
    .transform((value) => (value === "" ? null : value))
    .nullable();

/** Dollars typed by the owner -> integer cents. */
const priceInCents = z.string().transform((value, ctx) => {
  const cents = parseDollarsToCents(value);
  if (cents === null) {
    ctx.addIssue({
      code: "custom",
      message: "Enter a price, like 250 or 249.99.",
    });
    return z.NEVER;
  }
  return cents;
});

export const businessProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter your business name.")
    .max(MAX_NAME_LENGTH, "That name is too long."),
  phone: optionalText(40),
  email: z
    .string()
    .trim()
    .max(200)
    .refine(
      (value) => value === "" || z.email().safeParse(value).success,
      "Enter a valid email address.",
    )
    .transform((value) => (value === "" ? null : value))
    .nullable(),
  website: optionalText(200),
  address: optionalText(300),
  licenseNumber: optionalText(80),
  currency: z.enum(CURRENCIES),
  followUpDays: z.coerce
    .number()
    .refine(
      (value) => FOLLOW_UP_DAY_OPTIONS.includes(value as FollowUpDays),
      "Choose one of the follow-up options.",
    )
    .transform((value) => value as FollowUpDays),
  defaultTaxRate: z.string().transform((value, ctx) => {
    if (value.trim() === "") return 0;
    const basisPoints = parsePercentToBasisPoints(value);
    if (basisPoints === null) {
      ctx.addIssue({
        code: "custom",
        message: `Enter a tax rate between 0 and ${MAX_TAX_RATE_BASIS_POINTS / 100}.`,
      });
      return z.NEVER;
    }
    return basisPoints;
  }),
});

export type BusinessProfileInput = z.infer<typeof businessProfileSchema>;

export const pricebookItemSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter an item name.")
    .max(MAX_NAME_LENGTH, "That name is too long."),
  description: optionalText(MAX_DESCRIPTION_LENGTH),
  category: optionalText(MAX_NAME_LENGTH),
  unit: z.enum(PRICEBOOK_UNITS),
  price: priceInCents,
});

export type PricebookItemInput = z.infer<typeof pricebookItemSchema>;

export const idSchema = z.uuid("Something went wrong. Refresh and try again.");

export const customerSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "Enter a first name.")
    .max(MAX_NAME_LENGTH, "That name is too long."),
  lastName: optionalText(MAX_NAME_LENGTH),
  company: optionalText(MAX_NAME_LENGTH),
  phone: optionalText(40),
  email: z
    .string()
    .trim()
    .max(200)
    .refine(
      (value) => value === "" || z.email().safeParse(value).success,
      "Enter a valid email address.",
    )
    .transform((value) => (value === "" ? null : value))
    .nullable(),
  address: optionalText(300),
  notes: optionalText(MAX_DESCRIPTION_LENGTH),
});

export type CustomerInput = z.infer<typeof customerSchema>;

/** Quantity typed by the owner -> integer scaled by QUANTITY_SCALE. */
const scaledQuantity = z.string().transform((value, ctx) => {
  const quantity = parseQuantity(value);
  if (quantity === null) {
    ctx.addIssue({ code: "custom", message: "Enter a quantity above zero." });
    return z.NEVER;
  }
  return quantity;
});

export const quoteItemSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter an item name.")
    .max(MAX_NAME_LENGTH, "That name is too long."),
  description: optionalText(MAX_DESCRIPTION_LENGTH),
  quantity: scaledQuantity,
  unit: z.enum(PRICEBOOK_UNITS),
  unitPrice: priceInCents,
  type: z.enum(QUOTE_ITEM_TYPES),
  optionId: z
    .string()
    .transform((value) => (value === "" || value === "none" ? null : value))
    .nullable()
    .refine(
      (value) => value === null || z.uuid().safeParse(value).success,
      "Pick a valid option.",
    ),
});

export type QuoteItemInput = z.infer<typeof quoteItemSchema>;

export const quoteDetailsSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Give this quote a title.")
    .max(MAX_NAME_LENGTH, "That title is too long."),
  scopeOfWork: optionalText(4000),
  terms: optionalText(8000),
  customerId: z
    .string()
    .transform((value) => (value === "" || value === "none" ? null : value))
    .nullable()
    .refine(
      (value) => value === null || z.uuid().safeParse(value).success,
      "Pick a valid customer.",
    ),
  discount: z.string().transform((value, ctx) => {
    if (value.trim() === "") return 0;
    const cents = parseDollarsToCents(value);
    if (cents === null) {
      ctx.addIssue({ code: "custom", message: "Enter a discount, like 150." });
      return z.NEVER;
    }
    return cents;
  }),
  validUntil: z
    .string()
    .transform((value) => (value.trim() === "" ? null : value))
    .nullable()
    .refine(
      (value) => value === null || !Number.isNaN(Date.parse(value)),
      "Enter a valid date.",
    ),
});

export type QuoteDetailsInput = z.infer<typeof quoteDetailsSchema>;

export const quoteOptionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name this option, e.g. Standard.")
    .max(MAX_NAME_LENGTH, "That name is too long."),
  description: optionalText(MAX_DESCRIPTION_LENGTH),
});

export type QuoteOptionInput = z.infer<typeof quoteOptionSchema>;
