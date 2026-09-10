import { z } from "zod";

import { MAX_TAX_RATE_BASIS_POINTS } from "@/lib/constants";
import { parseDollarsToCents } from "@/lib/money";
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

/** Dollars typed by the owner -> integer cents (golden rule 7). */
export const priceInCents = z.string().transform((value, ctx) => {
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

/** An empty money box means zero, not an error. */
export const optionalCents = (message: string) =>
  z.string().transform((value, ctx) => {
    if (value.trim() === "") return 0;
    const cents = parseDollarsToCents(value);
    if (cents === null) {
      ctx.addIssue({ code: "custom", message });
      return z.NEVER;
    }
    return cents;
  });

/** Quantity typed by the owner -> integer scaled by QUANTITY_SCALE. */
export const scaledQuantity = z.string().transform((value, ctx) => {
  const quantity = parseQuantity(value);
  if (quantity === null) {
    ctx.addIssue({ code: "custom", message: "Enter a quantity above zero." });
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

/** Row ids arrive from the client, so they are never trusted as given. */
export const idSchema = z.uuid("Something went wrong. Refresh and try again.");

export const MAX_TAX_RATE_PERCENT = MAX_TAX_RATE_BASIS_POINTS / 100;
