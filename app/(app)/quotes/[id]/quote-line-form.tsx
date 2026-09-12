"use client";

import { toast } from "sonner";

import type { QuoteFormState } from "@/app/(app)/quotes/actions";
import { saveQuoteItem } from "@/app/(app)/quotes/item-actions";
import { Panel } from "@/components/panel";
import { SelectOrAdd } from "@/components/select-or-add";
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
import type { QuoteItem, QuoteOption } from "@/db/schema";
import {
  DEFAULT_PRICEBOOK_UNIT,
  DEFAULT_QUOTE_ITEM_TYPE,
  QUOTE_ITEM_TYPES,
  SUGGESTED_PRICEBOOK_UNITS,
} from "@/lib/constants";
import { centsToInputValue } from "@/lib/money";
import { formatQuantity } from "@/lib/quote-math";
import { type QuoteItemFields, quoteItemSchema } from "@/lib/schemas/quote";
import { useActionForm } from "@/lib/use-action-form";

const initialState: QuoteFormState = {
  error: null,
  fieldErrors: {},
  savedAt: null,
};

function defaultsFor(
  item: QuoteItem | null,
  defaultOptionId: string | null,
): QuoteItemFields {
  return {
    name: item?.name ?? "",
    description: item?.description ?? "",
    quantity: item ? formatQuantity(item.quantity) : "1",
    unit: item?.unit ?? DEFAULT_PRICEBOOK_UNIT,
    unitPrice: item ? centsToInputValue(item.unitPrice) : "",
    type: item?.type ?? DEFAULT_QUOTE_ITEM_TYPE,
    optionId: item?.optionId ?? defaultOptionId ?? "none",
  };
}

export function QuoteLineForm({
  quoteId,
  item,
  options,
  units,
  defaultOptionId,
  onClose,
}: {
  quoteId: string;
  item: QuoteItem | null;
  options: QuoteOption[];
  /** Units already in this business's pricebook, on top of the suggested ones. */
  units: string[];
  defaultOptionId: string | null;
  onClose: () => void;
}) {
  const { form, onSubmit, state, isPending } = useActionForm({
    schema: quoteItemSchema,
    defaultValues: defaultsFor(item, defaultOptionId),
    initialState,
    action: async (prevState, formData) => {
      const result = await saveQuoteItem(prevState, formData);
      if (result.savedAt) {
        toast.success(item ? "Line updated." : "Line added.");
        onClose();
      }
      return result;
    },
  });

  return (
    <Form {...form}>
      <Panel asChild>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <h3 className="font-semibold">{item ? "Edit line" : "Add a line"}</h3>

          <input type="hidden" name="quoteId" value={quoteId} />
          {item ? <input type="hidden" name="itemId" value={item.id} /> : null}

          {state.error ? (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          ) : null}

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Recessed light" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Detail</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={2}
                    placeholder="What the customer gets for this line."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input {...field} inputMode="decimal" className="tabular" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit</FormLabel>
                  <FormControl>
                    <SelectOrAdd
                      name={field.name}
                      value={field.value}
                      onChange={field.onChange}
                      suggestions={SUGGESTED_PRICEBOOK_UNITS}
                      used={units}
                      addLabel="Add your own unit…"
                      inputPlaceholder="e.g. run"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="unitPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit price</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      inputMode="decimal"
                      className="tabular"
                      placeholder="185.00"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
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
                      {QUOTE_ITEM_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type === "discount" ? "discount (subtracts)" : type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {options.length > 0 ? (
              <FormField
                control={form.control}
                name="optionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Applies to</FormLabel>
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
                        <SelectItem value="none">All options</SelectItem>
                        {options.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              // No options to choose between, but the field still has to reach
              // the action — the schema requires it.
              <input type="hidden" name="optionId" value="none" />
            )}
          </div>

          <div className="flex flex-col gap-2 pt-2 sm:flex-row-reverse sm:justify-start">
            <Button
              type="submit"
              size="lg"
              className="w-full sm:w-auto"
              loading={isPending}
            >
              {isPending ? "Saving…" : "Save line"}
            </Button>
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
    </Form>
  );
}
