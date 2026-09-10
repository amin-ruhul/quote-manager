import { z } from "zod";

import {
  MAX_DESCRIPTION_LENGTH,
  MAX_NAME_LENGTH,
  PRICEBOOK_UNITS,
} from "@/lib/constants";
import { optionalText, priceInCents } from "@/lib/schemas/shared";

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
export type PricebookItemFields = z.input<typeof pricebookItemSchema>;
