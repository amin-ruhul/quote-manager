import { z } from "zod";

import {
  MAX_DATE_INPUT_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_INT4,
  MAX_NAME_LENGTH,
  QUOTE_ITEM_TYPES,
} from "@/lib/constants";
import {
  optionalCents,
  optionalText,
  optionalUuid,
  priceInCents,
  pricebookUnit,
  scaledQuantity,
  switchValue,
  taxRatePercent,
} from "@/lib/schemas/shared";

export const quoteDetailsSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Give this quote a title.")
    .max(MAX_NAME_LENGTH, "That title is too long."),
  scopeOfWork: optionalText(4000),
  terms: optionalText(8000),
  customerId: optionalUuid("Pick a valid customer."),
  discount: optionalCents("Enter a discount, like 150."),
  /*
   * Per quote, not per business. The rate is snapshotted from the business
   * default when a quote is created, so settings changes never rewrite quotes
   * already drafted — but without an override here, a quote created before the
   * owner set their rate was frozen at 0% with no way to fix it.
   */
  taxRate: taxRatePercent,
  validUntil: z
    .string()
    .max(MAX_DATE_INPUT_LENGTH, "Enter a valid date.")
    .transform((value) => (value.trim() === "" ? null : value))
    .refine(
      (value) => value === null || !Number.isNaN(Date.parse(value)),
      "Enter a valid date.",
    ),
});

export type QuoteDetailsInput = z.infer<typeof quoteDetailsSchema>;
export type QuoteDetailsFields = z.input<typeof quoteDetailsSchema>;

export const quoteItemSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Enter an item name.")
      .max(MAX_NAME_LENGTH, "That name is too long."),
    description: optionalText(MAX_DESCRIPTION_LENGTH),
    quantity: scaledQuantity,
    unit: pricebookUnit,
    unitPrice: priceInCents,
    taxable: switchValue,
    type: z.enum(QUOTE_ITEM_TYPES),
    optionId: optionalUuid("Pick a valid option."),
  })
  /*
   * Both fields can be in range and still multiply out past the int4 ceiling —
   * 10,000 × $1,000,000 is the same "integer out of range" the individual caps
   * were added to prevent. lineTotal() is the sum's building block, so it is
   * the thing that actually has to fit.
   */
  .superRefine((values, ctx) => {
    const total = Math.round((values.quantity * values.unitPrice) / 100);
    if (total > MAX_INT4) {
      ctx.addIssue({
        code: "custom",
        path: ["unitPrice"],
        message: "This line's total is too large. Lower the price or quantity.",
      });
    }
  });

export type QuoteItemInput = z.infer<typeof quoteItemSchema>;
export type QuoteItemFields = z.input<typeof quoteItemSchema>;

export const quoteOptionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name this option, e.g. Standard.")
    .max(MAX_NAME_LENGTH, "That name is too long."),
  description: optionalText(MAX_DESCRIPTION_LENGTH),
});

export type QuoteOptionInput = z.infer<typeof quoteOptionSchema>;
export type QuoteOptionFields = z.input<typeof quoteOptionSchema>;
