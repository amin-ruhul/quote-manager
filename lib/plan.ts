import "server-only";

import { desc, eq } from "drizzle-orm";
import { cache } from "react";

import { profiles, upgradeRequests } from "@/db/schema";
import {
  DEFAULT_PLAN,
  FREE_QUOTES_PER_MONTH,
  isPaidPlan,
  type Plan,
  QUOTA_WARN_AT,
} from "@/lib/constants";
import { db } from "@/lib/db";
import { toPlan, usedThisMonth } from "@/lib/quota";

/**
 * The plan and quota the app chrome needs.
 *
 * Read here rather than in each screen so the header, the plan page and
 * anything that grows on top of them agree. Cached per request, like the other
 * session reads in `lib/auth.ts`.
 *
 * NOTE: this reports usage, it does not enforce it. The gate is
 * `consumeQuoteQuota` in `lib/quota.ts` — showing a meter is not the same as
 * refusing a create, and they must not be able to disagree, which is why both
 * read the month through the same `usedThisMonth`.
 */
export type PlanStatus = {
  plan: Plan;
  /** Quotes created this billing month. */
  used: number;
  /** The cap, or null on a granted plan where there isn't one. */
  limit: number | null;
  /** 0–1 on the free plan, null when unlimited. */
  fraction: number | null;
  /** Past the point where the meter should start warning. */
  nearLimit: boolean;
  /** Already at or over the cap. */
  atLimit: boolean;
  /** True once the owner has asked for access and we haven't granted it yet. */
  hasPendingRequest: boolean;
};

export const getPlanStatus = cache(
  async (userId: string): Promise<PlanStatus> => {
    /*
     * The pending request rides along with the plan because every surface that
     * shows the plan also has to decide between "Request access" and "Request
     * sent" — fetching it separately in each of them would be four more round
     * trips for one boolean.
     */
    const [[row], [pending]] = await Promise.all([
      db
        .select({
          plan: profiles.plan,
          quotesUsedThisMonth: profiles.quotesUsedThisMonth,
          quotaPeriodStart: profiles.quotaPeriodStart,
        })
        .from(profiles)
        .where(eq(profiles.id, userId))
        .limit(1),
      db
        .select({ id: upgradeRequests.id })
        .from(upgradeRequests)
        .where(eq(upgradeRequests.userId, userId))
        .orderBy(desc(upgradeRequests.createdAt))
        .limit(1),
    ]);

    const plan = toPlan(row?.plan ?? DEFAULT_PLAN);
    const used = row ? usedThisMonth(row) : 0;
    const hasPendingRequest = Boolean(pending) && !isPaidPlan(plan);

    if (isPaidPlan(plan)) {
      return {
        plan,
        used,
        limit: null,
        fraction: null,
        nearLimit: false,
        atLimit: false,
        hasPendingRequest: false,
      };
    }

    const limit = FREE_QUOTES_PER_MONTH;
    const fraction = Math.min(used / limit, 1);

    return {
      plan,
      used,
      limit,
      fraction,
      nearLimit: fraction >= QUOTA_WARN_AT,
      atLimit: used >= limit,
      hasPendingRequest,
    };
  },
);

/**
 * The server-side guard for features that cost money on every use — AI
 * drafting and email sending. The UI locks them too, but a lock drawn in the
 * browser is decoration: this is the one that counts.
 */
export async function hasPremiumAccess(userId: string): Promise<boolean> {
  const { plan } = await getPlanStatus(userId);
  return isPaidPlan(plan);
}
