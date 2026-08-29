"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { createQuote } from "@/app/(app)/quotes/actions";
import { Button } from "@/components/ui/button";

/** Creating a draft round-trips before navigating, so it needs a pending state. */
export function NewQuoteButton() {
  const router = useRouter();
  const [isCreating, startCreating] = useTransition();

  return (
    <Button
      size="lg"
      className="w-full"
      disabled={isCreating}
      onClick={() =>
        startCreating(async () => {
          // No try/catch around the action: it reports failure as a value, and
          // catching here would also swallow any navigation error.
          const { quoteId, error } = await createQuote();
          if (error) toast.error(error);
          else router.push(`/quotes/${quoteId}`);
        })
      }
    >
      <Plus />
      {isCreating ? "Starting…" : "New quote"}
    </Button>
  );
}
