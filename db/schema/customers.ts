import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  pgPolicy,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { authenticatedRole } from "drizzle-orm/supabase";

import { businesses } from "./core";
import { ownedBusinessIds } from "./rls";

/** Lightweight contact record — deliberately not a CRM (SPEC §5). */
export const customers = pgTable(
  "customers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    firstName: text("first_name").notNull(),
    lastName: text("last_name"),
    company: text("company"),
    phone: text("phone"),
    email: text("email"),
    address: text("address"),
    notes: text("notes"),
    /*
     * Exemption belongs to the buyer, not the document — a tax-exempt customer
     * is exempt on every quote — so it lives here and is surfaced as a badge on
     * the quote rather than as another switch the owner has to remember.
     */
    taxExempt: boolean("tax_exempt").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("customers_business_id_idx").on(table.businessId),
    pgPolicy("customers_all_own_business", {
      for: "all",
      to: authenticatedRole,
      using: sql`${table.businessId} in ${ownedBusinessIds}`,
      withCheck: sql`${table.businessId} in ${ownedBusinessIds}`,
    }),
  ],
).enableRLS();

export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
