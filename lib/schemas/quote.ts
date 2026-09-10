import { z } from "zod";

import {
  MAX_DESCRIPTION_LENGTH,
  MAX_NAME_LENGTH,
  PRICEBOOK_UNITS,
  QUOTE_ITEM_TYPES,
} from "@/lib/constants";
import {
  optionalCents,
  optionalText,
  optionalUuid,
  priceInCents,
  scaledQuantity,
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
  validUntil: z
    .string()
    .transform((value) => (value.trim() === "" ? null : value))
    .refine(
      (value) => value === null || !Number.isNaN(Date.parse(value)),
      "Enter a valid date.",
    ),
});

export type QuoteDetailsInput = z.infer<typeof quoteDetailsSchema>;
export type QuoteDetailsFields = z.input<typeof quoteDetailsSchema>;

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
  optionId: optionalUuid("Pick a valid option."),
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
