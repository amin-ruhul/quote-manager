"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ensureProfile, fullNameFromMetadata } from "@/lib/auth";
import { type ActionState, toFieldErrors } from "@/lib/form-state";
import { signInSchema } from "@/lib/schemas/auth";
import { createClient } from "@/lib/supabase/server";

/*
 * Signing in and signing out. Creating an account lives in app/register —
 * they ask for different things and deserve their own screens.
 *
 * Google sign-in and the rest of the auth polish land in Phase 6.
 */

export async function signIn(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") ?? undefined,
  });

  if (!parsed.success) {
    return { error: null, fieldErrors: toFieldErrors(parsed.error.issues) };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  // Deliberately not a field error: which half was wrong is not something we
  // tell an attacker, and the owner can only fix it by retrying both.
  if (error || !data.user) {
    return {
      error: "That email and password don't match. Try again.",
      fieldErrors: {},
    };
  }

  // First sign-in after confirming the email is where the name typed at
  // registration finally reaches the profile row.
  await ensureProfile(
    data.user.id,
    data.user.email ?? parsed.data.email,
    fullNameFromMetadata(data.user.user_metadata),
  );

  revalidatePath("/", "layout");
  redirect(parsed.data.next);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
