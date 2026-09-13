import { sql } from "drizzle-orm";
import {
  index,
  pgPolicy,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { authenticatedRole, authUid } from "drizzle-orm/supabase";

import {
  type UpgradeRequestSource,
  type UpgradeRequestStatus,
} from "@/lib/constants";
import { businesses, profiles } from "./core";

/*
 * "I want the paid features" — the whole market test in one table.
 *
 * Nothing is for sale while `BILLING_ENABLED` is false, so this is what an
 * owner does instead of paying: they ask. Thirty to forty rows here is the
 * signal to go and build billing for real.
 *
 * `source` is the interesting column. It records which locked door they were
 * standing at — the quota wall, AI drafting, email sending — which is the
 * difference between "people want *something*" and knowing what to build.
 */
export const upgradeRequests = pgTable(
  "upgrade_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    /*
     * Nullable: a request made before onboarding still counts. The business is
     * copied here rather than joined later so a deleted business doesn't erase
     * the evidence that someone asked.
     */
    businessId: uuid("business_id").references(() => businesses.id, {
      onDelete: "set null",
    }),
    /** Business name at the time of asking, so the email can say who it is. */
    businessName: text("business_name"),
    source: text("source").$type<UpgradeRequestSource>().notNull(),
    /** What they typed, if anything. Optional on purpose — asking is one tap. */
    note: text("note"),
    status: text("status")
      .$type<UpgradeRequestStatus>()
      .notNull()
      .default("new"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("upgrade_requests_user_id_idx").on(table.userId),
    index("upgrade_requests_created_at_idx").on(table.createdAt),
    /*
     * An owner may ask, and may see that they asked. Nothing else: the status
     * is moved by hand while the test runs, and a client that could write it
     * could grant itself access.
     */
    pgPolicy("upgrade_requests_select_own", {
      for: "select",
      to: authenticatedRole,
      using: sql`${table.userId} = ${authUid}`,
    }),
    pgPolicy("upgrade_requests_insert_own", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`${table.userId} = ${authUid}`,
    }),
  ],
).enableRLS();

export type UpgradeRequest = typeof upgradeRequests.$inferSelect;
export type NewUpgradeRequest = typeof upgradeRequests.$inferInsert;
