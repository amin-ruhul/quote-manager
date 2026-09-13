import { z } from "zod";

import {
  MAX_EMAIL_LENGTH,
  MAX_NAME_LENGTH,
  MAX_PASSWORD_LENGTH,
} from "@/lib/constants";
import { safeRedirectPath } from "@/lib/schemas/shared";

/*
 * Where the owner lands after signing in, when they didn't arrive from
 * somewhere specific. The dashboard: it answers "what happened while I was
 * away", which is the question someone signing in is actually asking — the
 * pricebook was a setup screen standing in for a home page.
 *
 * An account with no business profile never sees it: every screen inside the
 * app goes through requireBusiness(), which sends them to /onboarding first.
 * That keeps "you must set up your business" in one place rather than spread
 * across each entry point.
 *
 * See safeRedirectPath for why a crafted ?next= can't leave the site.
 */
const nextPath = safeRedirectPath("/dashboard");

const email = z
  .email("Enter a valid email address.")
  .max(MAX_EMAIL_LENGTH, "That email address is too long.");

/*
 * Eight characters is Supabase's own floor. Deliberately not demanding a
 * symbol and a digit: length rules that fight the owner produce "Passw0rd!"
 * written on the van dashboard, not a safer account.
 *
 * The ceiling is bcrypt's: it hashes the first 72 bytes and ignores the rest,
 * so accepting more would quietly mean less than it looks like.
 */
const password = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(MAX_PASSWORD_LENGTH, `Use at most ${MAX_PASSWORD_LENGTH} characters.`);

export const signInSchema = z.object({
  email,
  password,
  next: nextPath,
});

export type SignInFields = z.input<typeof signInSchema>;

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(1, "Enter your name.")
      .max(MAX_NAME_LENGTH, "That name is too long."),
    email,
    password,
    // Bounded like the password it has to equal, so an oversized paste is
    // rejected here rather than compared character by character first.
    confirmPassword: z.string().max(MAX_PASSWORD_LENGTH),
    next: nextPath,
  })
  // Reported on confirmPassword, not on the object, so the message lands under
  // the box the owner has to change.
  .refine((values) => values.password === values.confirmPassword, {
    message: "Both passwords must match.",
    path: ["confirmPassword"],
  });

export type RegisterFields = z.input<typeof registerSchema>;
