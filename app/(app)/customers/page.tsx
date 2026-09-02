import { asc, eq } from "drizzle-orm";

import { CustomerList } from "@/app/(app)/customers/customer-list";
import { customers } from "@/db/schema";
import { requireBusiness } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata = { title: "Customers · QuotePilot" };

export default async function CustomersPage() {
  const { business } = await requireBusiness();

  // Scoped by business_id from the session — never from the request.
  const rows = await db
    .select()
    .from(customers)
    .where(eq(customers.businessId, business.id))
    .orderBy(asc(customers.firstName), asc(customers.lastName));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">Customers</h1>
        <p className="mt-2 text-body">
          <span className="tabular">{rows.length}</span>{" "}
          {rows.length === 1 ? "customer" : "customers"}
        </p>
      </header>

      <CustomerList customers={rows} />
    </div>
  );
}
