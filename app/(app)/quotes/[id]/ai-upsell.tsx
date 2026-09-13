import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

/*
 * A second opinion before the quote goes out, before it is built.
 *
 * Shown rather than hidden on purpose: an owner who never sees the option never
 * asks for it, and a paid feature nobody knows exists sells nothing. Labelled
 * honestly as not-yet-available — a button that looks live and does nothing is
 * worse than one that says so.
 */

/** The Manual tab's equivalent: a second opinion before the quote goes out. */
export function AiQuoteCheck() {
  return (
    <div className="rounded-lg border border-dashed border-hairline p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 font-semibold">
            <Sparkles className="size-4 text-brand" />
            AI quote check
          </h3>
          <p className="mt-1 text-sm text-ink-60">
            Catch a missing permit or an unpriced line before your customer
            does.
          </p>
        </div>

        <Button variant="soft" disabled>
          Coming soon
        </Button>
      </div>
    </div>
  );
}
