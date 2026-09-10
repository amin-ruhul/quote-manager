import { z } from "zod";

import { MAX_NAME_LENGTH } from "@/lib/constants";

/**
 * Where the owner lands after signing in. It must be a path on this site, or
 * the login page becomes an open redirect. "/" alone is not enough —
 * "//evil.com" is protocol-relative and the browser treats it as absolute. An
 * unusable value falls back rather than failing the sign-in: it is not
 * something the owner typed or can fix.
 */
const nextPath = z
  .string()
  .refine((value) => value.startsWith("/") && !value.startsWith("//"))
  .catch("/pricebook");

const email = z.email("Enter a valid email address.");

/*
 * Eight characters is Supabase's own floor. Deliberately not demanding a
 * symbol and a digit: length rules that fight the owner produce "Passw0rd!"
 * written on the van dashboard, not a safer account.
 */
const password = z.string().min(8, "Use at least 8 characters.");

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
    confirmPassword: z.string(),
    next: nextPath,
  })
  // Reported on confirmPassword, not on the object, so the message lands under
  // the box the owner has to change.
  .refine((values) => values.password === values.confirmPassword, {
    message: "Both passwords must match.",
    path: ["confirmPassword"],
  });

export type RegisterFields = z.input<typeof registerSchema>;
