import "server-only";

import { and, eq, inArray, lte, sql } from "drizzle-orm";

import {
  businesses,
  customers,
  profiles,
  quoteEvents,
  quotes,
} from "@/db/schema";
import { followUpDaysFor, isPaidPlan } from "@/lib/constants";
import { db } from "@/lib/db";
import { absoluteUrl, sendEmail } from "@/lib/email";
import { followUpEmail } from "@/lib/email-templates";
import { toPlan } from "@/lib/quota";

/*
 * The follow-up nudge (SPEC §12). This is what turns "sent" into "won" for the
 * quotes an owner would otherwise forget about, so it is deliberately
 * conservative: one nudge per quote, never after a decision, never twice.
 */

export type FollowUpRun = {
  considered: number;
  sent: number;
  skipped: number;
  failed: number;
};

/**
 * Finds quotes due a nudge and sends it.
 *
 * Due means: still sent or viewed (never accepted, declined or expired), older
 * than the business's configured window, the business hasn't switched nudges
 * off, and no follow_up_sent event exists for it yet. That last condition is
 * what makes re-running this safe.
 */
export async function runFollowUps(now = new Date()): Promise<FollowUpRun> {
  // Quotes that already got a nudge, excluded in SQL rather than in a loop.
  const alreadyNudged = db
    .select({ quoteId: quoteEvents.quoteId })
    .from(quoteEvents)
    .where(eq(quoteEvents.type, "follow_up_sent"));

  const candidates = await db
    .select({
      id: quotes.id,
      title: quotes.title,
      publicToken: quotes.publicToken,
      updatedAt: quotes.updatedAt,
      createdAt: quotes.createdAt,
      validUntil: quotes.validUntil,
      businessName: businesses.name,
      businessEmail: businesses.email,
      settings: businesses.settings,
      customerFirstName: customers.firstName,
      customerLastName: customers.lastName,
      customerEmail: customers.email,
      /* Chasing is a send, and sends are invite-only during the market test. */
      ownerPlan: profiles.plan,
      sentAt: sql<Date | null>`(
        select min(${quoteEvents.createdAt})
        from ${quoteEvents}
        where ${quoteEvents.quoteId} = ${quotes.id}
          and ${quoteEvents.type} = 'sent'
      )`,
    })
    .from(quotes)
    .innerJoin(businesses, eq(quotes.businessId, businesses.id))
    .innerJoin(profiles, eq(businesses.ownerId, profiles.id))
    .leftJoin(customers, eq(quotes.customerId, customers.id))
    .where(
      and(
        inArray(quotes.status, ["sent", "viewed"]),
        sql`${quotes.id} not in ${alreadyNudged}`,
      ),
    );

  const run: FollowUpRun = {
    considered: candidates.length,
    sent: 0,
    skipped: 0,
    failed: 0,
  };

  for (const quote of candidates) {
    /*
     * Automatic follow-up is one of the features granted by hand while we
     * find out whether anyone wants it. A free-plan quote is counted and
     * skipped rather than filtered out in SQL, so the run report still says
     * how many nudges the paid version would have sent.
     */
    if (!isPaidPlan(toPlan(quote.ownerPlan))) {
      run.skipped += 1;
      continue;
    }

    const days = followUpDaysFor(quote.settings);

    // 0 means the owner turned nudges off.
    if (days === 0) {
      run.skipped += 1;
      continue;
    }

    // Never chase a quote the customer can no longer accept.
    if (
      quote.validUntil &&
      new Date(quote.validUntil).getTime() < now.getTime()
    ) {
      run.skipped += 1;
      continue;
    }

    if (!quote.customerEmail) {
      run.skipped += 1;
      continue;
    }

    // Measure from when it was actually sent, falling back to creation.
    const sentAt = quote.sentAt
      ? new Date(quote.sentAt)
      : new Date(quote.createdAt);
    const dueAt = sentAt.getTime() + days * 24 * 60 * 60 * 1000;
    if (now.getTime() < dueAt) {
      run.skipped += 1;
      continue;
    }

    const customerName =
      [quote.customerFirstName, quote.customerLastName]
        .filter(Boolean)
        .join(" ") || null;

    const result = await sendEmail({
      to: quote.customerEmail,
      replyTo: quote.businessEmail,
      content: followUpEmail({
        businessName: quote.businessName,
        customerName,
        quoteTitle: quote.title,
        quoteUrl: absoluteUrl(`/q/${quote.publicToken}`),
      }),
    });

    if (result.error) {
      run.failed += 1;
      continue;
    }

    // Recorded only after a successful send, so a failure retries tomorrow.
    await db.insert(quoteEvents).values({
      quoteId: quote.id,
      type: "follow_up_sent",
      meta: {
        to: quote.customerEmail,
        messageId: result.id ?? "",
        afterDays: String(days),
        sentAt: now.toISOString(),
      },
    });

    run.sent += 1;
  }

  return run;
}

/** Marks quotes past their valid_until as expired, so the list tells the truth. */
export async function expireStaleQuotes(now = new Date()): Promise<number> {
  const expired = await db
    .update(quotes)
    .set({ status: "expired" })
    .where(
      and(
        inArray(quotes.status, ["sent", "viewed"]),
        lte(quotes.validUntil, now),
      ),
    )
    .returning({ id: quotes.id });

  return expired.length;
}
