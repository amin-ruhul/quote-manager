import "server-only";

import { eq } from "drizzle-orm";
import { cache } from "react";

import { profiles } from "@/db/schema";
import {
  DEFAULT_PLAN,
  FREE_QUOTES_PER_MONTH,
  type Plan,
  PLANS,
  QUOTA_WARN_AT,
} from "@/lib/constants";
import { db } from "@/lib/db";

/**
 * The plan and quota the app chrome needs.
 *
 * Read here rather than in each screen so the header, the billing page and
 * anything that grows on top of them agree. Cached per request, like the other
 * session reads in `lib/auth.ts`.
 *
 * NOTE: this reports usage, it does not enforce it. The gate belongs in
 * `lib/quota.ts` with the rest of billing (SPEC §14, Phase 6) — showing a
 * meter is not the same as refusing a create, and only one of those is built.
 */
export type PlanStatus = {
  plan: Plan;
  /** Quotes created this billing month. */
  used: number;
  /** The cap, or null on a paid plan where there isn't one. */
  limit: number | null;
  /** 0–1 on the free plan, null when unlimited. */
  fraction: number | null;
  /** Past the point where the meter should start warning. */
  nearLimit: boolean;
  /** Already at or over the cap. */
  atLimit: boolean;
};

/** Narrows the free-text `plan` column to a Plan, defaulting safely. */
function toPlan(value: string): Plan {
  return PLANS.includes(value as Plan) ? (value as Plan) : DEFAULT_PLAN;
}

export const getPlanStatus = cache(
  async (userId: string): Promise<PlanStatus> => {
    const [row] = await db
      .select({
        plan: profiles.plan,
        used: profiles.quotesUsedThisMonth,
      })
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1);

    const plan = toPlan(row?.plan ?? DEFAULT_PLAN);
    const used = row?.used ?? 0;

    if (plan !== "free") {
      return {
        plan,
        used,
        limit: null,
        fraction: null,
        nearLimit: false,
        atLimit: false,
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
    };
  },
);
