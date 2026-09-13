"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { CustomerForm } from "@/app/(app)/customers/customer-form";
import { duplicateQuote } from "@/app/(app)/quotes/actions";
import { AiQuoteCheck } from "@/app/(app)/quotes/[id]/ai-upsell";
import { QuoteDetailsForm } from "@/app/(app)/quotes/[id]/quote-details-form";
import { QuoteLines } from "@/app/(app)/quotes/[id]/quote-lines";
import { QuoteOptionsPanel } from "@/app/(app)/quotes/[id]/quote-options-panel";
import { QuotePhotos } from "@/app/(app)/quotes/[id]/quote-photos";
import { SharePanel } from "@/app/(app)/quotes/[id]/share-panel";
import { CollapsibleSection, Section } from "@/components/collapsible-section";
import { QuoteStatusPill } from "@/components/quote-status-pill";
import { Button } from "@/components/ui/button";
import type {
  Customer,
  PricebookItem,
  Quote,
  QuoteAttachment,
  QuoteItem,
  QuoteOption,
} from "@/db/schema";
import type { Currency } from "@/lib/constants";
import { isQuoteLocked } from "@/lib/constants";
import { customerName } from "@/lib/customers";

export function QuoteBuilder({
  quote,
  items,
  options,
  attachments,
  customers,
  pricebook,
  currency,
  canEmail,
  hasRequestedAccess,
}: {
  quote: Quote;
  items: QuoteItem[];
  options: QuoteOption[];
  attachments: QuoteAttachment[];
  customers: Customer[];
  pricebook: PricebookItem[];
  currency: Currency;
  /** Sending costs money per email, so it's granted by hand during the beta. */
  canEmail: boolean;
  hasRequestedAccess: boolean;
}) {
  const router = useRouter();
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);

  /*
   * Accepted quotes are read-only (lib/constants.ts). The server refuses the
   * edits either way — this only stops us offering controls that would be
   * rejected, which is the difference between "you can't" and a form that
   * silently fails.
   */
  const locked = isQuoteLocked(quote.status);

  const sharedItems = items.filter((item) => item.optionId === null);
  const selectedCustomer =
    customers.find((c) => c.id === quote.customerId) ?? null;

  if (isAddingCustomer) {
    return (
      <CustomerForm
        customer={null}
        onClose={() => setIsAddingCustomer(false)}
        onSaved={() => router.refresh()}
      />
    );
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="tabular text-sm text-ink-60">
            {quote.quoteNumber}
          </span>
          <QuoteStatusPill status={quote.status} />
        </div>
        <h1 className="text-3xl font-semibold">{quote.title}</h1>
      </header>

      {locked ? <AcceptedNotice quoteId={quote.id} /> : null}

      {/*
       * Order follows the job, not the data model: describe it, price it, see
       * the number, send it. The details form used to come first and the totals
       * came last — below the send button — so the owner met a page of optional
       * metadata before any line item and could send a quote without ever
       * seeing its price.
       *
       * Secondary sections collapse, and their headers carry the answer, so a
       * quote reads as five decisions rather than fifteen fields.
       *
       * All of it disappears once the customer has accepted: what they agreed
       * to is fixed, and the preview column still shows the document itself.
       */}
      {locked ? null : (
        <>
          <Section
            title="Details"
            summary={
              selectedCustomer
                ? customerName(selectedCustomer)
                : "No customer yet"
            }
          >
            <QuoteDetailsForm
              quote={quote}
              customers={customers}
              onAddCustomer={() => setIsAddingCustomer(true)}
            />
          </Section>

          <Section title="Line items">
            <div className="space-y-6">
              <QuoteLines
                quoteId={quote.id}
                // With no options there is only one group, and the section
                // heading above already names it.
                heading={options.length > 0 ? "Included in every option" : null}
                items={sharedItems}
                options={options}
                pricebook={pricebook}
                currency={currency}
                optionId={null}
              />

              {options.map((option) => (
                <QuoteLines
                  key={option.id}
                  quoteId={quote.id}
                  heading={`Only in ${option.name}`}
                  items={items.filter((item) => item.optionId === option.id)}
                  options={options}
                  pricebook={pricebook}
                  currency={currency}
                  optionId={option.id}
                />
              ))}
            </div>
          </Section>

          <CollapsibleSection
            title="Options"
            summary={
              options.length > 0
                ? `${options.length} to choose from`
                : "One price — no Good/Better/Best"
            }
            defaultOpen={options.length > 0}
          >
            <QuoteOptionsPanel
              quoteId={quote.id}
              options={options}
              lineCounts={Object.fromEntries(
                options.map((option) => [
                  option.id,
                  items.filter((item) => item.optionId === option.id).length,
                ]),
              )}
              currency={currency}
            />
          </CollapsibleSection>

          <CollapsibleSection
            title="Photos"
            summary={
              attachments.length > 0
                ? `${attachments.length} attached`
                : "None attached"
            }
            defaultOpen={attachments.length > 0}
          >
            <QuotePhotos quoteId={quote.id} attachments={attachments} />
          </CollapsibleSection>

          <AiQuoteCheck />
        </>
      )}

      <SharePanel
        quoteId={quote.id}
        isDraft={quote.status === "draft"}
        customerEmail={selectedCustomer?.email ?? null}
        canEmail={canEmail}
        hasRequestedAccess={hasRequestedAccess}
      />

      {/* Delete lives in the floating bar now — it acts on the whole quote,
          and it should not require scrolling to the bottom to find. */}
      <div className="border-t border-hairline pt-6">
        <Button asChild variant="ghost" size="lg" className="w-full sm:w-auto">
          <Link href="/quotes">Back to quotes</Link>
        </Button>
      </div>
    </div>
  );
}

/**
 * What replaces the editor once the customer has said yes.
 *
 * Not a warning — nothing went wrong. It states why the quote is fixed and
 * offers the way forward, because "you can't edit this" without "here is what
 * to do instead" just reads as the app being broken.
 */
function AcceptedNotice({ quoteId }: { quoteId: string }) {
  const router = useRouter();
  const [isCopying, startCopying] = useTransition();

  function duplicate() {
    startCopying(async () => {
      const result = await duplicateQuote(quoteId);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(`Copied to ${result.quoteNumber}.`);
      router.push(`/quotes/${result.quoteId}`);
    });
  }

  return (
    <div className="rounded-card border border-hairline bg-surface p-6">
      <p className="font-medium text-ink-90">
        Your customer accepted this one.
      </p>
      <p className="mt-2 max-w-prose text-pretty text-body">
        It is now the record of what they agreed to, so the lines, the prices
        and the terms are fixed. Need to change something? Copy it to a new
        quote and send that — this one stays as proof of the original deal.
      </p>
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="mt-5 w-full sm:w-auto"
        onClick={duplicate}
        disabled={isCopying}
      >
        {isCopying ? "Copying…" : "Copy to a new quote"}
      </Button>
    </div>
  );
}
