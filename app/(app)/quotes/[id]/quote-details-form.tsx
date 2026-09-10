"use client";

import { toast } from "sonner";

import {
  type QuoteFormState,
  saveQuoteDetails,
} from "@/app/(app)/quotes/actions";
import { Panel } from "@/components/panel";
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
import { centsToInputValue } from "@/lib/money";
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
    discount: quote.discount > 0 ? centsToInputValue(quote.discount) : "",
    validUntil: toDateInput(quote.validUntil),
    terms: quote.terms ?? "",
  };
}

export function QuoteDetailsForm({
  quote,
  customers,
  onAddCustomer,
}: {
  quote: Quote;
  customers: Customer[];
  onAddCustomer: () => void;
}) {
  const { form, onSubmit, state, isPending } = useActionForm({
    schema: quoteDetailsSchema,
    defaultValues: defaultsFor(quote),
    initialState,
    action: async (prevState, formData) => {
      const result = await saveQuoteDetails(prevState, formData);
      if (result.savedAt) toast.success("Draft saved.");
      return result;
    },
  });

  return (
    <Form {...form}>
      <Panel asChild>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
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

          <Button
            type="submit"
            size="lg"
            className="w-full"
            loading={isPending}
          >
            {isPending ? "Saving…" : "Save draft"}
          </Button>
        </form>
      </Panel>
    </Form>
  );
}
