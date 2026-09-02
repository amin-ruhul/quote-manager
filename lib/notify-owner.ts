import "server-only";

import { eq } from "drizzle-orm";

import { businesses, customers, profiles, quotes } from "@/db/schema";
import { type Currency, pushTagForQuote } from "@/lib/constants";
import { db } from "@/lib/db";
import { absoluteUrl, sendEmailQuietly } from "@/lib/email";
import { quoteAcceptedEmail, quoteViewedEmail } from "@/lib/email-templates";
import { formatCents } from "@/lib/money";
import { sendPushToOwner } from "@/lib/push";
import { acceptedNotification, viewedNotification } from "@/lib/push-templates";

/*
 * Owner notifications (SPEC §12, §15). Email and push carry the same news on
 * the same events: email is the record, push is the one that reaches an
 * electrician who is up a ladder.
 *
 * Every function here is best-effort. A notification must never fail the
 * customer's page or the owner's request, so they log and move on rather than
 * throwing. Both events already fire exactly once — accepting is conditional on
 * the status, and only the first sent -> viewed transition notifies — so
 * neither channel has to de-duplicate.
 */

async function loadOwnerContext(quoteId: string) {
  const [row] = await db
    .select({
      quoteNumber: quotes.quoteNumber,
      title: quotes.title,
      total: quotes.total,
      currency: businesses.currency,
      // Push goes to the person's devices, so it needs the owner, not just an
      // address to mail.
      ownerId: businesses.ownerId,
      // Prefer the business's own contact address; fall back to the login email.
      businessEmail: businesses.email,
      ownerEmail: profiles.email,
      customerFirstName: customers.firstName,
      customerLastName: customers.lastName,
    })
    .from(quotes)
    .innerJoin(businesses, eq(quotes.businessId, businesses.id))
    .innerJoin(profiles, eq(businesses.ownerId, profiles.id))
    .leftJoin(customers, eq(quotes.customerId, customers.id))
    .where(eq(quotes.id, quoteId))
    .limit(1);

  if (!row) return null;

  const to = row.businessEmail || row.ownerEmail;
  if (!to) return null;

  const customerName =
    [row.customerFirstName, row.customerLastName].filter(Boolean).join(" ") ||
    null;

  return { ...row, to, customerName };
}

/**
 * Runs the channels together so a slow or broken one can't hold up or sink the
 * other. Rejections are logged here because `allSettled` would otherwise
 * swallow them silently.
 */
async function notifyAll(
  quoteId: string,
  channels: Record<string, Promise<unknown>>,
): Promise<void> {
  const names = Object.keys(channels);
  const results = await Promise.allSettled(Object.values(channels));

  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error("Owner notification channel failed", {
        quoteId,
        channel: names[index],
        error: result.reason,
      });
    }
  });
}

/** "Your customer opened it." Sent on the first open only — see recordQuoteViewed. */
export async function notifyOwnerViewed(quoteId: string): Promise<void> {
  try {
    const context = await loadOwnerContext(quoteId);
    if (!context) return;

    const builderUrl = `/quotes/${quoteId}`;
    const alert = viewedNotification({
      customerName: context.customerName,
      quoteTitle: context.title,
      quoteNumber: context.quoteNumber,
    });

    await notifyAll(quoteId, {
      email: sendEmailQuietly({
        to: context.to,
        content: quoteViewedEmail({
          customerName: context.customerName,
          quoteTitle: context.title,
          quoteNumber: context.quoteNumber,
          builderUrl: absoluteUrl(builderUrl),
        }),
      }),
      push: sendPushToOwner(context.ownerId, {
        ...alert,
        url: builderUrl,
        tag: pushTagForQuote(quoteId),
      }),
    });
  } catch (error) {
    console.error("Owner viewed-notification failed", { quoteId, error });
  }
}

/** "You won the job." */
export async function notifyOwnerAccepted(
  quoteId: string,
  signedName: string | null,
): Promise<void> {
  try {
    const context = await loadOwnerContext(quoteId);
    if (!context) return;

    const builderUrl = `/quotes/${quoteId}`;
    const totalFormatted = formatCents(
      context.total,
      context.currency as Currency,
    );
    const alert = acceptedNotification({
      customerName: context.customerName,
      quoteTitle: context.title,
      totalFormatted,
    });

    await notifyAll(quoteId, {
      email: sendEmailQuietly({
        to: context.to,
        content: quoteAcceptedEmail({
          customerName: context.customerName,
          quoteTitle: context.title,
          quoteNumber: context.quoteNumber,
          totalFormatted,
          signedName,
          builderUrl: absoluteUrl(builderUrl),
        }),
      }),
      push: sendPushToOwner(context.ownerId, {
        ...alert,
        url: builderUrl,
        // Same tag as the "opened" alert: the win replaces it on the lock
        // screen rather than stacking two notices about one quote.
        tag: pushTagForQuote(quoteId),
      }),
    });
  } catch (error) {
    console.error("Owner accepted-notification failed", { quoteId, error });
  }
}
