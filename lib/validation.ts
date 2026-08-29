import { z } from "zod";

import {
  CURRENCIES,
  MAX_DESCRIPTION_LENGTH,
  MAX_NAME_LENGTH,
  MAX_TAX_RATE_BASIS_POINTS,
  PRICEBOOK_UNITS,
} from "@/lib/constants";
import { parseDollarsToCents, parsePercentToBasisPoints } from "@/lib/money";

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
