import "server-only";

import { eq } from "drizzle-orm";

import { businesses, customers, profiles, quotes } from "@/db/schema";
import type { Currency } from "@/lib/constants";
import { db } from "@/lib/db";
import { absoluteUrl, sendEmailQuietly } from "@/lib/email";
import { quoteAcceptedEmail, quoteViewedEmail } from "@/lib/email-templates";
import { formatCents } from "@/lib/money";

/*
 * Owner notifications (SPEC §12). Every function here is best-effort: a
 * notification must never fail the customer's page or the owner's request, so
 * they log and move on rather than throwing.
 */

async function loadOwnerContext(quoteId: string) {
  const [row] = await db
    .select({
      quoteNumber: quotes.quoteNumber,
      title: quotes.title,
      total: quotes.total,
      currency: businesses.currency,
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

/** "Your customer opened it." Sent on the first open only — see recordQuoteViewed. */
export async function notifyOwnerViewed(quoteId: string): Promise<void> {
  try {
    const context = await loadOwnerContext(quoteId);
    if (!context) return;

    await sendEmailQuietly({
      to: context.to,
      content: quoteViewedEmail({
        customerName: context.customerName,
        quoteTitle: context.title,
        quoteNumber: context.quoteNumber,
        builderUrl: absoluteUrl(`/quotes/${quoteId}`),
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

    await sendEmailQuietly({
      to: context.to,
      content: quoteAcceptedEmail({
        customerName: context.customerName,
        quoteTitle: context.title,
        quoteNumber: context.quoteNumber,
        totalFormatted: formatCents(
          context.total,
          context.currency as Currency,
        ),
        signedName,
        builderUrl: absoluteUrl(`/quotes/${quoteId}`),
      }),
    });
  } catch (error) {
    console.error("Owner accepted-notification failed", { quoteId, error });
  }
}
