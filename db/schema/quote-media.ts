import { sql } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgPolicy,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { authenticatedRole } from "drizzle-orm/supabase";

import { quotes } from "./quotes";
import { ownedQuoteIds } from "./rls";

/** Job photos shown on the quote (SPEC §5) — trades need these. */
export const quoteAttachments = pgTable(
  "quote_attachments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    quoteId: uuid("quote_id")
      .notNull()
      .references(() => quotes.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    /** Storage object path, kept so the file can be removed with the row. */
    storagePath: text("storage_path"),
    caption: text("caption"),
    position: integer("position").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("quote_attachments_quote_id_idx").on(table.quoteId),
    pgPolicy("quote_attachments_all_own_quote", {
      for: "all",
      to: authenticatedRole,
      using: sql`${table.quoteId} in ${ownedQuoteIds}`,
      withCheck: sql`${table.quoteId} in ${ownedQuoteIds}`,
    }),
  ],
).enableRLS();

/*
 * THE MOAT (SPEC §4, golden rule 9). Every sent / viewed / accepted / declined /
 * follow_up_sent is recorded here and never deleted — it is what later proves
 * "your panel quotes win 71% of the time".
 *
 * The table exists from the moment quotes do. Phase 3 starts writing to it;
 * nothing writes here yet, because a draft has no lifecycle events.
 */
export const quoteEvents = pgTable(
  "quote_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    quoteId: uuid("quote_id")
      .notNull()
      .references(() => quotes.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    meta: jsonb("meta").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("quote_events_quote_id_idx").on(table.quoteId),
    // Read-only to owners: events are written server-side, never by the client.
    pgPolicy("quote_events_select_own_quote", {
      for: "select",
      to: authenticatedRole,
      using: sql`${table.quoteId} in ${ownedQuoteIds}`,
    }),
  ],
).enableRLS();

export type QuoteAttachment = typeof quoteAttachments.$inferSelect;
export type QuoteEvent = typeof quoteEvents.$inferSelect;
