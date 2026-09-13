import { Check, Sparkles } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PLAN_PAGE_PATH, type UpgradeRequestSource } from "@/lib/constants";

/**
 * "I want this" — everywhere a feature is locked.
 *
 * It doesn't send the request itself: it carries the owner to the one form on
 * the plan page, with `?from=` saying which door they came through. One place
 * to ask means one place where they can say *why* they want it, and that
 * sentence is worth more to the market test than the tap.
 *
 * A plain link, not an action, so it prefetches, opens in a new tab if someone
 * wants that, and needs no JavaScript to work.
 */
export function RequestAccessButton({
  source,
  requested,
  label = "Request access",
  variant = "soft",
  size = "default",
  className,
}: {
  source: UpgradeRequestSource;
  /** True when this owner has already asked — from anywhere. */
  requested: boolean;
  label?: string;
  variant?: "soft" | "default" | "ghost";
  size?: "sm" | "default" | "lg";
  className?: string;
}) {
  if (requested) {
    return (
      <span
        className={`inline-flex h-11 items-center gap-1.5 rounded-md bg-status-accepted-bg px-3 text-sm font-medium text-status-accepted ${className ?? ""}`}
      >
        <Check className="size-4" />
        Request sent
      </span>
    );
  }

  return (
    <Button asChild variant={variant} size={size} className={className}>
      {/* The hash lands on the form itself rather than the top of the page,
          so the thing they came for is what they see. */}
      <Link href={`${PLAN_PAGE_PATH}?from=${source}#request`}>
        <Sparkles />
        {label}
      </Link>
    </Button>
  );
}
