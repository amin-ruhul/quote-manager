import { z } from "zod";

import {
  MAX_EMAIL_LENGTH,
  MAX_MONEY_INPUT_LENGTH,
  MAX_PRICE_CENTS,
  MAX_QUANTITY,
  MAX_QUANTITY_INPUT_LENGTH,
  MAX_REDIRECT_PATH_LENGTH,
  MAX_TAX_RATE_BASIS_POINTS,
  MAX_UNIT_LENGTH,
  QUANTITY_SCALE,
} from "@/lib/constants";
import { formatCents, parseDollarsToCents } from "@/lib/money";
import { parseQuantity } from "@/lib/quote-math";

/*
 * Pieces shared by more than one module's schema. Everything here is pure — no
 * server-only imports — so the same schema validates in the browser (React Hook
 * Form) and again in the server action, which stays the security boundary.
 *
 * Error messages are what the owner reads, so they say what to do.
 */

/*
 * These all take a string and may return null. The `.transform()` already
 * widens the output to `string | null`, so no `.nullable()` is added on top:
 * that would only widen the *input* to accept null, and the input is always a
 * DOM value — a string. Keeping the input type honest is what lets React Hook
 * Form type its fields.
 */

/** Trimmed free text that collapses an empty box to NULL rather than "". */
export const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Keep this under ${max} characters.`)
    .transform((value) => (value === "" ? null : value));

/** Trimmed free text the owner has to fill in. Bounded at both ends. */
export const requiredText = (max: number, message: string) =>
  z
    .string()
    .trim()
    .min(1, message)
    .max(max, `Keep this under ${max} characters.`);

/**
 * An email box the owner has to fill in. Empty and malformed get different
 * messages, because "Enter a valid email address." under a box you never
 * touched reads as if you got something wrong rather than skipped it.
 */
export const requiredEmail = z
  .string()
  .trim()
  .min(1, "Enter an email address.")
  .max(MAX_EMAIL_LENGTH, "That email address is too long.")
  .refine(
    (value) => z.email().safeParse(value).success,
    "Enter a valid email address.",
  )
  // Stored lowercase so "Jo@x.com" and "jo@x.com" are one customer rather than
  // two, and so the duplicate check is a plain comparison.
  .transform((value) => value.toLowerCase());

/** An email box the owner is allowed to leave empty. */
export const optionalEmail = z
  .string()
  .trim()
  .max(200)
  .refine(
    (value) => value === "" || z.email().safeParse(value).success,
    "Enter a valid email address.",
  )
  .transform((value) => (value === "" ? null : value));

/**
 * A unit, either picked from SUGGESTED_PRICEBOOK_UNITS or typed by the owner.
 *
 * Free text on purpose (see lib/constants.ts), so the only job here is to keep
 * it a *label*: trimmed, length-capped, and with runs of whitespace collapsed so
 * "sq  ft" and "sq ft" don't become two entries in the owner's own list.
 */
export const pricebookUnit = z
  .string()
  .trim()
  .min(1, "Pick a unit, or add your own.")
  .max(MAX_UNIT_LENGTH, "Keep the unit short, like “each” or “sq ft”.")
  .transform((value) => value.replace(/\s+/g, " "));

/** Shared by every money box, so the ceiling reads the same wherever it trips. */
const TOO_LARGE = `Keep this under ${formatCents(MAX_PRICE_CENTS)}.`;

/**
 * Dollars typed by the owner -> integer cents (golden rule 7).
 *
 * The upper bound is not cosmetic: the column is an int4, so without it a
 * fat-fingered price parses cleanly here and then dies in the INSERT.
 */
export const priceInCents = z
  .string()
  .max(MAX_MONEY_INPUT_LENGTH, TOO_LARGE)
  .transform((value, ctx) => {
    const cents = parseDollarsToCents(value);
    if (cents === null) {
      ctx.addIssue({
        code: "custom",
        message: "Enter a price, like 250 or 249.99.",
      });
      return z.NEVER;
    }
    if (cents > MAX_PRICE_CENTS) {
      ctx.addIssue({ code: "custom", message: TOO_LARGE });
      return z.NEVER;
    }
    return cents;
  });

/** An empty money box means zero, not an error. */
export const optionalCents = (message: string) =>
  z
    .string()
    .max(MAX_MONEY_INPUT_LENGTH, TOO_LARGE)
    .transform((value, ctx) => {
      if (value.trim() === "") return 0;
      const cents = parseDollarsToCents(value);
      if (cents === null) {
        ctx.addIssue({ code: "custom", message });
        return z.NEVER;
      }
      if (cents > MAX_PRICE_CENTS) {
        ctx.addIssue({ code: "custom", message: TOO_LARGE });
        return z.NEVER;
      }
      return cents;
    });

/** Quantity typed by the owner -> integer scaled by QUANTITY_SCALE. */
export const scaledQuantity = z
  .string()
  .max(MAX_QUANTITY_INPUT_LENGTH, "Enter a quantity above zero.")
  .transform((value, ctx) => {
    const quantity = parseQuantity(value);
    if (quantity === null) {
      ctx.addIssue({ code: "custom", message: "Enter a quantity above zero." });
      return z.NEVER;
    }
    if (quantity > MAX_QUANTITY * QUANTITY_SCALE) {
      ctx.addIssue({
        code: "custom",
        message: `Keep the quantity under ${MAX_QUANTITY.toLocaleString("en-US")}.`,
      });
      return z.NEVER;
    }
    return quantity;
  });

/**
 * A <Select> that is allowed to have nothing chosen. Both "" and the "none"
 * sentinel Radix needs (it cannot hold an empty-string value) mean NULL.
 */
export const optionalUuid = (message: string) =>
  z
    .string()
    .transform((value) => (value === "" || value === "none" ? null : value))
    .refine(
      (value) => value === null || z.uuid().safeParse(value).success,
      message,
    );

/**
 * A redirect target that cannot leave this site.
 *
 * "/" alone is not enough: "//evil.com" starts with a slash and the browser
 * reads it as protocol-relative, i.e. absolute — which turns any page that
 * renders it into an open redirect. Bounded first, so an enormous query string
 * is discarded rather than inspected, and it falls back rather than throwing:
 * this is never something the owner typed or can fix.
 */
export const safeRedirectPath = (fallback: string) =>
  z
    .string()
    .max(MAX_REDIRECT_PATH_LENGTH)
    .refine((value) => value.startsWith("/") && !value.startsWith("//"))
    .catch(fallback);

/** Row ids arrive from the client, so they are never trusted as given. */
export const idSchema = z.uuid("Something went wrong. Refresh and try again.");

export const MAX_TAX_RATE_PERCENT = MAX_TAX_RATE_BASIS_POINTS / 100;
