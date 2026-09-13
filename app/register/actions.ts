"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ensureProfile } from "@/lib/auth";
import { absoluteUrl } from "@/lib/email";
import { type ActionState, toFieldErrors } from "@/lib/form-state";
import { registerSchema } from "@/lib/schemas/auth";
import { createClient } from "@/lib/supabase/server";

export type RegisterState = ActionState & {
  /** Set when the account exists but the email still needs confirming. */
  checkEmail: boolean;
};

export async function register(
  _prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const parsed = registerSchema.safeParse({
    fullName: formData.get("fullName") ?? "",
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    next: formData.get("next") ?? "/onboarding",
  });

  if (!parsed.success) {
    return {
      error: null,
      fieldErrors: toFieldErrors(parsed.error.issues),
      checkEmail: false,
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      /*
       * There is no session until the email is confirmed, so there is nowhere
       * to write the name yet. Parking it on the auth user means it survives
       * the gap and gets copied into `profiles` on first sign-in.
       */
      data: { full_name: parsed.data.fullName },
      /*
       * Where the confirmation link comes back to.
       *
       * Without this Supabase falls back to the project's Site URL, which is
       * production — so confirming a signup made on localhost sent you to
       * quotepace.com, and on a machine with the app installed the browser
       * handed the link to the PWA instead of opening the page.
       *
       * Built from NEXT_PUBLIC_APP_URL rather than the Host header: the header
       * is attacker-controlled, and this one is already correct per
       * environment. Supabase only honours the value if it matches the
       * Redirect URLs allow-list, so localhost has to be added there too.
       */
      emailRedirectTo: absoluteUrl(
        `/auth/confirm?next=${encodeURIComponent(parsed.data.next)}`,
      ),
    },
  });

  if (error) {
    // Supabase reports a taken address here, and that belongs on the field.
    const alreadyRegistered =
      error.code === "user_already_exists" ||
      error.message.toLowerCase().includes("already registered");

    if (alreadyRegistered) {
      return {
        error: null,
        fieldErrors: {
          email: "That email already has an account. Sign in instead.",
        },
        checkEmail: false,
      };
    }

    return { error: error.message, fieldErrors: {}, checkEmail: false };
  }

  // With email confirmation switched on, there is no session yet — so this is
  // a success, not a failure, and it should not read like one.
  if (!data.session || !data.user) {
    return { error: null, fieldErrors: {}, checkEmail: true };
  }

  await ensureProfile(
    data.user.id,
    data.user.email ?? parsed.data.email,
    parsed.data.fullName,
  );

  revalidatePath("/", "layout");
  redirect("/onboarding");
}
