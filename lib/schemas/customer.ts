import { z } from "zod";

import { MAX_DESCRIPTION_LENGTH, MAX_NAME_LENGTH } from "@/lib/constants";
import { optionalEmail, optionalText } from "@/lib/schemas/shared";

export const customerSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "Enter a first name.")
    .max(MAX_NAME_LENGTH, "That name is too long."),
  lastName: optionalText(MAX_NAME_LENGTH),
  company: optionalText(MAX_NAME_LENGTH),
  phone: optionalText(40),
  email: optionalEmail,
  address: optionalText(300),
  notes: optionalText(MAX_DESCRIPTION_LENGTH),
});

export type CustomerInput = z.infer<typeof customerSchema>;
export type CustomerFields = z.input<typeof customerSchema>;
