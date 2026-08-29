"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import { customerName } from "@/app/(app)/customers/customer-list";
import {
  type QuoteFormState,
  saveQuoteDetails,
} from "@/app/(app)/quotes/actions";
import { Panel } from "@/components/panel";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Customer, Quote } from "@/db/schema";
import { centsToInputValue } from "@/lib/money";

const initialState: QuoteFormState = {
  error: null,
  fieldErrors: {},
  savedAt: null,
};

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "Saving…" : "Save draft"}
    </Button>
  );
}

/** yyyy-mm-dd for <input type="date">. */
function toDateInput(value: Date | null): string {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
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
  const [state, formAction] = useActionState<QuoteFormState, FormData>(
    async (prevState, formData) => {
      const result = await saveQuoteDetails(prevState, formData);
      if (result.savedAt) toast.success("Draft saved.");
      return result;
    },
    initialState,
  );

  return (
    <Panel asChild>
      <form action={formAction} className="space-y-4" noValidate>
        <input type="hidden" name="quoteId" value={quote.id} />

        {state.error ? (
          <Alert variant="destructive">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="title">Job title</Label>
          <Input
            id="title"
            name="title"
            defaultValue={quote.title}
            required
            placeholder="Panel replacement"
          />
          {state.fieldErrors.title ? (
            <p className="text-sm text-destructive" role="alert">
              {state.fieldErrors.title}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="customerId">Customer</Label>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={onAddCustomer}
            >
              New customer
            </Button>
          </div>
          <Select name="customerId" defaultValue={quote.customerId ?? "none"}>
            <SelectTrigger id="customerId" className="w-full">
              <SelectValue />
            </SelectTrigger>
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
        </div>

        <div className="space-y-2">
          <Label htmlFor="scopeOfWork">Scope of work</Label>
          <Textarea
            id="scopeOfWork"
            name="scopeOfWork"
            rows={4}
            defaultValue={quote.scopeOfWork ?? ""}
            placeholder="What you'll do, in plain English."
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="discount">Discount</Label>
            <Input
              id="discount"
              name="discount"
              inputMode="decimal"
              className="tabular"
              defaultValue={
                quote.discount > 0 ? centsToInputValue(quote.discount) : ""
              }
              placeholder="0.00"
            />
            {state.fieldErrors.discount ? (
              <p className="text-sm text-destructive" role="alert">
                {state.fieldErrors.discount}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="validUntil">Valid until</Label>
            <Input
              id="validUntil"
              name="validUntil"
              type="date"
              className="tabular"
              defaultValue={toDateInput(quote.validUntil)}
            />
            {state.fieldErrors.validUntil ? (
              <p className="text-sm text-destructive" role="alert">
                {state.fieldErrors.validUntil}
              </p>
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="terms">Terms &amp; warranty</Label>
          <Textarea
            id="terms"
            name="terms"
            rows={4}
            defaultValue={quote.terms ?? ""}
            placeholder="Payment terms, warranty, permit responsibility…"
          />
        </div>

        <SaveButton />
      </form>
    </Panel>
  );
}
