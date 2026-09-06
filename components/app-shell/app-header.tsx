import Link from "next/link";

import { AccountMenu } from "@/components/app-shell/account-menu";
import { QuotaChip } from "@/components/app-shell/quota-chip";
import { Wordmark } from "@/components/wordmark";
import type { PlanStatus } from "@/lib/plan";

/**
 * Desktop top bar (lg and up). Full width, above everything.
 *
 * The bar spans the whole window and the rail hangs beneath it, rather than the
 * rail running full height with the bar tucked into the content column. The
 * inset version left a corner where a white bar met a white rail with two
 * different top edges — a step, right where the eye starts reading.
 *
 * Spanning it also gives the bar its left slot back. The wordmark moved up here
 * from the top of the rail: it is the one thing on screen that is about the
 * whole app rather than the current section, so it belongs in the bar that is
 * also about the whole app. Its padding matches the rail's so the mark sits on
 * the same vertical as the navigation under it.
 *
 * There is still no page title here on purpose — every screen opens with its
 * own h1, and repeating it would be the same words twice on one screen.
 */
export function AppHeader({
  email,
  businessName,
  planStatus,
}: {
  email: string | null;
  businessName: string | null;
  planStatus: PlanStatus;
}) {
  return (
    <header className="sticky top-0 z-30 hidden h-16 border-b border-hairline bg-surface/95 backdrop-blur lg:block">
      <div className="flex h-full items-center pr-6 pl-3">
        {/* w-60 matches the rail, so the mark and the sections below it share
            an edge instead of nearly sharing one. */}
        <div className="w-60 shrink-0">
          <Link
            href="/dashboard"
            // px-3 to match the rail's nav links, so the mark and the section
            // labels below it start on the same vertical.
            className="inline-block rounded-md px-3 py-1 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
          >
            <Wordmark />
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <QuotaChip status={planStatus} />
          <AccountMenu
            email={email}
            businessName={businessName}
            plan={planStatus.plan}
          />
        </div>
      </div>
    </header>
  );
}
