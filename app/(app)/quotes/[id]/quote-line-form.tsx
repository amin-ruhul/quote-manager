"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import type { QuoteFormState } from "@/app/(app)/quotes/actions";
import { saveQuoteItem } from "@/app/(app)/quotes/item-actions";
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
import type { QuoteItem, QuoteOption } from "@/db/schema";
import { PRICEBOOK_UNITS, QUOTE_ITEM_TYPES } from "@/lib/constants";
import { centsToInputValue } from "@/lib/money";
import { formatQuantity } from "@/lib/quote-math";

const initialState: QuoteFormState = {
  error: null,
  fieldErrors: {},
  savedAt: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="lg"
      className="w-full sm:w-auto"
      disabled={pending}
    >
      {pending ? "Saving…" : "Save line"}
    </Button>
  );
}

export function QuoteLineForm({
  quoteId,
  item,
  options,
  defaultOptionId,
  onClose,
}: {
  quoteId: string;
  item: QuoteItem | null;
  options: QuoteOption[];
  defaultOptionId: string | null;
  onClose: () => void;
}) {
  const [state, formAction] = useActionState<QuoteFormState, FormData>(
    async (prevState, formData) => {
      const result = await saveQuoteItem(prevState, formData);
      if (result.savedAt) {
        toast.success(item ? "Line updated." : "Line added.");
        onClose();
      }
      return result;
    },
    initialState,
  );

  return (
    <Panel asChild>
      <form action={formAction} className="space-y-4" noValidate>
        <h3 className="font-semibold">{item ? "Edit line" : "Add a line"}</h3>

        <input type="hidden" name="quoteId" value={quoteId} />
        {item ? <input type="hidden" name="itemId" value={item.id} /> : null}

        {state.error ? (
          <Alert variant="destructive">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="line-name">Description</Label>
          <Input
            id="line-name"
            name="name"
            defaultValue={item?.name ?? ""}
            required
            placeholder="Recessed light"
          />
          {state.fieldErrors.name ? (
            <p className="text-sm text-destructive" role="alert">
              {state.fieldErrors.name}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="line-description">Detail</Label>
          <Textarea
            id="line-description"
            name="description"
            rows={2}
            defaultValue={item?.description ?? ""}
            placeholder="What the customer gets for this line."
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="line-quantity">Quantity</Label>
            <Input
              id="line-quantity"
              name="quantity"
              inputMode="decimal"
              className="tabular"
              defaultValue={item ? formatQuantity(item.quantity) : "1"}
              required
            />
            {state.fieldErrors.quantity ? (
              <p className="text-sm text-destructive" role="alert">
                {state.fieldErrors.quantity}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="line-unit">Unit</Label>
            <Select name="unit" defaultValue={item?.unit ?? "each"}>
              <SelectTrigger id="line-unit" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRICEBOOK_UNITS.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="line-price">Unit price</Label>
            <Input
              id="line-price"
              name="unitPrice"
              inputMode="decimal"
              className="tabular"
              defaultValue={item ? centsToInputValue(item.unitPrice) : ""}
              required
              placeholder="185.00"
            />
            {state.fieldErrors.unitPrice ? (
              <p className="text-sm text-destructive" role="alert">
                {state.fieldErrors.unitPrice}
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="line-type">Type</Label>
            <Select name="type" defaultValue={item?.type ?? "qty"}>
              <SelectTrigger id="line-type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUOTE_ITEM_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type === "discount" ? "discount (subtracts)" : type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {options.length > 0 ? (
            <div className="space-y-2">
              <Label htmlFor="line-option">Applies to</Label>
              <Select
                name="optionId"
                defaultValue={item?.optionId ?? defaultOptionId ?? "none"}
              >
                <SelectTrigger id="line-option" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">All options</SelectItem>
                  {options.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <input type="hidden" name="optionId" value="none" />
          )}
        </div>

        <div className="flex flex-col gap-2 pt-2 sm:flex-row-reverse sm:justify-start">
          <SubmitButton />
          <Button
            type="button"
            variant="ghost"
            size="lg"
            className="w-full sm:w-auto"
            onClick={onClose}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Panel>
  );
}
