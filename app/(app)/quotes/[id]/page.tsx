import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { QuoteBuilder } from "@/app/(app)/quotes/[id]/quote-builder";
import { QuoteWorkspace } from "@/app/(app)/quotes/[id]/quote-workspace";
import { QuoteDocument } from "@/components/quote/quote-document";
import { QuotePreview } from "@/components/quote/quote-preview";
import { customers, pricebookItems } from "@/db/schema";
import { requireBusiness } from "@/lib/auth";
import type { Currency } from "@/lib/constants";
import { db } from "@/lib/db";
import { getQuoteByPublicToken } from "@/lib/public-quote";
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

  /*
   * The preview is read through the customer's own loader rather than rebuilt
   * from the rows above. It costs one query the owner's page can afford, and it
   * buys the guarantee the preview exists for: identical data, identical shape,
   * identical component — so it cannot quietly disagree with what is sent.
   *
   * This is a read. It does not record a view; only /q/[token] does that.
   */
  const publicQuote = await getQuoteByPublicToken(quote.quote.publicToken);
  const printUrl = `/q/${quote.quote.publicToken}/print`;

  return (
    <QuoteWorkspace
      editor={
        <QuoteBuilder
          quote={quote.quote}
          items={quote.items}
          options={quote.options}
          attachments={quote.attachments}
          customers={customerRows}
          pricebook={pricebookRows}
          currency={business.currency as Currency}
        />
      }
      preview={
        publicQuote ? (
          <QuotePreview printUrl={printUrl}>
            <QuoteDocument quote={publicQuote} />
          </QuotePreview>
        ) : null
      }
    />
  );
}
