import { z } from "zod";

import { MAX_DESCRIPTION_LENGTH, MAX_NAME_LENGTH } from "@/lib/constants";
import {
  optionalText,
  priceInCents,
  pricebookUnit,
} from "@/lib/schemas/shared";

export const pricebookItemSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "That name is too small.")
    .max(MAX_NAME_LENGTH, "That name is too long."),
  description: optionalText(MAX_DESCRIPTION_LENGTH),
  category: optionalText(MAX_NAME_LENGTH),
  unit: pricebookUnit,
  price: priceInCents,
});

export type PricebookItemInput = z.infer<typeof pricebookItemSchema>;
export type PricebookItemFields = z.input<typeof pricebookItemSchema>;
