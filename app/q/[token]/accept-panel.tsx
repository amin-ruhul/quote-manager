"use client";

import { Check } from "lucide-react";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { type AcceptState, acceptQuote } from "@/app/q/[token]/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Currency } from "@/lib/constants";
import { formatCents } from "@/lib/money";

const initialState: AcceptState = { error: null, acceptedAt: null };

type Option = {
  id: string;
  name: string;
  description: string | null;
  total: number;
  isRecommended: boolean;
};

function AcceptButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    /*
     * DESIGN.md sanctions solid green here as the one place a button may be
     * green — this is the single decision the whole page exists for, and the
     * stronger "yes" signal is worth the exception.
     */
    <Button
      type="submit"
      size="lg"
      loading={pending}
      className="h-14 w-full bg-status-accepted text-base text-white hover:bg-[#0c6230]"
    >
      {pending ? "Accepting…" : label}
    </Button>
  );
}

export function AcceptPanel({
  token,
  options,
  total,
  currency,
  businessName,
}: {
  token: string;
  options: Option[];
  total: number;
  currency: Currency;
  businessName: string;
}) {
  const [state, formAction] = useActionState(acceptQuote, initialState);
  const [selectedOptionId, setSelectedOptionId] = useState(
    options.find((option) => option.isRecommended)?.id ?? options[0]?.id ?? "",
  );

  if (state.acceptedAt) {
    return (
      <div className="rounded-lg bg-status-accepted-bg p-6 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-status-accepted">
          <Check className="size-6 text-white" aria-hidden />
        </div>
        <h2 className="mt-4 text-xl font-semibold text-status-accepted">
          Quote accepted
        </h2>
        <p className="mt-2 text-sm text-ink-60">
          Thanks — {businessName} has been notified and will be in touch to
          arrange the work.
        </p>
      </div>
    );
  }

  const chosen = options.find((option) => option.id === selectedOptionId);
  const payable = chosen ? chosen.total : total;

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      {options.length > 0 ? (
        <input type="hidden" name="optionId" value={selectedOptionId} />
      ) : null}

      {options.length > 0 ? (
        <fieldset className="space-y-2">
          <legend className="mb-2 font-semibold">Choose your option</legend>
          {options.map((option) => {
            const isSelected = option.id === selectedOptionId;
            return (
              <label
                key={option.id}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                  isSelected
                    ? "border-brand bg-brand-wash"
                    : "border-hairline bg-surface"
                }`}
              >
                <input
                  type="radio"
                  name="optionChoice"
                  value={option.id}
                  checked={isSelected}
                  onChange={() => setSelectedOptionId(option.id)}
                  className="mt-1 size-4 accent-brand"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2 font-medium">
                    {option.name}
                    {option.isRecommended ? (
                      <span className="rounded-pill bg-marigold px-2 py-0.5 text-xs font-medium">
                        Recommended
                      </span>
                    ) : null}
                  </span>
                  {option.description ? (
                    <span className="mt-1 block text-sm text-ink-60">
                      {option.description}
                    </span>
                  ) : null}
                  <span className="tabular mt-2 block font-semibold">
                    {formatCents(option.total, currency)}
                  </span>
                </span>
              </label>
            );
          })}
        </fieldset>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="signedName">Your name</Label>
        <Input
          id="signedName"
          name="signedName"
          autoComplete="name"
          placeholder="Type your full name to sign"
        />
        <p className="text-sm text-ink-60">
          Typing your name here counts as your signature. Optional.
        </p>
      </div>

      {state.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <AcceptButton label={`Accept · ${formatCents(payable, currency)}`} />

      <p className="text-center text-sm text-ink-60">
        Accepting tells {businessName} to go ahead with this work.
      </p>
    </form>
  );
}
