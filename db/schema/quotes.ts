import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgPolicy,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { authenticatedRole } from "drizzle-orm/supabase";

import {
  DEFAULT_QUOTE_ITEM_TYPE,
  DEFAULT_QUOTE_STATUS,
  type PricebookUnit,
  type QuoteItemType,
  type QuoteStatus,
} from "@/lib/constants";
import { businesses } from "./core";
import { customers } from "./customers";
import { ownedBusinessIds, ownedQuoteIds } from "./rls";

/*
 * The quote aggregate (SPEC §8). All money is integer cents. Quantities are
 * integers scaled by QUANTITY_SCALE — see lib/quote-math.ts, which owns every
 * calculation so the arithmetic lives in one tested place.
 */

export const quotes = pgTable(
  "quotes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    // A quote outlives the customer record being tidied up, so this is nullable
    // rather than cascading a delete through to sent quotes.
    customerId: uuid("customer_id").references(() => customers.id, {
      onDelete: "set null",
    }),
    quoteNumber: text("quote_number").notNull(),
    title: text("title").notNull(),
    scopeOfWork: text("scope_of_work"),
    // `$type` so a read comes back as the union rather than a bare string —
    // what lets `isQuoteLocked` be checked at compile time instead of trusted.
    status: text("status")
      .$type<QuoteStatus>()
      .notNull()
      .default(DEFAULT_QUOTE_STATUS),
    /** Integer cents, all four. Recomputed server-side on every save. */
    subtotal: integer("subtotal").notNull().default(0),
    discount: integer("discount").notNull().default(0),
    tax: integer("tax").notNull().default(0),
    total: integer("total").notNull().default(0),
    /** Snapshot of the business rate in basis points, so later edits don't rewrite history. */
    taxRate: integer("tax_rate").notNull().default(0),
    validUntil: timestamp("valid_until", { withTimezone: true }),
    /** Unguessable id for the public customer page (Phase 3). */
    publicToken: text("public_token").notNull(),
    terms: text("terms"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("quotes_business_id_idx").on(table.businessId),
    index("quotes_customer_id_idx").on(table.customerId),
    uniqueIndex("quotes_public_token_idx").on(table.publicToken),
    uniqueIndex("quotes_business_number_idx").on(
      table.businessId,
      table.quoteNumber,
    ),
    pgPolicy("quotes_all_own_business", {
      for: "all",
      to: authenticatedRole,
      using: sql`${table.businessId} in ${ownedBusinessIds}`,
      withCheck: sql`${table.businessId} in ${ownedBusinessIds}`,
    }),
  ],
).enableRLS();

/** Good/Better/Best. Optional — a quote can have none, or several (SPEC §10). */
export const quoteOptions = pgTable(
  "quote_options",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    quoteId: uuid("quote_id")
      .notNull()
      .references(() => quotes.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    /** Integer cents, derived from this option's items. */
    total: integer("total").notNull().default(0),
    isRecommended: boolean("is_recommended").notNull().default(false),
    position: integer("position").notNull().default(0),
  },
  (table) => [
    index("quote_options_quote_id_idx").on(table.quoteId),
    pgPolicy("quote_options_all_own_quote", {
      for: "all",
      to: authenticatedRole,
      using: sql`${table.quoteId} in ${ownedQuoteIds}`,
      withCheck: sql`${table.quoteId} in ${ownedQuoteIds}`,
    }),
  ],
).enableRLS();

export const quoteItems = pgTable(
  "quote_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    quoteId: uuid("quote_id")
      .notNull()
      .references(() => quotes.id, { onDelete: "cascade" }),
    /** Null means the item belongs to the quote's single price, not an option. */
    optionId: uuid("option_id").references(() => quoteOptions.id, {
      onDelete: "cascade",
    }),
    name: text("name").notNull(),
    description: text("description"),
    /** Integer, scaled by QUANTITY_SCALE: 2.5 is stored as 250. */
    quantity: integer("quantity").notNull().default(100),
    unit: text("unit").$type<PricebookUnit>().notNull(),
    /** Integer cents. */
    unitPrice: integer("unit_price").notNull(),
    /** Integer cents, derived: quantity x unitPrice, negative for discounts. */
    total: integer("total").notNull().default(0),
    type: text("type")
      .$type<QuoteItemType>()
      .notNull()
      .default(DEFAULT_QUOTE_ITEM_TYPE),
    /*
     * Whether the quote's tax rate applies to this line. A US quote routinely
     * mixes both — Texas separated contracts tax materials but not labour — so
     * one rate for the whole quote cannot express it.
     *
     * Defaults true so existing rows keep behaving as they did under the old
     * whole-quote rate; the line form seeds it from the pricebook item.
     */
    taxable: boolean("taxable").notNull().default(true),
    position: integer("position").notNull().default(0),
  },
  (table) => [
    index("quote_items_quote_id_idx").on(table.quoteId),
    index("quote_items_option_id_idx").on(table.optionId),
    pgPolicy("quote_items_all_own_quote", {
      for: "all",
      to: authenticatedRole,
      using: sql`${table.quoteId} in ${ownedQuoteIds}`,
      withCheck: sql`${table.quoteId} in ${ownedQuoteIds}`,
    }),
  ],
).enableRLS();

export type Quote = typeof quotes.$inferSelect;
export type NewQuote = typeof quotes.$inferInsert;
export type QuoteOption = typeof quoteOptions.$inferSelect;
export type QuoteItem = typeof quoteItems.$inferSelect;
export type NewQuoteItem = typeof quoteItems.$inferInsert;
