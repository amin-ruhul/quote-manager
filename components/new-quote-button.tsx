"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { createQuote } from "@/app/(app)/quotes/actions";
import { Button } from "@/components/ui/button";
import { PLAN_PAGE_PATH } from "@/lib/constants";

/**
 * The app's primary action, used in the sidebar and on the Quotes page.
 * Creating a draft round-trips before navigating, so it needs a pending state.
 *
 * Size is a prop because the same button is a full-width call to action on the
 * Quotes page and a normal one in the rail — but it stays one component, so
 * "New quote" always behaves the same wherever it is pressed.
 */
export function NewQuoteButton({
  size = "lg",
  className = "w-full",
  variant = "default",
}: {
  size?: "sm" | "default" | "lg";
  className?: string;
  /** `soft` in the sidebar, so the chrome never becomes a page's second blue. */
  variant?: "default" | "soft";
}) {
  const router = useRouter();
  const [isCreating, startCreating] = useTransition();

  return (
    <Button
      size={size}
      variant={variant}
      className={className}
      loading={isCreating}
      onClick={() =>
        startCreating(async () => {
          // No try/catch around the action: it reports failure as a value, and
          // catching here would also swallow any navigation error.
          const result = await createQuote();

          if (result.atLimit) {
            /*
             * The one failure with somewhere to go. A toast that only says
             * "you're out" leaves the owner stuck mid-job; this puts the way
             * to ask for more one tap away.
             */
            toast.error(result.error, {
              action: {
                label: "See options",
                onClick: () => router.push(PLAN_PAGE_PATH),
              },
            });
            return;
          }

          if (result.error) toast.error(result.error);
          else router.push(`/quotes/${result.quoteId}`);
        })
      }
    >
      {isCreating ? null : <Plus />}
      {isCreating ? "Starting…" : "New quote"}
    </Button>
  );
}
