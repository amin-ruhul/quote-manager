"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { ensureProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

/*
 * Minimal email/password auth so Phase 1 has a real owner to hang a business
 * off. Google sign-in and the rest of the auth polish land in Phase 6.
 */

export type AuthState = { error: string | null };

const credentialsSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Use at least 8 characters."),
  next: z.string().startsWith("/").catch("/pricebook"),
});

function parseCredentials(formData: FormData) {
  return credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") ?? "/pricebook",
  });
}

export async function signIn(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = parseCredentials(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your details." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    return { error: "That email and password don't match. Try again." };
  }

  await ensureProfile(data.user.id, data.user.email ?? parsed.data.email);

  revalidatePath("/", "layout");
  redirect(parsed.data.next);
}

export async function signUp(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = parseCredentials(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your details." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  // With email confirmation switched on, there is no session yet.
  if (!data.session || !data.user) {
    return {
      error: "Check your email to confirm your account, then sign in.",
    };
  }

  await ensureProfile(data.user.id, data.user.email ?? parsed.data.email);

  revalidatePath("/", "layout");
  redirect("/onboarding");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
