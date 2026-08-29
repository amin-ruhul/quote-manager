"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { businesses, customers, quoteEvents, quotes } from "@/db/schema";
import type { Currency } from "@/lib/constants";
import { db } from "@/lib/db";
import { absoluteUrl, sendEmail } from "@/lib/email";
import { quoteSentEmail } from "@/lib/email-templates";
import { formatCents } from "@/lib/money";
import { requireOwnedQuote } from "@/lib/quotes";

/** Loads everything both the link and the email need, in one query. */
async function loadSendable(quoteId: string) {
  const [row] = await db
    .select({
      status: quotes.status,
      publicToken: quotes.publicToken,
      title: quotes.title,
      total: quotes.total,
      validUntil: quotes.validUntil,
      businessName: businesses.name,
      businessEmail: businesses.email,
      currency: businesses.currency,
      customerFirstName: customers.firstName,
      customerLastName: customers.lastName,
      customerEmail: customers.email,
    })
    .from(quotes)
    .innerJoin(businesses, eq(quotes.businessId, businesses.id))
    .leftJoin(customers, eq(quotes.customerId, customers.id))
    .where(eq(quotes.id, quoteId))
    .limit(1);

  return row ?? null;
}

/** Marks a draft sent and records the event. Idempotent for later re-sends. */
async function markSent(
  quoteId: string,
  status: string,
  meta: Record<string, string>,
) {
  await db.transaction(async (tx) => {
    if (status === "draft") {
      await tx
        .update(quotes)
        .set({ status: "sent", updatedAt: new Date() })
        .where(eq(quotes.id, quoteId));
    }
    // Every send is an event, including re-sends of an already-sent quote.
    await tx.insert(quoteEvents).values({ quoteId, type: "sent", meta });
  });
}

/**
 * Produces the customer link without emailing, for owners who'd rather text it
 * or read it out. Still counts as sending — the customer can now open it.
 */
export async function shareQuote(
  quoteId: string,
): Promise<{ url: string; error: null } | { url: null; error: string }> {
  const owned = await requireOwnedQuote(quoteId);
  if (!owned) return { url: null, error: "That quote no longer exists." };

  try {
    const quote = await loadSendable(owned.quoteId);
    if (!quote) return { url: null, error: "That quote no longer exists." };

    if (quote.status === "draft") {
      await markSent(owned.quoteId, quote.status, {
        via: "link",
        sentAt: new Date().toISOString(),
      });
      revalidatePath(`/quotes/${owned.quoteId}`);
      revalidatePath("/quotes");
    }

    return { url: absoluteUrl(`/q/${quote.publicToken}`), error: null };
  } catch (error) {
    console.error("Sharing quote failed", { quoteId: owned.quoteId, error });
    return { url: null, error: "We couldn't prepare the link. Try again." };
  }
}

const emailSchema = z.email("Enter a valid email address.");

/**
 * Emails the quote link to the customer (SPEC §12) and moves the quote to sent.
 *
 * The email failing is a real failure the owner must see — unlike a
 * notification, this is the thing they asked for — so the status only moves
 * once Resend has accepted the message.
 */
export async function sendQuoteEmail(
  quoteId: string,
  overrideEmail: string | null,
): Promise<{ sentTo: string; error: null } | { sentTo: null; error: string }> {
  const owned = await requireOwnedQuote(quoteId);
  if (!owned) return { sentTo: null, error: "That quote no longer exists." };

  const quote = await loadSendable(owned.quoteId);
  if (!quote) return { sentTo: null, error: "That quote no longer exists." };

  const parsed = emailSchema.safeParse(
    overrideEmail ?? quote.customerEmail ?? "",
  );
  if (!parsed.success) {
    return {
      sentTo: null,
      error: "Add an email address for this customer first.",
    };
  }

  const customerName = [quote.customerFirstName, quote.customerLastName]
    .filter(Boolean)
    .join(" ");

  const content = quoteSentEmail({
    businessName: quote.businessName,
    customerName: customerName || null,
    quoteTitle: quote.title,
    totalFormatted: formatCents(quote.total, quote.currency as Currency),
    quoteUrl: absoluteUrl(`/q/${quote.publicToken}`),
    validUntil: quote.validUntil
      ? new Intl.DateTimeFormat("en-US", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(new Date(quote.validUntil))
      : null,
  });

  // Replies go to the business, not to our sending domain.
  const result = await sendEmail({
    to: parsed.data,
    replyTo: quote.businessEmail,
    content,
  });

  if (result.error) {
    return {
      sentTo: null,
      error: `We couldn't send that email. ${result.error}`,
    };
  }

  await markSent(owned.quoteId, quote.status, {
    via: "email",
    to: parsed.data,
    messageId: result.id ?? "",
    sentAt: new Date().toISOString(),
  });

  revalidatePath(`/quotes/${owned.quoteId}`);
  revalidatePath("/quotes");
  return { sentTo: parsed.data, error: null };
}
