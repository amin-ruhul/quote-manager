import { and, desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { CustomerDetail } from "@/app/(app)/customers/[id]/customer-detail";
import { customers, quotes } from "@/db/schema";
import { requireBusiness } from "@/lib/auth";
import type { Currency } from "@/lib/constants";
import { customerName } from "@/lib/customers";
import { db } from "@/lib/db";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { business } = await requireBusiness();

  const [customer] = await db
    .select({ firstName: customers.firstName, lastName: customers.lastName })
    .from(customers)
    .where(and(eq(customers.id, id), eq(customers.businessId, business.id)))
    .limit(1);

  return {
    title: customer
      ? `${customerName(customer)} · QuotePilot`
      : "Customer · QuotePilot",
  };
}

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { business } = await requireBusiness();

  // Both queries only need business.id, so they go out together.
  const [customerRows, quoteRows] = await Promise.all([
    // Scoped by business_id; another owner's customer is a 404, not a leak.
    db
      .select()
      .from(customers)
      .where(and(eq(customers.id, id), eq(customers.businessId, business.id)))
      .limit(1),
    db
      .select({
        id: quotes.id,
        quoteNumber: quotes.quoteNumber,
        title: quotes.title,
        status: quotes.status,
        total: quotes.total,
        updatedAt: quotes.updatedAt,
      })
      .from(quotes)
      .where(and(eq(quotes.customerId, id), eq(quotes.businessId, business.id)))
      .orderBy(desc(quotes.updatedAt)),
  ]);

  const customer = customerRows[0];
  if (!customer) notFound();

  // Summed here rather than in a third query — the rows are already loaded,
  // and these are integer cents so the addition is exact.
  const quotedCents = quoteRows.reduce((running, q) => running + q.total, 0);
  const wonCents = quoteRows
    .filter((q) => q.status === "accepted")
    .reduce((running, q) => running + q.total, 0);

  return (
    <CustomerDetail
      customer={customer}
      quotes={quoteRows}
      quotedCents={quotedCents}
      wonCents={wonCents}
      currency={business.currency as Currency}
    />
  );
}
