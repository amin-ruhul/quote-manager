import { z } from "zod";

import {
  CURRENCIES,
  FOLLOW_UP_DAY_OPTIONS,
  type FollowUpDays,
  MAX_NAME_LENGTH,
} from "@/lib/constants";
import { parsePercentToBasisPoints } from "@/lib/money";
import {
  MAX_TAX_RATE_PERCENT,
  optionalEmail,
  optionalText,
} from "@/lib/schemas/shared";

/** The business profile the owner fills in at onboarding and edits in settings. */
export const businessProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter your business name.")
    .max(MAX_NAME_LENGTH, "That name is too long."),
  phone: optionalText(40),
  email: optionalEmail,
  website: optionalText(200),
  address: optionalText(300),
  licenseNumber: optionalText(80),
  currency: z.enum(CURRENCIES),
  /*
   * A <Select>, so this is a string on the way in. Kept as a string rather than
   * z.coerce.number() so the browser and the server agree on the field's type —
   * React Hook Form needs the input type to be what the DOM actually holds.
   */
  followUpDays: z.string().transform((value, ctx) => {
    const days = Number(value);
    if (
      value.trim() === "" ||
      !FOLLOW_UP_DAY_OPTIONS.includes(days as FollowUpDays)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Choose one of the follow-up options.",
      });
      return z.NEVER;
    }
    return days as FollowUpDays;
  }),
  defaultTaxRate: z.string().transform((value, ctx) => {
    if (value.trim() === "") return 0;
    const basisPoints = parsePercentToBasisPoints(value);
    if (basisPoints === null) {
      ctx.addIssue({
        code: "custom",
        message: `Enter a tax rate between 0 and ${MAX_TAX_RATE_PERCENT}.`,
      });
      return z.NEVER;
    }
    return basisPoints;
  }),
});

export type BusinessProfileInput = z.infer<typeof businessProfileSchema>;
export type BusinessProfileFields = z.input<typeof businessProfileSchema>;
