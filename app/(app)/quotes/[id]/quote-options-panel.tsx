"use client";

import { Check, Loader2, Plus, Trash2 } from "lucide-react";
import { useActionState, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import type { QuoteFormState } from "@/app/(app)/quotes/actions";
import {
  addQuoteOption,
  deleteQuoteOption,
  setRecommendedOption,
} from "@/app/(app)/quotes/item-actions";
import { Panel } from "@/components/panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { QuoteOption } from "@/db/schema";
import type { Currency } from "@/lib/constants";
import { formatCents } from "@/lib/money";

const initialState: QuoteFormState = {
  error: null,
  fieldErrors: {},
  savedAt: null,
};

function AddButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="ghost"
      size="lg"
      className="w-full sm:w-auto"
      disabled={pending}
    >
      {pending ? "Adding…" : "Add option"}
    </Button>
  );
}

/**
 * Good/Better/Best (SPEC §10) — optional. With no options a quote has a single
 * price; add options and each one totals the shared lines plus its own.
 */
export function QuoteOptionsPanel({
  quoteId,
  options,
  currency,
}: {
  quoteId: string;
  options: QuoteOption[];
  currency: Currency;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startAction] = useTransition();

  const [state, formAction] = useActionState<QuoteFormState, FormData>(
    async (prevState, formData) => {
      const result = await addQuoteOption(prevState, formData);
      if (result.savedAt) {
        toast.success("Option added.");
        setIsAdding(false);
      }
      return result;
    },
    initialState,
  );

  function run(id: string, work: () => Promise<{ error: string | null }>) {
    setPendingId(id);
    startAction(async () => {
      const { error } = await work();
      if (error) toast.error(error);
      setPendingId(null);
    });
  }

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Options</h2>
        {!isAdding ? (
          <Button variant="ghost" size="sm" onClick={() => setIsAdding(true)}>
            <Plus />
            Add
          </Button>
        ) : null}
      </div>

      {options.length === 0 && !isAdding ? (
        <Panel className="text-sm text-ink-60">
          This quote has one price. Add options to offer Good / Better / Best.
        </Panel>
      ) : null}

      {options.length > 0 ? (
        <Panel asChild className="p-0">
          <ul className="divide-y divide-hairline">
            {options.map((option) => (
              <li key={option.id} className="flex items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    {option.name}
                    {option.isRecommended ? (
                      <span className="ml-2 rounded-pill bg-status-accepted-bg px-2 py-0.5 text-xs font-medium text-status-accepted">
                        Recommended
                      </span>
                    ) : null}
                  </p>
                  <p className="tabular mt-1 text-sm text-ink-60">
                    {formatCents(option.total, currency)}
                  </p>
                </div>

                {pendingId === option.id ? (
                  <Loader2 className="size-4 animate-spin text-ink-40" />
                ) : (
                  <div className="flex shrink-0 gap-1">
                    {!option.isRecommended ? (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Recommend ${option.name}`}
                        onClick={() =>
                          run(option.id, () =>
                            setRecommendedOption(quoteId, option.id),
                          )
                        }
                      >
                        <Check />
                      </Button>
                    ) : null}
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Remove ${option.name}`}
                      className="text-destructive"
                      onClick={() =>
                        run(option.id, () =>
                          deleteQuoteOption(quoteId, option.id),
                        )
                      }
                    >
                      <Trash2 />
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}

      {isAdding ? (
        <Panel asChild>
          <form action={formAction} className="space-y-3" noValidate>
            <input type="hidden" name="quoteId" value={quoteId} />
            <div className="space-y-2">
              <Label htmlFor="option-name">Option name</Label>
              <Input
                id="option-name"
                name="name"
                required
                placeholder="Standard"
              />
              {state.fieldErrors.name ? (
                <p className="text-sm text-destructive" role="alert">
                  {state.fieldErrors.name}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="option-description">Description</Label>
              <Input
                id="option-description"
                name="description"
                placeholder="What this option includes"
              />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row-reverse sm:justify-start">
              <AddButton />
              <Button
                type="button"
                variant="ghost"
                size="lg"
                className="w-full sm:w-auto"
                onClick={() => setIsAdding(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Panel>
      ) : null}
    </section>
  );
}
