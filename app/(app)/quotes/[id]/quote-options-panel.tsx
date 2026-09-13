"use client";

import { Check, Loader2, Plus, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import type { QuoteFormState } from "@/app/(app)/quotes/actions";
import {
  addQuoteOption,
  deleteQuoteOption,
  setRecommendedOption,
} from "@/app/(app)/quotes/item-actions";
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
import type { QuoteOption } from "@/db/schema";
import type { Currency } from "@/lib/constants";
import { formatCents } from "@/lib/money";
import { quoteOptionSchema } from "@/lib/schemas/quote";
import { useActionForm } from "@/lib/use-action-form";

const initialState: QuoteFormState = {
  error: null,
  fieldErrors: {},
  savedAt: null,
};

/**
 * Its own component so the form's hooks are scoped to the form, and so it is
 * mounted fresh — and therefore blank — each time the owner opens it.
 */
function AddOptionForm({
  quoteId,
  onAdded,
  onCancel,
}: {
  quoteId: string;
  onAdded: () => void;
  onCancel: () => void;
}) {
  const { form, onSubmit, state, isPending } = useActionForm({
    schema: quoteOptionSchema,
    defaultValues: { name: "", description: "" },
    initialState,
    action: async (prevState, formData) => {
      const result = await addQuoteOption(prevState, formData);
      if (result.savedAt) {
        toast.success("Option added.");
        onAdded();
      }
      return result;
    },
  });

  return (
    <Form {...form}>
      <Panel asChild>
        <form onSubmit={onSubmit} className="space-y-3" noValidate>
          <input type="hidden" name="quoteId" value={quoteId} />

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
                <FormLabel>Option name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Standard" />
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
                  <Input {...field} placeholder="What this option includes" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col gap-2 sm:flex-row-reverse sm:justify-start">
            <Button
              type="submit"
              variant="ghost"
              size="lg"
              className="w-full sm:w-auto"
              loading={isPending}
            >
              {isPending ? "Adding…" : "Add option"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="lg"
              className="w-full sm:w-auto"
              onClick={onCancel}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Panel>
    </Form>
  );
}

/**
 * Good/Better/Best (SPEC §10) — optional. With no options a quote has a single
 * price; add options and each one totals the shared lines plus its own.
 */
export function QuoteOptionsPanel({
  quoteId,
  options,
  lineCounts,
  currency,
}: {
  quoteId: string;
  options: QuoteOption[];
  /** Lines belonging to each option, keyed by option id. */
  lineCounts: Record<string, number>;
  currency: Currency;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startAction] = useTransition();

  /* Every option carrying nothing of its own means every total is the same. */
  const identical = options.every(
    (option) => (lineCounts[option.id] ?? 0) === 0,
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
    /* The heading lives on the <CollapsibleSection> that wraps this. */
    <section className="space-y-2">
      {!isAdding ? (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => setIsAdding(true)}>
            <Plus />
            Add
          </Button>
        </div>
      ) : null}

      {options.length === 0 && !isAdding ? (
        <p className="text-sm text-ink-60">
          This quote has one price. Add options to offer Good / Better / Best.
        </p>
      ) : null}

      {/*
        An option with no lines of its own is the shared lines and nothing else
        — so every such option totals the same, and the owner is left asking
        what makes them different. The engine is right; it just never said so.
        Naming the gap here is what turns "why are these identical" into "ah, I
        need to put something in them".
      */}
      {options.length > 1 && identical ? (
        <Alert>
          <AlertDescription>
            These options all cost the same, because none of them has a line of
            its own yet. Add a line under &ldquo;Only in {options[0]?.name}
            &rdquo; below to tell them apart.
          </AlertDescription>
        </Alert>
      ) : null}

      {options.length > 0 ? (
        <ul className="divide-y divide-hairline rounded-md border border-hairline">
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
                <Loader2 className="size-4 animate-spin text-ink-60" />
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
      ) : null}

      {isAdding ? (
        <AddOptionForm
          quoteId={quoteId}
          onAdded={() => setIsAdding(false)}
          onCancel={() => setIsAdding(false)}
        />
      ) : null}
    </section>
  );
}
