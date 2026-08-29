import { sql } from "drizzle-orm";
import { authUid } from "drizzle-orm/supabase";

/*
 * Shared RLS predicates. Ownership is always resolved by walking up to
 * `businesses.owner_id` — never by trusting a column on the row itself.
 *
 * The subqueries are wrapped in `select` so Postgres evaluates them once per
 * statement instead of once per row.
 */

/** Businesses owned by the signed-in user. */
export const ownedBusinessIds = sql`(select id from businesses where owner_id = ${authUid})`;

/** Quotes belonging to one of those businesses — for quote child tables. */
export const ownedQuoteIds = sql`(select id from quotes where business_id in ${ownedBusinessIds})`;
