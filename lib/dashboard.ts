import "server-only";

import { and, desc, eq, gte, sql } from "drizzle-orm";

import { customers, quotes } from "@/db/schema";
import { db } from "@/lib/db";

/*
 * Dashboard figures (SPEC §12). Everything is money-in-cents and counted in
 * SQL, so a busy month doesn't ship thousands of rows to the server just to
 * add them up.
 */

export type MonthStats = {
  sent: number;
  accepted: number;
  /** Basis points, so the percentage stays an integer like every other rate. */
  acceptanceRateBasisPoints: number;
  quotedCents: number;
  wonCents: number;
};

export function startOfThisMonth(now = new Date()): Date {
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

/**
 * "Sent" counts every quote that left draft this month, whatever happened
 * next — an accepted quote was still sent. Acceptance rate is accepted over
 * sent, and is zero rather than NaN when nothing has gone out yet.
 */
export async function getMonthStats(
  businessId: string,
  since: Date,
): Promise<MonthStats> {
  const [row] = await db
    .select({
      sent: sql<number>`count(*) filter (where ${quotes.status} <> 'draft')::int`,
      accepted: sql<number>`count(*) filter (where ${quotes.status} = 'accepted')::int`,
      quotedCents: sql<number>`coalesce(sum(${quotes.total}) filter (where ${quotes.status} <> 'draft'), 0)::int`,
      wonCents: sql<number>`coalesce(sum(${quotes.total}) filter (where ${quotes.status} = 'accepted'), 0)::int`,
    })
    .from(quotes)
    .where(
      and(eq(quotes.businessId, businessId), gte(quotes.createdAt, since)),
    );

  const sent = row?.sent ?? 0;
  const accepted = row?.accepted ?? 0;

  return {
    sent,
    accepted,
    acceptanceRateBasisPoints:
      sent > 0 ? Math.round((accepted / sent) * 10_000) : 0,
    quotedCents: row?.quotedCents ?? 0,
    wonCents: row?.wonCents ?? 0,
  };
}

export type RecentQuote = {
  id: string;
  quoteNumber: string;
  title: string;
  status: string;
  total: number;
  updatedAt: Date;
  customerFirstName: string | null;
  customerLastName: string | null;
};

export async function getRecentQuotes(
  businessId: string,
  limit = 5,
): Promise<RecentQuote[]> {
  return db
    .select({
      id: quotes.id,
      quoteNumber: quotes.quoteNumber,
      title: quotes.title,
      status: quotes.status,
      total: quotes.total,
      updatedAt: quotes.updatedAt,
      customerFirstName: customers.firstName,
      customerLastName: customers.lastName,
    })
    .from(quotes)
    .leftJoin(customers, eq(quotes.customerId, customers.id))
    .where(eq(quotes.businessId, businessId))
    .orderBy(desc(quotes.updatedAt))
    .limit(limit);
}
