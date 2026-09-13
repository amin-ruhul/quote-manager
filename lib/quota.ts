import "server-only";

import { eq } from "drizzle-orm";

import { profiles } from "@/db/schema";
import {
  DEFAULT_PLAN,
  FREE_QUOTES_PER_MONTH,
  isPaidPlan,
  type Plan,
  PLANS,
} from "@/lib/constants";
import { db } from "@/lib/db";

/*
 * The freemium gate (SPEC §14, Phase 6). This is the ONLY place a create is
 * refused for being over the cap — `lib/plan.ts` next door reports usage and
 * never blocks, which keeps "what the meter says" and "what the wall does" from
 * drifting apart.
 *
 * A counter, not a count of rows: deleting a quote must not hand back a slot,
 * or the cap is a suggestion.
 */

/** Narrows the free-text `plan` column to a Plan, defaulting safely. */
export function toPlan(value: string): Plan {
  return PLANS.includes(value as Plan) ? (value as Plan) : DEFAULT_PLAN;
}

/** First moment of the month `now` falls in, in UTC. */
export function monthStart(now: Date = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

/**
 * The counter, but only if it belongs to the month we're in. A count left over
 * from March would otherwise lock someone out for the whole of April: the
 * number alone cannot say which month it counted.
 */
export function usedThisMonth(
  row: { quotesUsedThisMonth: number; quotaPeriodStart: Date | null },
  now: Date = new Date(),
): number {
  if (!row.quotaPeriodStart) return 0;
  return row.quotaPeriodStart.getTime() >= monthStart(now).getTime()
    ? row.quotesUsedThisMonth
    : 0;
}

export type QuotaDecision = {
  allowed: boolean;
  plan: Plan;
  /** Quotes used this month, after this one if it was allowed. */
  used: number;
  /** The cap, or null on a granted plan where there isn't one. */
  limit: number | null;
};

/**
 * Claims one quote against this month's allowance.
 *
 * Read and write happen in one transaction with the profile row locked, so two
 * taps on "New quote" from the same phone can't both slip past the tenth.
 * Call this BEFORE creating a quote and abandon the create when `allowed` is
 * false — nothing here rolls a counter back.
 */
export async function consumeQuoteQuota(
  userId: string,
): Promise<QuotaDecision> {
  const now = new Date();

  return db.transaction(async (tx) => {
    const [row] = await tx
      .select({
        plan: profiles.plan,
        quotesUsedThisMonth: profiles.quotesUsedThisMonth,
        quotaPeriodStart: profiles.quotaPeriodStart,
      })
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1)
      .for("update");

    // No profile row is a bug, not a licence: refuse rather than hand out a
    // free pass on an account we can't meter.
    if (!row) {
      return { allowed: false, plan: DEFAULT_PLAN, used: 0, limit: 0 };
    }

    const plan = toPlan(row.plan);
    const used = usedThisMonth(row, now);

    if (isPaidPlan(plan)) {
      // Still counted — knowing what a granted account actually uses is half
      // the point of the market test.
      await tx
        .update(profiles)
        .set({
          quotesUsedThisMonth: used + 1,
          quotaPeriodStart: monthStart(now),
        })
        .where(eq(profiles.id, userId));

      return { allowed: true, plan, used: used + 1, limit: null };
    }

    if (used >= FREE_QUOTES_PER_MONTH) {
      return { allowed: false, plan, used, limit: FREE_QUOTES_PER_MONTH };
    }

    await tx
      .update(profiles)
      .set({ quotesUsedThisMonth: used + 1, quotaPeriodStart: monthStart(now) })
      .where(eq(profiles.id, userId));

    return {
      allowed: true,
      plan,
      used: used + 1,
      limit: FREE_QUOTES_PER_MONTH,
    };
  });
}
