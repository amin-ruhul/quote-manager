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

import { profiles } from "./core";

/*
 * Web push subscriptions — one row per browser the owner has turned alerts on
 * in (SPEC §15).
 *
 * Scoped to the OWNER, not the business: a subscription is a device, and the
 * person is who gets buzzed when a customer accepts. Everything else in the
 * schema hangs off business_id, so this is the deliberate exception.
 */
export const pushSubscriptions = pgTable(
  "push_subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    /*
     * The push service URL the browser handed us. Unique because browsers
     * rotate endpoints and re-subscribe on their own: without this, one phone
     * would collect rows and get the same alert several times. It is also what
     * lets a device that changed hands move to its new owner on conflict.
     */
    endpoint: text("endpoint").notNull().unique(),
    /** Client public key — payloads are encrypted to it. */
    p256dh: text("p256dh").notNull(),
    /** Client auth secret, part of the same encryption handshake. */
    auth: text("auth").notNull(),
    /** Only so the owner can tell their phone from their laptop in settings. */
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    /** Refreshed whenever the browser re-confirms the subscription is live. */
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("push_subscriptions_owner_id_idx").on(table.ownerId),
    // Ownership is the user directly here, so there is no business to walk up to.
    pgPolicy("push_subscriptions_all_own", {
      for: "all",
      to: authenticatedRole,
      using: sql`${authUid} = ${table.ownerId}`,
      withCheck: sql`${authUid} = ${table.ownerId}`,
    }),
  ],
).enableRLS();

export type PushSubscriptionRow = typeof pushSubscriptions.$inferSelect;
export type NewPushSubscription = typeof pushSubscriptions.$inferInsert;
