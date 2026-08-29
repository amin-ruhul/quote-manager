import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { QuoteBuilder } from "@/app/(app)/quotes/[id]/quote-builder";
import { customers, pricebookItems } from "@/db/schema";
import { requireBusiness } from "@/lib/auth";
import type { Currency } from "@/lib/constants";
import { db } from "@/lib/db";
import { getQuoteForBusiness } from "@/lib/quotes";

export const metadata = { title: "Edit quote · QuotePilot" };

export default async function QuoteBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { business } = await requireBusiness();

  // Scoped by business_id; returns null for another owner's quote, so a guessed
  // id is a 404 rather than a leak.
  const quote = await getQuoteForBusiness(id, business.id);
  if (!quote) notFound();

  const [customerRows, pricebookRows] = await Promise.all([
    db
      .select()
      .from(customers)
      .where(eq(customers.businessId, business.id))
      .orderBy(asc(customers.firstName)),
    db
      .select()
      .from(pricebookItems)
      .where(eq(pricebookItems.businessId, business.id))
      .orderBy(asc(pricebookItems.category), asc(pricebookItems.name)),
  ]);

  return (
    <QuoteBuilder
      quote={quote.quote}
      items={quote.items}
      options={quote.options}
      attachments={quote.attachments}
      customers={customerRows}
      pricebook={pricebookRows}
      currency={business.currency as Currency}
    />
  );
}
