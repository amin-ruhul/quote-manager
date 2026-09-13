import "server-only";

import { and, eq, sql } from "drizzle-orm";

import { profiles, upgradeRequests } from "@/db/schema";
import type { UpgradeRequestSource } from "@/lib/constants";
import { db } from "@/lib/db";
import { sendEmailQuietly } from "@/lib/email";
import { upgradeRequestEmail } from "@/lib/email-templates";

/*
 * "Ask for premium" — the market test's only write path (SPEC §16 is on hold
 * until it pays for itself).
 *
 * Everything here is deliberately dumb: a row, a count, a notification. When
 * the count reaches thirty or forty, billing gets built for real and
 * `BILLING_ENABLED` flips; nothing in this file has to change for that.
 */

export type UpgradeRequestResult =
  { created: boolean; error: null } | { created: false; error: string };

/**
 * Records a request, unless this owner already asked from this same screen.
 *
 * One row per (owner, source) rather than one per owner: asking at the AI lock
 * after asking at the quota wall would be a second piece of information —
 * asking twice at the same door is not.
 *
 * In practice the first ask is usually the only one, because every lock stops
 * asking once an owner has requested anything. The rule below is what keeps a
 * double-tap, or a retried action, from counting twice.
 */
export async function createUpgradeRequest(input: {
  userId: string;
  businessId: string | null;
  businessName: string | null;
  source: UpgradeRequestSource;
  note: string | null;
}): Promise<UpgradeRequestResult> {
  try {
    const [existing] = await db
      .select({ id: upgradeRequests.id })
      .from(upgradeRequests)
      .where(
        and(
          eq(upgradeRequests.userId, input.userId),
          eq(upgradeRequests.source, input.source),
        ),
      )
      .limit(1);

    if (existing) return { created: false, error: null };

    await db.insert(upgradeRequests).values({
      userId: input.userId,
      businessId: input.businessId,
      businessName: input.businessName,
      source: input.source,
      note: input.note,
    });
  } catch (error) {
    console.error("Recording an upgrade request failed", {
      userId: input.userId,
      source: input.source,
      error,
    });
    return {
      created: false,
      error: "We couldn't send that just now. Try again.",
    };
  }

  // Best-effort and after the fact: the request is safely stored either way,
  // and a bounced notification must not tell the owner their ask failed.
  await notifyOperator(input);

  return { created: true, error: null };
}

/** How many owners have asked so far — the number the whole test is watching. */
export async function countUpgradeRequests(): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(upgradeRequests);

  return row?.count ?? 0;
}

async function notifyOperator(input: {
  userId: string;
  businessName: string | null;
  source: UpgradeRequestSource;
  note: string | null;
}): Promise<void> {
  /*
   * Our address, not the owner's. Unset in development on purpose — the row in
   * the table is the record, the email is just the tap on the shoulder.
   */
  const to = process.env.UPGRADE_REQUEST_EMAIL;
  if (!to) {
    console.info("Upgrade request recorded; UPGRADE_REQUEST_EMAIL is not set", {
      userId: input.userId,
      source: input.source,
    });
    return;
  }

  const [owner] = await db
    .select({ email: profiles.email, fullName: profiles.fullName })
    .from(profiles)
    .where(eq(profiles.id, input.userId))
    .limit(1);

  await sendEmailQuietly({
    to,
    replyTo: owner?.email ?? null,
    content: upgradeRequestEmail({
      businessName: input.businessName,
      ownerName: owner?.fullName ?? null,
      ownerEmail: owner?.email ?? "unknown",
      source: input.source,
      note: input.note,
      totalRequests: await countUpgradeRequests(),
    }),
  });
}
