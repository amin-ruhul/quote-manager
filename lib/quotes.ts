import "server-only";

import { randomBytes } from "node:crypto";
import { and, asc, eq, sql } from "drizzle-orm";
import { z } from "zod";

import {
  quoteAttachments,
  quoteItems,
  quoteOptions,
  quotes,
} from "@/db/schema";
import { requireBusiness } from "@/lib/auth";
import { db } from "@/lib/db";
import { quoteTotals } from "@/lib/quote-math";

/*
 * Server-side quote helpers. Totals are ALWAYS recomputed here from the stored
 * line items — never taken from the client, which could send any number it likes.
 */

/** Unguessable id for the public quote page (Phase 3). */
export function generatePublicToken(): string {
  return randomBytes(18).toString("base64url");
}

/**
 * Confirms a quote belongs to the signed-in owner's business. Every quote
 * mutation goes through this: the quote id arrives from the client, ownership
 * never does. Returns null when the quote is missing or someone else's — the
 * two are deliberately indistinguishable to the caller.
 */
export async function requireOwnedQuote(quoteId: string) {
  const { user, business } = await requireBusiness();

  if (!z.uuid().safeParse(quoteId).success) return null;

  const [quote] = await db
    .select({ id: quotes.id })
    .from(quotes)
    .where(and(eq(quotes.id, quoteId), eq(quotes.businessId, business.id)))
    .limit(1);

  return quote ? { user, business, quoteId: quote.id } : null;
}

/**
 * Next quote number for a business, as Q-0001. Derived from the count of
 * existing quotes inside the caller's transaction; the unique index on
 * (business_id, quote_number) is what actually guarantees no duplicates.
 */
export async function nextQuoteNumber(
  tx: Pick<typeof db, "select">,
  businessId: string,
): Promise<string> {
  const [row] = await tx
    .select({ count: sql<number>`count(*)::int` })
    .from(quotes)
    .where(eq(quotes.businessId, businessId));

  return `Q-${String((row?.count ?? 0) + 1).padStart(4, "0")}`;
}

export type QuoteWithChildren = {
  quote: typeof quotes.$inferSelect;
  items: (typeof quoteItems.$inferSelect)[];
  options: (typeof quoteOptions.$inferSelect)[];
  attachments: (typeof quoteAttachments.$inferSelect)[];
};

/**
 * One quote plus its children, scoped by business_id. Returns null rather than
 * throwing when the quote belongs to someone else, so callers can 404.
 */
export async function getQuoteForBusiness(
  quoteId: string,
  businessId: string,
): Promise<QuoteWithChildren | null> {
  if (!z.uuid().safeParse(quoteId).success) return null;

  /*
   * All four queries go out together rather than waiting for the parent row.
   * The children are keyed on the requested quote id, but nothing is returned
   * unless the parent SELECT — which is filtered by business_id — comes back,
   * so another owner's rows can never leave this function.
   */
  const [quoteRows, items, options, attachments] = await Promise.all([
    db
      .select()
      .from(quotes)
      .where(and(eq(quotes.id, quoteId), eq(quotes.businessId, businessId)))
      .limit(1),
    db
      .select()
      .from(quoteItems)
      .where(eq(quoteItems.quoteId, quoteId))
      .orderBy(asc(quoteItems.position)),
    db
      .select()
      .from(quoteOptions)
      .where(eq(quoteOptions.quoteId, quoteId))
      .orderBy(asc(quoteOptions.position)),
    db
      .select()
      .from(quoteAttachments)
      .where(eq(quoteAttachments.quoteId, quoteId))
      .orderBy(asc(quoteAttachments.position)),
  ]);

  const quote = quoteRows[0];
  if (!quote) return null;

  return { quote, items, options, attachments };
}

/**
 * Recompute and persist a quote's totals, and each option's total, from the
 * line items currently in the database. Call after any change to items,
 * options, discount, or tax rate.
 *
 * When a quote has options, the headline total follows the recommended option
 * (or the first one) — items with no option still count toward every option,
 * because they are the work common to all of them.
 */
export async function recalculateQuote(quoteId: string): Promise<void> {
  const [quote] = await db
    .select({
      id: quotes.id,
      discount: quotes.discount,
      taxRate: quotes.taxRate,
    })
    .from(quotes)
    .where(eq(quotes.id, quoteId))
    .limit(1);

  if (!quote) return;

  const [items, options] = await Promise.all([
    db.select().from(quoteItems).where(eq(quoteItems.quoteId, quoteId)),
    db
      .select()
      .from(quoteOptions)
      .where(eq(quoteOptions.quoteId, quoteId))
      .orderBy(asc(quoteOptions.position)),
  ]);

  const shared = items.filter((item) => item.optionId === null);

  const optionTotals = options.map((option) => ({
    id: option.id,
    total: quoteTotals({
      lines: [
        ...shared,
        ...items.filter((item) => item.optionId === option.id),
      ],
      discount: quote.discount,
      taxRateBasisPoints: quote.taxRate,
    }).total,
  }));

  await db.transaction(async (tx) => {
    /*
     * One statement for every option, not one per option. Each round trip to
     * the pooler costs ~100ms, and this runs on every line edit, so a
     * three-option quote was paying three of them for no reason.
     */
    if (optionTotals.length > 0) {
      const values = sql.join(
        optionTotals.map(
          (option) => sql`(${option.id}::uuid, ${option.total}::integer)`,
        ),
        sql`, `,
      );

      await tx.execute(sql`
        update ${quoteOptions} as o
        set total = v.total
        from (values ${values}) as v(id, total)
        where o.id = v.id
      `);
    }

    // With options, the headline figure is the recommended one (else the first).
    const headlineOption =
      options.find((option) => option.isRecommended) ?? options[0];

    const headlineLines = headlineOption
      ? [
          ...shared,
          ...items.filter((item) => item.optionId === headlineOption.id),
        ]
      : items;

    const totals = quoteTotals({
      lines: headlineLines,
      discount: quote.discount,
      taxRateBasisPoints: quote.taxRate,
    });

    await tx
      .update(quotes)
      .set({ ...totals, updatedAt: new Date() })
      .where(eq(quotes.id, quoteId));
  });
}
