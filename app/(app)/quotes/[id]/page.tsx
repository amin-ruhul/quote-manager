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

  /*
   * The quote and the two pickers only need business.id, so they all go out at
   * once. This page used to make four sequential round trips; now it makes two,
   * which matters on a phone against a distant database.
   */
  const [quote, customerRows, pricebookRows] = await Promise.all([
    // Scoped by business_id; null for another owner's quote, so a guessed id is
    // a 404 rather than a leak.
    getQuoteForBusiness(id, business.id),
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

  if (!quote) notFound();

  return (
    // A quote builder is a form: it keeps the reading column even though
    // the shell now allows 1200px.
    <div className="mx-auto max-w-3xl">
      <QuoteBuilder
        quote={quote.quote}
        items={quote.items}
        options={quote.options}
        attachments={quote.attachments}
        customers={customerRows}
        pricebook={pricebookRows}
        currency={business.currency as Currency}
      />
    </div>
  );
}
