"use client";

import { Sparkles, TriangleAlert } from "lucide-react";
import { useActionState, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import {
  type DraftState,
  generateDraft,
  importDraftItems,
} from "@/app/(app)/quotes/[id]/ai-actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { DraftLineItem } from "@/lib/ai";
import type { Currency } from "@/lib/constants";
import { formatCents } from "@/lib/money";

const initialState: DraftState = { error: null, draft: null };

function GenerateButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="lg"
      className="w-full sm:w-auto"
      loading={pending}
    >
      {pending ? null : <Sparkles />}
      {pending ? "Drafting…" : "Draft with AI"}
    </Button>
  );
}

/**
 * Job description -> reviewable draft. The owner ticks what they want and only
 * then does anything reach the quote (golden rule 8). Items the AI couldn't
 * match carry no price at all and are labelled so.
 */
export function AiDraftPanel({
  quoteId,
  currency,
  hasScope,
}: {
  quoteId: string;
  currency: Currency;
  hasScope: boolean;
}) {
  const [state, formAction] = useActionState(generateDraft, initialState);
  const [skipped, setSkipped] = useState<Set<number>>(new Set());
  const [useScope, setUseScope] = useState(true);
  const [isImporting, startImporting] = useTransition();
  // Lets "Start over" return to the description box without reloading the page,
  // which would throw away unsaved edits elsewhere on the builder.
  const [dismissed, setDismissed] = useState(false);

  const draft = dismissed ? null : state.draft;

  function toggle(index: number) {
    setSkipped((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function chosenItems(): DraftLineItem[] {
    if (!draft) return [];
    return draft.lineItems.filter((_, index) => !skipped.has(index));
  }

  if (!draft) {
    return (
      <form
        action={formAction}
        className="space-y-3"
        noValidate
        onSubmit={() => {
          setDismissed(false);
          setSkipped(new Set());
        }}
      >
        <input type="hidden" name="quoteId" value={quoteId} />
        <div className="space-y-2">
          <Label htmlFor="jobDescription">Describe the job</Label>
          <Textarea
            id="jobDescription"
            name="jobDescription"
            rows={3}
            placeholder="Swap the old 100A panel for a 200A, add six recessed lights in the kitchen on a new circuit with a dimmer."
          />
          <p className="text-sm text-ink-60">
            We&apos;ll match it against your pricebook. Anything we can&apos;t
            match comes back without a price for you to set.
          </p>
        </div>

        {state.error ? (
          <Alert variant="destructive">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        ) : null}

        <GenerateButton />
      </form>
    );
  }

  const unpriced = draft.lineItems.filter((item) => item.needsPrice).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Review this draft</h2>
        <span className="text-sm text-ink-60">
          {chosenItems().length} of {draft.lineItems.length}
        </span>
      </div>

      {unpriced > 0 ? (
        <div className="flex items-start gap-2 rounded-md bg-status-viewed-bg p-3 text-sm text-status-viewed">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p>
            {unpriced} {unpriced === 1 ? "line isn't" : "lines aren't"} in your
            pricebook, so {unpriced === 1 ? "it has" : "they have"} no price.
            Add them and set the price yourself.
          </p>
        </div>
      ) : null}

      {draft.scopeOfWork ? (
        <label className="flex cursor-pointer items-start gap-3 rounded-md border border-hairline p-3">
          <input
            type="checkbox"
            checked={useScope}
            onChange={() => setUseScope(!useScope)}
            className="mt-1 size-4 accent-brand"
          />
          <span className="min-w-0 flex-1 text-sm">
            <span className="font-medium">
              {hasScope ? "Replace scope of work" : "Use this scope of work"}
            </span>
            <span className="mt-1 block text-ink-60">{draft.scopeOfWork}</span>
          </span>
        </label>
      ) : null}

      <ul className="divide-y divide-hairline">
        {draft.lineItems.map((item, index) => (
          <li key={`${item.name}-${index}`} className="py-3">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={!skipped.has(index)}
                onChange={() => toggle(index)}
                className="mt-1 size-4 accent-brand"
              />
              <span className="min-w-0 flex-1">
                <span className="font-medium">{item.name}</span>
                {item.description ? (
                  <span className="mt-0.5 block text-sm text-ink-60">
                    {item.description}
                  </span>
                ) : null}
                <span className="tabular mt-1 block text-sm text-ink-60">
                  {item.quantity} {item.unit}
                </span>
              </span>
              <span className="shrink-0 text-right">
                {item.needsPrice ? (
                  <span className="rounded-pill bg-status-viewed-bg px-2 py-0.5 text-xs font-medium text-status-viewed">
                    Price not set
                  </span>
                ) : (
                  <span className="tabular font-medium">
                    {formatCents(item.unitPrice ?? 0, currency)}
                  </span>
                )}
              </span>
            </label>
          </li>
        ))}
      </ul>

      {draft.suggestedAdditions.length > 0 ? (
        <div className="rounded-md bg-surface-2 p-3">
          <h3 className="text-sm font-medium">You might also need</h3>
          <ul className="mt-2 space-y-1">
            {draft.suggestedAdditions.map((addition) => (
              <li key={addition.name} className="text-sm text-ink-60">
                <span className="font-medium">{addition.name}</span>
                {addition.reason ? ` — ${addition.reason}` : null}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-sm text-ink-60">
            Not priced and not added. Add them yourself if the job needs them.
          </p>
        </div>
      ) : null}

      <div className="flex flex-col gap-2 pt-1 sm:flex-row-reverse sm:justify-start">
        <Button
          size="lg"
          className="w-full sm:w-auto"
          loading={isImporting}
          disabled={chosenItems().length === 0}
          onClick={() =>
            startImporting(async () => {
              const { error } = await importDraftItems({
                quoteId,
                scopeOfWork: useScope ? draft.scopeOfWork || null : null,
                items: chosenItems().map((item) => ({
                  name: item.name,
                  description: item.description,
                  quantity: item.quantity,
                  unit: item.unit,
                  type: item.type,
                  pricebookItemId: item.pricebookItemId,
                })),
              });
              if (error) toast.error(error);
              else toast.success("Lines added to the quote.");
            })
          }
        >
          {isImporting ? "Adding…" : `Add ${chosenItems().length} to quote`}
        </Button>
        <Button
          variant="ghost"
          size="lg"
          className="w-full sm:w-auto"
          onClick={() => setDismissed(true)}
        >
          Start over
        </Button>
      </div>
    </div>
  );
}
