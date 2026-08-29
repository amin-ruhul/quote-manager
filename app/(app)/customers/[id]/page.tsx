import { and, desc, eq, sql } from "drizzle-orm";
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

  // Scoped by business_id; another owner's customer is a 404, not a leak.
  const [customer] = await db
    .select()
    .from(customers)
    .where(and(eq(customers.id, id), eq(customers.businessId, business.id)))
    .limit(1);

  if (!customer) notFound();

  const [quoteRows, [totals]] = await Promise.all([
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
      .where(
        and(
          eq(quotes.customerId, customer.id),
          eq(quotes.businessId, business.id),
        ),
      )
      .orderBy(desc(quotes.updatedAt)),
    db
      .select({
        quoted: sql<number>`coalesce(sum(${quotes.total}), 0)::int`,
        won: sql<number>`coalesce(sum(${quotes.total}) filter (where ${quotes.status} = 'accepted'), 0)::int`,
      })
      .from(quotes)
      .where(
        and(
          eq(quotes.customerId, customer.id),
          eq(quotes.businessId, business.id),
        ),
      ),
  ]);

  return (
    <CustomerDetail
      customer={customer}
      quotes={quoteRows}
      quotedCents={totals?.quoted ?? 0}
      wonCents={totals?.won ?? 0}
      currency={business.currency as Currency}
    />
  );
}
