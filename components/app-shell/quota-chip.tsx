import Link from "next/link";

import type { PlanStatus } from "@/lib/plan";
import { PLAN_LABELS } from "@/lib/constants";

/**
 * The app's ONE upgrade surface.
 *
 * The consistent advice on both halves of this is the same: pick a single
 * entry point and leave it there. Repeating an upgrade prompt in the sidebar,
 * the header and a banner turns navigation into a billboard, and the prompt
 * stops being read. So this lives in the header and nowhere else — the sidebar
 * stays navigation.
 *
 * It also shows the running count rather than waiting to interrupt at the cap.
 * Someone who can see "3 of 5 used" can plan an upgrade; someone stopped
 * mid-quote by a modal has already lost the thread of what they were doing.
 *
 * On a paid plan there is nothing to sell, so it degrades to a quiet plan chip.
 */
export function QuotaChip({ status }: { status: PlanStatus }) {
  if (status.limit === null) {
    return (
      <span className="hidden rounded-pill bg-surface-2 px-2.5 py-1 text-xs font-medium text-ink-60 sm:inline-flex">
        {PLAN_LABELS[status.plan]}
      </span>
    );
  }

  const remaining = Math.max(status.limit - status.used, 0);

  return (
    <Link
      href="/billing"
      className="group flex items-center gap-2 rounded-pill py-1 pr-1 pl-2 transition-colors hover:bg-surface-2 sm:gap-2.5 sm:pl-3"
    >
      {/* Only the wording drops on a narrow phone. The meter and the way to
          act on it stay, because a phone is exactly where someone runs out
          mid-job — hiding the count there hides it when it matters most. */}
      <span className="hidden text-xs font-medium text-ink-60 sm:inline">
        {status.atLimit ? (
          <span className="text-status-declined">No quotes left</span>
        ) : (
          <>
            <span className="tabular text-ink-90">{remaining}</span>
            {remaining === 1 ? " quote left" : " quotes left"}
          </>
        )}
      </span>

      {/* One segment per quote rather than a proportional bar: at this few
          units the shape reads faster than a percentage, and it survives being
          squeezed into a phone header. */}
      <span className="flex items-center gap-0.5" aria-hidden>
        {Array.from({ length: status.limit }, (_, index) => (
          <span
            key={index}
            className={`h-3 w-1 rounded-sm ${
              index < status.used
                ? status.nearLimit
                  ? "bg-status-declined"
                  : "bg-brand"
                : "bg-hairline-strong"
            }`}
          />
        ))}
      </span>

      <span className="rounded-pill bg-brand-wash px-2.5 py-1 text-xs font-medium text-brand">
        Upgrade
      </span>

      <span className="sr-only">
        {status.used} of {status.limit} quotes used this month. Upgrade your
        plan.
      </span>
    </Link>
  );
}
