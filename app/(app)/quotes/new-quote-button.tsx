"use client";

import { Plus } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

import { createQuote } from "@/app/(app)/quotes/actions";
import { Button } from "@/components/ui/button";

/** Creating a draft round-trips before redirecting, so it needs a pending state. */
export function NewQuoteButton() {
  const [isCreating, startCreating] = useTransition();

  return (
    <Button
      size="lg"
      className="w-full"
      disabled={isCreating}
      onClick={() =>
        startCreating(async () => {
          try {
            await createQuote();
          } catch {
            toast.error("We couldn't start a new quote. Try again.");
          }
        })
      }
    >
      <Plus />
      {isCreating ? "Starting…" : "New quote"}
    </Button>
  );
}
