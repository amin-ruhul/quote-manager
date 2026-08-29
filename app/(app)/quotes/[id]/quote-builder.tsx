"use client";

import { Loader2, Trash2 } from "lucide-react";
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
import { QuoteTotals } from "@/app/(app)/quotes/[id]/quote-totals";
import { SharePanel } from "@/app/(app)/quotes/[id]/share-panel";
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
          <span className="tabular text-sm text-ink-40">
            {quote.quoteNumber}
          </span>
          <QuoteStatusPill status={quote.status as QuoteStatus} />
        </div>
        <h1 className="text-3xl font-semibold">{quote.title}</h1>
      </header>

      <QuoteDetailsForm
        quote={quote}
        customers={customers}
        onAddCustomer={() => setIsAddingCustomer(true)}
      />

      <QuoteOptionsPanel
        quoteId={quote.id}
        options={options}
        currency={currency}
      />

      <section className="space-y-2">
        <h2 className="font-semibold">Draft from a description</h2>
        <AiDraftPanel
          quoteId={quote.id}
          currency={currency}
          hasScope={Boolean(quote.scopeOfWork)}
        />
      </section>

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

      <QuotePhotos quoteId={quote.id} attachments={attachments} />

      <SharePanel quoteId={quote.id} isDraft={quote.status === "draft"} />

      <QuoteTotals
        subtotal={quote.subtotal}
        discount={quote.discount}
        tax={quote.tax}
        taxRate={quote.taxRate}
        total={quote.total}
        currency={currency}
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
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
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
    </div>
  );
}
