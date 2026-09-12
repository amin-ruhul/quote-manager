import "server-only";

import { and, asc, eq } from "drizzle-orm";

import {
  businesses,
  customers,
  profiles,
  quoteAttachments,
  quoteEvents,
  quoteItems,
  quoteOptions,
  quotes,
} from "@/db/schema";
import { db } from "@/lib/db";
import { notifyOwnerViewed } from "@/lib/notify-owner";

/*
 * The customer-facing quote (SPEC §11).
 *
 * This module is the ONLY way quote data reaches a visitor with no session, so
 * every query below selects an explicit column list. Nothing here spreads a row:
 * a `select()` with no argument would leak business_id, owner ids and the
 * public_token itself the moment a column is added.
 *
 * Lookup is by public_token alone. The token is 24 random base64url characters
 * (144 bits), so it is not guessable, and it is never echoed back to the page.
 */

export type PublicQuote = Awaited<ReturnType<typeof getQuoteByPublicToken>>;

export async function getQuoteByPublicToken(token: string) {
  const [quoteRow] = await db
    .select({
      id: quotes.id,
      quoteNumber: quotes.quoteNumber,
      title: quotes.title,
      scopeOfWork: quotes.scopeOfWork,
      status: quotes.status,
      subtotal: quotes.subtotal,
      discount: quotes.discount,
      tax: quotes.tax,
      taxRate: quotes.taxRate,
      total: quotes.total,
      validUntil: quotes.validUntil,
      terms: quotes.terms,
      businessName: businesses.name,
      businessLogoUrl: businesses.logoUrl,
      businessPhone: businesses.phone,
      businessEmail: businesses.email,
      businessWebsite: businesses.website,
      businessLicense: businesses.licenseNumber,
      currency: businesses.currency,
      customerTaxExempt: customers.taxExempt,
      customerFirstName: customers.firstName,
      customerLastName: customers.lastName,
      // Drives the "Made with QuotePilot" footer, which Business plans remove.
      ownerPlan: profiles.plan,
    })
    .from(quotes)
    .innerJoin(businesses, eq(quotes.businessId, businesses.id))
    .innerJoin(profiles, eq(businesses.ownerId, profiles.id))
    .leftJoin(customers, eq(quotes.customerId, customers.id))
    .where(eq(quotes.publicToken, token))
    .limit(1);

  if (!quoteRow) return null;

  const [items, options, photos] = await Promise.all([
    db
      .select({
        id: quoteItems.id,
        optionId: quoteItems.optionId,
        name: quoteItems.name,
        description: quoteItems.description,
        quantity: quoteItems.quantity,
        unit: quoteItems.unit,
        unitPrice: quoteItems.unitPrice,
        total: quoteItems.total,
        type: quoteItems.type,
      })
      .from(quoteItems)
      .where(eq(quoteItems.quoteId, quoteRow.id))
      .orderBy(asc(quoteItems.position)),
    db
      .select({
        id: quoteOptions.id,
        name: quoteOptions.name,
        description: quoteOptions.description,
        total: quoteOptions.total,
        isRecommended: quoteOptions.isRecommended,
      })
      .from(quoteOptions)
      .where(eq(quoteOptions.quoteId, quoteRow.id))
      .orderBy(asc(quoteOptions.position)),
    db
      .select({
        id: quoteAttachments.id,
        url: quoteAttachments.url,
        caption: quoteAttachments.caption,
      })
      .from(quoteAttachments)
      .where(eq(quoteAttachments.quoteId, quoteRow.id))
      .orderBy(asc(quoteAttachments.position)),
  ]);

  return { ...quoteRow, items, options, photos };
}

/**
 * Records a view (SPEC §11, golden rule 9). Every open is written — how often a
 * customer reopens a quote is exactly the signal the moat is built from.
 *
 * Status moves sent -> viewed only. A draft the owner is previewing stays a
 * draft, and an accepted quote is never walked backwards.
 */
export async function recordQuoteViewed(
  quoteId: string,
  meta: Record<string, string>,
): Promise<void> {
  const firstOpen = await db.transaction(async (tx) => {
    await tx.insert(quoteEvents).values({ quoteId, type: "viewed", meta });

    const moved = await tx
      .update(quotes)
      .set({ status: "viewed" })
      .where(and(eq(quotes.id, quoteId), eq(quotes.status, "sent")))
      .returning({ id: quotes.id });

    // Only the sent -> viewed transition is the first open; later reloads
    // update nothing, which is what stops the owner being emailed repeatedly.
    return moved.length > 0;
  });

  if (firstOpen) await notifyOwnerViewed(quoteId);
}
