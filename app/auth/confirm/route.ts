import type { EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { ensureProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

/*
 * Handles the link in Supabase's confirmation email.
 *
 * Two shapes arrive here depending on the email template:
 * - `?token_hash=…&type=signup` — the recommended server-side flow.
 * - `?code=…` — the PKCE flow, when the template uses {{ .ConfirmationURL }}.
 *
 * Either way the result is a redirect to /auth/verified with a status the page
 * can explain, never a blank screen.
 */

const OTP_TYPES = [
  "signup",
  "email",
  "recovery",
  "invite",
  "email_change",
  "magiclink",
] as const satisfies readonly EmailOtpType[];

const paramsSchema = z.object({
  token_hash: z.string().min(1).nullable(),
  code: z.string().min(1).nullable(),
  type: z.enum(OTP_TYPES).catch("email"),
  // Only same-site paths, so a crafted link can't bounce the owner off-site.
  next: z
    .string()
    .startsWith("/")
    .catch("/onboarding")
    .transform((value) => (value.startsWith("//") ? "/onboarding" : value)),
});

function resultUrl(
  request: NextRequest,
  status: "success" | "expired" | "error",
  next: string,
) {
  const url = new URL("/auth/verified", request.url);
  url.searchParams.set("status", status);
  if (status === "success") url.searchParams.set("next", next);
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams;

  const parsed = paramsSchema.parse({
    token_hash: query.get("token_hash"),
    code: query.get("code"),
    type: query.get("type") ?? undefined,
    next: query.get("next") ?? undefined,
  });

  // Supabase reports its own failures on the link itself (expired, already used).
  if (query.get("error")) {
    return resultUrl(request, "expired", parsed.next);
  }

  const supabase = await createClient();

  if (parsed.token_hash) {
    const { data, error } = await supabase.auth.verifyOtp({
      type: parsed.type,
      token_hash: parsed.token_hash,
    });
    if (!error && data.user) {
      await ensureProfile(data.user.id, data.user.email ?? "");
    }
    return resultUrl(request, error ? "expired" : "success", parsed.next);
  }

  if (parsed.code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(
      parsed.code,
    );
    if (!error && data.user) {
      await ensureProfile(data.user.id, data.user.email ?? "");
    }
    return resultUrl(request, error ? "expired" : "success", parsed.next);
  }

  // Reached without either token — a hand-edited or truncated link.
  return resultUrl(request, "error", parsed.next);
}
