"use client";

import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { CustomerForm } from "@/app/(app)/customers/customer-form";
import { deleteQuote } from "@/app/(app)/quotes/actions";
import { AiDraftPanel } from "@/app/(app)/quotes/[id]/ai-draft-panel";
import { QuoteDetailsForm } from "@/app/(app)/quotes/[id]/quote-details-form";
import { QuoteLines } from "@/app/(app)/quotes/[id]/quote-lines";
import { QuoteOptionsPanel } from "@/app/(app)/quotes/[id]/quote-options-panel";
import { QuotePhotos } from "@/app/(app)/quotes/[id]/quote-photos";
import { QuoteTotalBar } from "@/app/(app)/quotes/[id]/quote-total-bar";
import { QuoteTotals } from "@/app/(app)/quotes/[id]/quote-totals";
import { SharePanel } from "@/app/(app)/quotes/[id]/share-panel";
import { CollapsibleSection } from "@/components/collapsible-section";
import { QuoteStatusPill } from "@/components/quote-status-pill";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type {
  Customer,
  PricebookItem,
  Quote,
  QuoteAttachment,
  QuoteItem,
  QuoteOption,
} from "@/db/schema";
import type { Currency, QuoteStatus } from "@/lib/constants";
import { customerName } from "@/lib/customers";

export function QuoteBuilder({
  quote,
  items,
  options,
  attachments,
  customers,
  pricebook,
  currency,
}: {
  quote: Quote;
  items: QuoteItem[];
  options: QuoteOption[];
  attachments: QuoteAttachment[];
  customers: Customer[];
  pricebook: PricebookItem[];
  currency: Currency;
}) {
  const router = useRouter();
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [isDeleting, startDeleting] = useTransition();

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
          <QuoteStatusPill status={quote.status as QuoteStatus} />
        </div>
        <h1 className="text-3xl font-semibold">{quote.title}</h1>
      </header>

      {/*
       * Order follows the job, not the data model: describe it, price it, see
       * the number, send it. The details form used to come first and the totals
       * came last — below the send button — so the owner met a page of optional
       * metadata before any line item and could send a quote without ever
       * seeing its price.
       *
       * Secondary sections collapse, and their headers carry the answer, so a
       * quote reads as five decisions rather than fifteen fields.
       */}
      <CollapsibleSection
        title="Details"
        summary={
          selectedCustomer ? customerName(selectedCustomer) : "No customer yet"
        }
        defaultOpen={!quote.customerId}
      >
        <QuoteDetailsForm
          quote={quote}
          customers={customers}
          onAddCustomer={() => setIsAddingCustomer(true)}
        />
      </CollapsibleSection>

      {/* The product's whole point, so it comes before the manual list. */}
      <CollapsibleSection
        title="Describe the job"
        summary={items.length > 0 ? "Drafted" : "Let AI draft the lines"}
        defaultOpen={items.length === 0}
      >
        <AiDraftPanel
          quoteId={quote.id}
          currency={currency}
          hasScope={Boolean(quote.scopeOfWork)}
        />
      </CollapsibleSection>

      <div className="space-y-6">
        <h2 className="font-semibold">Line items</h2>

        <QuoteLines
          quoteId={quote.id}
          heading={options.length > 0 ? "Included in every option" : "Lines"}
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

      {/* The number, then the send. Never the other way round. */}
      <QuoteTotals
        subtotal={quote.subtotal}
        discount={quote.discount}
        tax={quote.tax}
        taxRate={quote.taxRate}
        taxExempt={selectedCustomer?.taxExempt ?? false}
        total={quote.total}
        currency={currency}
      />

      <SharePanel
        quoteId={quote.id}
        isDraft={quote.status === "draft"}
        customerEmail={selectedCustomer?.email ?? null}
      />

      <div className="flex flex-col gap-2 border-t border-hairline pt-6 sm:flex-row-reverse sm:justify-start">
        <Button asChild variant="ghost" size="lg" className="w-full sm:w-auto">
          <Link href="/quotes">Back to quotes</Link>
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="lg"
              className="w-full text-destructive sm:w-auto"
              loading={isDeleting}
            >
              {isDeleting ? null : <Trash2 />}
              Delete quote
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogTitle>Delete this quote?</AlertDialogTitle>
            <AlertDialogDescription>
              {quote.quoteNumber} and everything on it — lines, options and
              photos — will be removed. This can&apos;t be undone.
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogAction asChild>
                <Button
                  variant="destructive"
                  size="lg"
                  className="w-full sm:w-auto"
                  onClick={() =>
                    startDeleting(async () => {
                      const { error } = await deleteQuote(quote.id);
                      if (error) toast.error(error);
                      else router.push("/quotes");
                    })
                  }
                >
                  Delete quote
                </Button>
              </AlertDialogAction>
              <AlertDialogCancel asChild>
                <Button variant="ghost" size="lg" className="w-full sm:w-auto">
                  Keep it
                </Button>
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/*
       * Last in the flow so that, being sticky, it stays pinned to the bottom
       * of the viewport for the whole scroll rather than only appearing once
       * you reach it.
       */}
      <QuoteTotalBar
        total={quote.total}
        currency={currency}
        itemCount={items.length}
      />
    </div>
  );
}
