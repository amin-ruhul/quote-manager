import { z } from "zod";

import {
  MAX_DESCRIPTION_LENGTH,
  MAX_NAME_LENGTH,
  MAX_PHONE_DIGITS,
  MAX_PHONE_LENGTH,
  MIN_PHONE_DIGITS,
} from "@/lib/constants";
import { phoneDigits } from "@/lib/customers";
import {
  optionalText,
  requiredEmail,
  requiredText,
  switchValue,
} from "@/lib/schemas/shared";

/**
 * A phone number the owner has to fill in.
 *
 * Counted in digits rather than characters so punctuation is the owner's own
 * business — the check is "is there a real number in here", not "is it typed
 * the way we like". Required alone wasn't enough: a single "x" satisfied it.
 */
const requiredPhone = z
  .string()
  .trim()
  .min(1, "Enter a phone number.")
  .max(MAX_PHONE_LENGTH, "That phone number is too long.")
  .refine(
    (value) => phoneDigits(value).length >= MIN_PHONE_DIGITS,
    "That doesn't look like a full phone number.",
  )
  .refine(
    (value) => phoneDigits(value).length <= MAX_PHONE_DIGITS,
    "That phone number has too many digits.",
  );

/*
 * Name, phone and email are all required: a customer you can't reach is a
 * customer you can't send a quote to, and the whole product is "send the quote
 * before you leave the driveway". Company, address and notes stay optional —
 * they are useful, but nothing downstream breaks without them.
 */
export const customerSchema = z.object({
  firstName: requiredText(MAX_NAME_LENGTH, "Enter a first name."),
  lastName: requiredText(MAX_NAME_LENGTH, "Enter a last name."),
  company: optionalText(MAX_NAME_LENGTH),
  phone: requiredPhone,
  email: requiredEmail,
  address: optionalText(300),
  notes: optionalText(MAX_DESCRIPTION_LENGTH),
  /* Exemption follows the buyer, so it lives here and not on each quote. */
  taxExempt: switchValue,
});

export type CustomerInput = z.infer<typeof customerSchema>;
export type CustomerFields = z.input<typeof customerSchema>;
