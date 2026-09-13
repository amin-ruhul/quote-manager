"use client";

import { useEffect } from "react";

import { toast } from "sonner";

import {
  type QuoteFormState,
  saveQuoteDetails,
} from "@/app/(app)/quotes/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Customer, Quote } from "@/db/schema";
import { customerName } from "@/lib/customers";
import {
  basisPointsToPercent,
  centsToInputValue,
  parseDollarsToCents,
  parsePercentToBasisPoints,
} from "@/lib/money";
import { useQuoteDraft } from "@/app/(app)/quotes/[id]/quote-draft-context";
import {
  type QuoteDetailsFields,
  quoteDetailsSchema,
} from "@/lib/schemas/quote";
import { useActionForm } from "@/lib/use-action-form";

const initialState: QuoteFormState = {
  error: null,
  fieldErrors: {},
  savedAt: null,
};

/** yyyy-mm-dd for <input type="date">. */
function toDateInput(value: Date | null): string {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

function defaultsFor(quote: Quote): QuoteDetailsFields {
  return {
    title: quote.title,
    // "none" is the sentinel the Select needs; Radix cannot hold "".
    customerId: quote.customerId ?? "none",
    scopeOfWork: quote.scopeOfWork ?? "",
    /*
     * Snapshotted onto the quote at creation from the business default, so
     * changing settings never rewrites quotes already drafted. Editable here
     * because without an override a quote created before the owner set a rate
     * stayed at 0% for ever, with nowhere to fix it.
     */
    taxRate: quote.taxRate > 0 ? basisPointsToPercent(quote.taxRate) : "",
    discount: quote.discount > 0 ? centsToInputValue(quote.discount) : "",
    validUntil: toDateInput(quote.validUntil),
    terms: quote.terms ?? "",
  };
}

/** Shared with the floating action bar, which submits this form by id. */
export const QUOTE_DETAILS_FORM_ID = "quote-details-form";

export function QuoteDetailsForm({
  quote,
  customers,
  onAddCustomer,
}: {
  quote: Quote;
  customers: Customer[];
  onAddCustomer: () => void;
}) {
  const { setDraft } = useQuoteDraft();

  const { form, onSubmit, state } = useActionForm({
    schema: quoteDetailsSchema,
    defaultValues: defaultsFor(quote),
    initialState,
    action: async (prevState, formData) => {
      const result = await saveQuoteDetails(prevState, formData);
      if (result.savedAt) toast.success("Draft saved.");
      return result;
    },
  });

  /*
   * Push every keystroke at the preview. The parse helpers are the same pure
   * ones the server uses, so an unsaved discount is shown exactly as it will be
   * stored — and an unparseable one falls back rather than blanking the total.
   */
  const watched = form.watch();
  useEffect(() => {
    setDraft({
      title: watched.title,
      scopeOfWork: watched.scopeOfWork || null,
      terms: watched.terms || null,
      discount: parseDollarsToCents(watched.discount ?? "") ?? 0,
      taxRate: parsePercentToBasisPoints(watched.taxRate ?? "") ?? 0,
      customerName:
        watched.customerId && watched.customerId !== "none"
          ? customers.find((c) => c.id === watched.customerId)
            ? customerName(customers.find((c) => c.id === watched.customerId)!)
            : null
          : null,
      taxExempt:
        customers.find((c) => c.id === watched.customerId)?.taxExempt ?? false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(watched), customers, setDraft]);

  return (
    <Form {...form}>
      <form
        id={QUOTE_DETAILS_FORM_ID}
        onSubmit={onSubmit}
        className="space-y-4"
        noValidate
      >
        <input type="hidden" name="quoteId" value={quote.id} />

        {state.error ? (
          <Alert variant="destructive">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        ) : null}

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Panel replacement" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="customerId"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Customer</FormLabel>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={onAddCustomer}
                >
                  New customer
                </Button>
              </div>
              <Select
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">No customer yet</SelectItem>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customerName(customer)}
                      {customer.company ? ` · ${customer.company}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="scopeOfWork"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Scope of work</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={4}
                  placeholder="What you'll do, in plain English."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="discount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    inputMode="decimal"
                    className="tabular"
                    placeholder="0.00"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="taxRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tax rate</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    inputMode="decimal"
                    className="tabular"
                    placeholder="0"
                  />
                </FormControl>
                <FormMessage>
                  % on taxable lines. Leave blank for none.
                </FormMessage>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="validUntil"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valid until</FormLabel>
                <FormControl>
                  <Input {...field} type="date" className="tabular" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="terms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Terms &amp; warranty</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={4}
                  placeholder="Payment terms, warranty, permit responsibility…"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
