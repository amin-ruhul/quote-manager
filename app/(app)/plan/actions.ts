"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getBusinessForOwner, requireUser } from "@/lib/auth";
import {
  MAX_UPGRADE_NOTE_LENGTH,
  UPGRADE_REQUEST_SOURCES,
} from "@/lib/constants";
import { rateLimit } from "@/lib/rate-limit";
import { createUpgradeRequest } from "@/lib/upgrade-requests";

const requestSchema = z.object({
  source: z.enum(UPGRADE_REQUEST_SOURCES),
  note: z
    .string()
    .trim()
    .max(MAX_UPGRADE_NOTE_LENGTH, "Keep it under a few sentences.")
    .optional(),
});

/**
 * "I want the paid features." The only thing an owner can do about premium
 * while the market test runs — there is nothing to buy, by design.
 */
export async function requestUpgrade(input: {
  source: string;
  note?: string;
}): Promise<{ error: string | null }> {
  const user = await requireUser();

  const parsed = requestSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "That didn't send." };
  }

  // Sends an email to us, so it gets the same treatment as the other outbound
  // paths: a handful an hour is plenty for a person, and stops a loop.
  const limit = rateLimit({
    key: `upgrade-request:${user.id}`,
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });
  if (!limit.allowed) {
    return { error: "You've already sent that. We'll be in touch shortly." };
  }

  const business = await getBusinessForOwner(user.id);

  const result = await createUpgradeRequest({
    userId: user.id,
    businessId: business?.id ?? null,
    businessName: business?.name ?? null,
    source: parsed.data.source,
    note: parsed.data.note?.trim() || null,
  });

  if (result.error) return { error: result.error };

  // The plan chip, the account menu and every lock read the same status.
  revalidatePath("/", "layout");
  return { error: null };
}
