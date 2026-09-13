import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgPolicy,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { authenticatedRole, authUid, authUsers } from "drizzle-orm/supabase";

import {
  DEFAULT_CURRENCY,
  DEFAULT_INDUSTRY,
  DEFAULT_PLAN,
  DEFAULT_PRICEBOOK_UNIT,
  type Currency,
  type PricebookUnit,
} from "@/lib/constants";

/*
 * Data model per SPEC §8. Phase 1 covers profiles, businesses, pricebook_items
 * and industry_config; quotes and their children arrive in Phase 2.
 *
 * Conventions (see the database skill):
 * - uuid primary keys, timestamptz timestamps.
 * - Money is `integer` cents. Tax rates are integer basis points. Never numeric.
 * - Every business-owned table carries business_id, is indexed on it, and is
 *   protected by an RLS policy that resolves ownership through `businesses`.
 * - The engine stays generic: trade specifics live in industry_config and
 *   pricebook_items.metadata, never as columns here.
 */

/** 1:1 with a Supabase auth user. */
export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id")
      .primaryKey()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    /** Typed at registration. Nullable: accounts created before it existed. */
    fullName: text("full_name"),
    plan: text("plan").notNull().default(DEFAULT_PLAN),
    paddleCustomerId: text("paddle_customer_id"),
    quotesUsedThisMonth: integer("quotes_used_this_month").notNull().default(0),
    /*
     * First moment of the month the counter above is counting. Without it a
     * stale count from March silently locks someone out in April — the counter
     * alone cannot say which month it belongs to. Null means never counted.
     */
    quotaPeriodStart: timestamp("quota_period_start", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  () => [
    pgPolicy("profiles_select_own", {
      for: "select",
      to: authenticatedRole,
      using: sql`${authUid} = id`,
    }),
    // Plan and quota are set server-side by billing, never by the owner.
    pgPolicy("profiles_update_own", {
      for: "update",
      to: authenticatedRole,
      using: sql`${authUid} = id`,
      withCheck: sql`${authUid} = id`,
    }),
    pgPolicy("profiles_insert_own", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`${authUid} = id`,
    }),
  ],
).enableRLS();

export const businesses = pgTable(
  "businesses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    logoUrl: text("logo_url"),
    phone: text("phone"),
    email: text("email"),
    website: text("website"),
    address: text("address"),
    licenseNumber: text("license_number"),
    industry: text("industry").notNull().default(DEFAULT_INDUSTRY),
    currency: text("currency")
      .$type<Currency>()
      .notNull()
      .default(DEFAULT_CURRENCY),
    /** Integer basis points: 8.25% is 825. */
    defaultTaxRate: integer("default_tax_rate").notNull().default(0),
    settings: jsonb("settings").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("businesses_owner_id_idx").on(table.ownerId),
    pgPolicy("businesses_all_own", {
      for: "all",
      to: authenticatedRole,
      using: sql`${authUid} = ${table.ownerId}`,
      withCheck: sql`${authUid} = ${table.ownerId}`,
    }),
  ],
).enableRLS();

export const pricebookItems = pgTable(
  "pricebook_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    category: text("category"),
    // Stored as text so adding a unit needs no migration; narrowed here so the
    // union in lib/constants stays the one source of truth (no SQL change).
    unit: text("unit")
      .$type<PricebookUnit>()
      .notNull()
      .default(DEFAULT_PRICEBOOK_UNIT),
    /** Integer cents. */
    price: integer("price").notNull(),
    /** Integer cents. Optional — what the item costs the business. */
    cost: integer("cost"),
    /*
     * Seeds quote_items.taxable when this item is added to a quote, so the
     * owner sets "labour isn't taxed here" once in the pricebook rather than on
     * every line of every quote.
     */
    taxable: boolean("taxable").notNull().default(true),
    /** Industry-specific extras; keeps the core engine generic. */
    metadata: jsonb("metadata").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("pricebook_items_business_id_idx").on(table.businessId),
    /*
     * Ownership resolves through businesses rather than trusting a client-sent
     * business_id. The subquery is wrapped in `select` so Postgres caches it
     * per statement instead of re-running it per row.
     */
    pgPolicy("pricebook_items_all_own_business", {
      for: "all",
      to: authenticatedRole,
      using: sql`${table.businessId} in (select id from businesses where owner_id = ${authUid})`,
      withCheck: sql`${table.businessId} in (select id from businesses where owner_id = ${authUid})`,
    }),
  ],
).enableRLS();

/** Seed data, one row per trade — not per user. Readable by any signed-in user. */
export const industryConfig = pgTable(
  "industry_config",
  {
    industry: text("industry").primaryKey(),
    categories: jsonb("categories").notNull().default([]),
    defaultPricebook: jsonb("default_pricebook").notNull().default([]),
    aiInstructions: text("ai_instructions").notNull().default(""),
    defaultTerms: text("default_terms").notNull().default(""),
    quoteWording: jsonb("quote_wording").notNull().default({}),
  },
  () => [
    // Read-only to app users; rows are managed by the seed script.
    pgPolicy("industry_config_select_all", {
      for: "select",
      to: authenticatedRole,
      using: sql`true`,
    }),
  ],
).enableRLS();

export type Profile = typeof profiles.$inferSelect;
export type Business = typeof businesses.$inferSelect;
export type NewBusiness = typeof businesses.$inferInsert;
export type PricebookItem = typeof pricebookItems.$inferSelect;
export type NewPricebookItem = typeof pricebookItems.$inferInsert;
export type IndustryConfig = typeof industryConfig.$inferSelect;
