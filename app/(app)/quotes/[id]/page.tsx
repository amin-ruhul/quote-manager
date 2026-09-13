import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { AiDraftPanel } from "@/app/(app)/quotes/[id]/ai-draft-panel";
import { QuoteBuilder } from "@/app/(app)/quotes/[id]/quote-builder";
import { QuoteDraftProvider } from "@/app/(app)/quotes/[id]/quote-draft-context";
import { QuoteWorkspace } from "@/app/(app)/quotes/[id]/quote-workspace";
import { QuotePreview } from "@/components/quote/quote-preview";
import { PremiumLock } from "@/components/upgrade/premium-lock";
import { customers, pricebookItems } from "@/db/schema";
import { requireBusiness } from "@/lib/auth";
import { type Currency, isPaidPlan, isQuoteLocked } from "@/lib/constants";
import { db } from "@/lib/db";
import { getPlanStatus } from "@/lib/plan";
import { getQuoteByPublicToken } from "@/lib/public-quote";
import { getQuoteForBusiness } from "@/lib/quotes";

export const metadata = { title: "Edit quote · QuotePace" };

export default async function QuoteBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user, business } = await requireBusiness();

  // AI drafting and email cost money on every use, so they're granted by hand
  // while the market test runs. Both are also refused server-side.
  const planStatus = await getPlanStatus(user.id);
  const premium = isPaidPlan(planStatus.plan);

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
    // The provider wraps both columns: the form writes unsaved edits into it
    // and the preview reads them, which is what makes the preview live.
    <QuoteDraftProvider>
      <QuoteWorkspace
        locked={isQuoteLocked(quote.quote.status)}
        editor={
          <QuoteBuilder
            quote={quote.quote}
            items={quote.items}
            options={quote.options}
            attachments={quote.attachments}
            customers={customerRows}
            pricebook={pricebookRows}
            currency={business.currency as Currency}
            canEmail={premium}
            hasRequestedAccess={planStatus.hasPendingRequest}
          />
        }
        aiPanel={
          premium ? (
            <AiDraftPanel
              quoteId={quote.quote.id}
              currency={business.currency as Currency}
              hasScope={Boolean(quote.quote.scopeOfWork)}
            />
          ) : (
            <PremiumLock
              title="Create with AI"
              description="Describe the job in a sentence and get priced line items from your own pricebook, ready to review."
              source="ai"
              requested={planStatus.hasPendingRequest}
            />
          )
        }
        preview={
          publicQuote ? (
            <QuotePreview
              quote={publicQuote}
              printUrl={printUrl}
              canDownloadPdf={premium}
            />
          ) : null
        }
        quoteId={quote.quote.id}
        quoteNumber={quote.quote.quoteNumber}
        publicToken={quote.quote.publicToken}
        premium={premium}
      />
    </QuoteDraftProvider>
  );
}
