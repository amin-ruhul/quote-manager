import { asc, eq, sql } from "drizzle-orm";

import { CustomerList } from "@/app/(app)/customers/customer-list";
import { customers, quotes } from "@/db/schema";
import { requireBusiness } from "@/lib/auth";
import type { Currency } from "@/lib/constants";
import { db } from "@/lib/db";

export const metadata = { title: "Customers · QuotePilot" };

export default async function CustomersPage() {
  const { business } = await requireBusiness();

  /*
   * Scoped by business_id from the session — never from the request.
   *
   * The counts are aggregated in SQL against a left join rather than fetched
   * per row: a contact list is exactly the place an N+1 would hide, and a
   * customer with no quotes still has to appear, which is what makes it a left
   * join and the totals coalesce to zero.
   */
  const rows = await db
    .select({
      id: customers.id,
      businessId: customers.businessId,
      firstName: customers.firstName,
      lastName: customers.lastName,
      company: customers.company,
      phone: customers.phone,
      email: customers.email,
      address: customers.address,
      notes: customers.notes,
      taxExempt: customers.taxExempt,
      createdAt: customers.createdAt,
      updatedAt: customers.updatedAt,
      // Drafts aren't work you did for them, so they don't count.
      quoteCount: sql<number>`count(${quotes.id}) filter (where ${quotes.status} <> 'draft')::int`,
      wonCents: sql<number>`coalesce(sum(${quotes.total}) filter (where ${quotes.status} = 'accepted'), 0)::int`,
    })
    .from(customers)
    .leftJoin(quotes, eq(quotes.customerId, customers.id))
    .where(eq(customers.businessId, business.id))
    .groupBy(customers.id)
    .orderBy(asc(customers.firstName), asc(customers.lastName));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold sm:text-3xl">Customers</h1>
        <p className="mt-1 text-body">
          <span className="tabular">{rows.length}</span>{" "}
          {rows.length === 1 ? "customer" : "customers"}
        </p>
      </header>

      <CustomerList customers={rows} currency={business.currency as Currency} />
    </div>
  );
}
