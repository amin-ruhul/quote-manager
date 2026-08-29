"use server";

import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { quoteEvents, quotes } from "@/db/schema";
import { MAX_NAME_LENGTH } from "@/lib/constants";
import { db } from "@/lib/db";
import { notifyOwnerAccepted } from "@/lib/notify-owner";
import { canAccept } from "@/lib/public-quote";
import { clientIpFrom, rateLimit } from "@/lib/rate-limit";

export type AcceptState = { error: string | null; acceptedAt: number | null };

const acceptSchema = z.object({
  token: z.string().min(1).max(200),
  // Typing a full name is the signature (SPEC §11 makes it optional; we ask
  // for it because a name on the record is what makes acceptance stick).
  signedName: z
    .string()
    .trim()
    .max(MAX_NAME_LENGTH, "That name is too long.")
    .transform((value) => (value === "" ? null : value))
    .nullable(),
  optionId: z
    .string()
    .transform((value) => (value === "" || value === "none" ? null : value))
    .nullable()
    .refine(
      (value) => value === null || z.uuid().safeParse(value).success,
      "Choose one of the options above.",
    ),
});

/**
 * Accepts a quote from the public page. There is no session here, so the token
 * is the only credential — everything is re-checked server-side against the
 * stored row, and the update is conditional on the status still being one a
 * customer may act on.
 */
export async function acceptQuote(
  _prevState: AcceptState,
  formData: FormData,
): Promise<AcceptState> {
  const requestHeaders = await headers();
  const ip = clientIpFrom(requestHeaders);

  // Public endpoint: cap attempts before touching the database.
  const { allowed } = rateLimit({
    key: `accept:${ip}`,
    limit: 10,
    windowMs: 60_000,
  });
  if (!allowed) {
    return {
      error: "Too many attempts. Wait a moment and try again.",
      acceptedAt: null,
    };
  }

  const parsed = acceptSchema.safeParse({
    token: formData.get("token") ?? "",
    signedName: formData.get("signedName") ?? "",
    optionId: formData.get("optionId") ?? "",
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Check your details.",
      acceptedAt: null,
    };
  }

  const [quote] = await db
    .select({
      id: quotes.id,
      status: quotes.status,
      validUntil: quotes.validUntil,
      total: quotes.total,
    })
    .from(quotes)
    .where(eq(quotes.publicToken, parsed.data.token))
    .limit(1);

  if (!quote) {
    return { error: "This quote link is no longer valid.", acceptedAt: null };
  }

  if (quote.status === "accepted") {
    // Already done — treat as success so a double tap isn't an error.
    return { error: null, acceptedAt: Date.now() };
  }

  if (!canAccept(quote.status, quote.validUntil)) {
    return {
      error:
        "This quote can't be accepted online any more. Please contact the business.",
      acceptedAt: null,
    };
  }

  try {
    await db.transaction(async (tx) => {
      // Conditional on the status we just read, so two taps can't both win.
      const updated = await tx
        .update(quotes)
        .set({ status: "accepted", updatedAt: new Date() })
        .where(and(eq(quotes.id, quote.id), eq(quotes.status, quote.status)))
        .returning({ id: quotes.id });

      if (updated.length === 0) return;

      // The moat: who accepted, when, from where, and for how much.
      await tx.insert(quoteEvents).values({
        quoteId: quote.id,
        type: "accepted",
        meta: {
          signedName: parsed.data.signedName ?? "",
          optionId: parsed.data.optionId ?? "",
          totalCents: String(quote.total),
          ip,
          userAgent: requestHeaders.get("user-agent") ?? "",
          acceptedAt: new Date().toISOString(),
        },
      });
    });
  } catch (error) {
    console.error("Accepting quote failed", { quoteId: quote.id, error });
    return {
      error: "We couldn't record your acceptance. Try again.",
      acceptedAt: null,
    };
  }

  // Best-effort, after the acceptance is safely recorded.
  await notifyOwnerAccepted(quote.id, parsed.data.signedName);

  revalidatePath(`/q/${parsed.data.token}`);
  return { error: null, acceptedAt: Date.now() };
}
