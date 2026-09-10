"use client";

import { toast } from "sonner";

import {
  type PricebookFormState,
  savePricebookItem,
} from "@/app/(app)/pricebook/actions";
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
import type { PricebookItem } from "@/db/schema";
import { DEFAULT_PRICEBOOK_UNIT, PRICEBOOK_UNITS } from "@/lib/constants";
import { centsToInputValue } from "@/lib/money";
import {
  type PricebookItemFields,
  pricebookItemSchema,
} from "@/lib/schemas/pricebook";
import { useActionForm } from "@/lib/use-action-form";

const initialState: PricebookFormState = {
  error: null,
  fieldErrors: {},
  savedAt: null,
};

function defaultsFor(item: PricebookItem | null): PricebookItemFields {
  return {
    name: item?.name ?? "",
    description: item?.description ?? "",
    category: item?.category ?? "",
    unit: item?.unit ?? DEFAULT_PRICEBOOK_UNIT,
    price: item ? centsToInputValue(item.price) : "",
  };
}

/**
 * Add/edit form for one pricebook item. Rendered inline rather than in a modal
 * so it works comfortably on a phone with the keyboard open.
 */
export function PricebookItemDialog({
  item,
  categories,
  onClose,
}: {
  item: PricebookItem | null;
  categories: string[];
  onClose: () => void;
}) {
  const { form, onSubmit, state, isPending } = useActionForm({
    schema: pricebookItemSchema,
    defaultValues: defaultsFor(item),
    initialState,
    action: async (prevState, formData) => {
      const result = await savePricebookItem(prevState, formData);
      if (result.savedAt) {
        toast.success(item ? "Item updated." : "Item added.");
        onClose();
      }
      return result;
    },
  });

  return (
    <Form {...form}>
      <Panel asChild>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <h2 className="font-semibold">{item ? "Edit item" : "New item"}</h2>

          {item ? <input type="hidden" name="id" value={item.id} /> : null}

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
                <FormLabel>Name</FormLabel>
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
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={2}
                    placeholder="What the customer gets for this price."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
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

            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit</FormLabel>
                  {/* Radix renders its own hidden native select for `name`, so
                      the value reaches FormData as well as React Hook Form. */}
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
                      {PRICEBOOK_UNITS.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    list="pricebook-categories"
                    placeholder="Lighting"
                  />
                </FormControl>
                <datalist id="pricebook-categories">
                  {categories.map((category) => (
                    <option key={category} value={category} />
                  ))}
                </datalist>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Full-width stack on a phone; content-width row on desktop, with the
              primary action on the right. */}
          <div className="flex flex-col gap-2 pt-2 sm:flex-row-reverse sm:justify-start">
            <Button
              type="submit"
              size="lg"
              className="w-full sm:w-auto"
              loading={isPending}
            >
              {isPending ? "Saving…" : "Save item"}
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
