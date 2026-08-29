"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import {
  type PricebookFormState,
  savePricebookItem,
} from "@/app/(app)/pricebook/actions";
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
import type { PricebookItem } from "@/db/schema";
import { PRICEBOOK_UNITS } from "@/lib/constants";
import { centsToInputValue } from "@/lib/money";

const initialState: PricebookFormState = {
  error: null,
  fieldErrors: {},
  savedAt: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "Saving…" : "Save item"}
    </Button>
  );
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
  const [state, formAction] = useActionState<PricebookFormState, FormData>(
    async (prevState, formData) => {
      const result = await savePricebookItem(prevState, formData);
      if (result.savedAt) {
        toast.success(item ? "Item updated." : "Item added.");
        onClose();
      }
      return result;
    },
    initialState,
  );

  return (
    <Panel asChild>
      <form action={formAction} className="space-y-4" noValidate>
        <h2 className="font-semibold">{item ? "Edit item" : "New item"}</h2>

        {item ? <input type="hidden" name="id" value={item.id} /> : null}

        {state.error ? (
          <Alert variant="destructive">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="item-name">Name</Label>
          <Input
            id="item-name"
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
          <Label htmlFor="item-description">Description</Label>
          <Textarea
            id="item-description"
            name="description"
            rows={2}
            defaultValue={item?.description ?? ""}
            placeholder="What the customer gets for this price."
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="item-price">Price</Label>
            <Input
              id="item-price"
              name="price"
              inputMode="decimal"
              className="tabular"
              defaultValue={item ? centsToInputValue(item.price) : ""}
              required
              placeholder="185.00"
            />
            {state.fieldErrors.price ? (
              <p className="text-sm text-destructive" role="alert">
                {state.fieldErrors.price}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="item-unit">Unit</Label>
            <Select name="unit" defaultValue={item?.unit ?? "each"}>
              <SelectTrigger id="item-unit" className="w-full">
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
        </div>

        <div className="space-y-2">
          <Label htmlFor="item-category">Category</Label>
          <Input
            id="item-category"
            name="category"
            defaultValue={item?.category ?? ""}
            list="pricebook-categories"
            placeholder="Lighting"
          />
          <datalist id="pricebook-categories">
            {categories.map((category) => (
              <option key={category} value={category} />
            ))}
          </datalist>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row-reverse">
          <SubmitButton />
          <Button
            type="button"
            variant="ghost"
            size="lg"
            className="w-full"
            onClick={onClose}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Panel>
  );
}
