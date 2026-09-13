"use client";

import Link from "next/link";
import { Building2, CreditCard, Gauge, LogOut } from "lucide-react";

import { signOut } from "@/app/login/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BILLING_ENABLED,
  PLAN_LABELS,
  PLAN_PAGE_PATH,
  type Plan,
} from "@/lib/constants";

/**
 * Account, billing, and the way out — in exactly one place.
 *
 * The convention the category follows is that these three live together and
 * never move: bottom-left with a sidebar, or top-right with a top bar. Picking
 * top-right meant taking "Sign out" back out of the sidebar rather than having
 * it in both, because a second copy is how someone learns to hunt for it.
 *
 * One component drives both the desktop header and the phone header, so the
 * two cannot disagree about what is in the menu.
 */
export function AccountMenu({
  email,
  businessName,
  plan,
}: {
  email: string | null;
  businessName: string | null;
  plan: Plan;
}) {
  // The mark falls back through business → email → a neutral glyph, so the
  // trigger is never blank on a half-finished account.
  const initial =
    businessName?.trim()?.[0]?.toUpperCase() ??
    email?.trim()?.[0]?.toUpperCase() ??
    "•";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Account menu"
        className="flex size-9 items-center justify-center rounded-pill bg-surface-2 text-sm font-semibold text-ink-90 transition-colors outline-none hover:bg-[color-mix(in_oklch,var(--color-surface-2),black_4%)] focus-visible:ring-3 focus-visible:ring-brand/50"
      >
        {initial}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          {businessName ? (
            <p className="truncate text-sm font-medium text-ink-90">
              {businessName}
            </p>
          ) : null}
          {email ? (
            <p className="truncate text-xs text-ink-60">{email}</p>
          ) : null}
          <p className="mt-2 inline-flex rounded-pill bg-brand-wash px-2 py-0.5 text-xs font-medium text-brand">
            {PLAN_LABELS[plan]} plan
          </p>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/onboarding">
            <Building2 aria-hidden />
            Business profile
          </Link>
        </DropdownMenuItem>

        {/* No card icon and no mention of billing while nothing is for sale —
            an owner shouldn't go looking for a bill that doesn't exist. */}
        <DropdownMenuItem asChild>
          <Link href={PLAN_PAGE_PATH}>
            {BILLING_ENABLED ? (
              <CreditCard aria-hidden />
            ) : (
              <Gauge aria-hidden />
            )}
            {BILLING_ENABLED ? "Plan & billing" : "Plan & usage"}
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          {/*
            A form, not a link: signing out is a state change, so it must not
            sit behind something a browser or a prefetcher may follow on its own.
          */}
          <form action={signOut}>
            <button type="submit" className="flex w-full items-center gap-2.5">
              <LogOut aria-hidden />
              Sign out
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
