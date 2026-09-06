import Link from "next/link";

import { AccountMenu } from "@/components/app-shell/account-menu";
import { QuotaChip } from "@/components/app-shell/quota-chip";
import { Wordmark } from "@/components/wordmark";
import type { PlanStatus } from "@/lib/plan";

/*
 * Phone header (below lg).
 *
 * Navigation moved to the bottom tabs, so this is down to what a header is
 * actually for: saying where you are, and holding the account menu.
 *
 * It carries the same `AccountMenu` as the desktop top bar rather than its own
 * sign-out button. A phone-only shortcut that behaves differently from the
 * desktop one is how the two quietly drift apart — and it is also how billing
 * ends up reachable on one device and not the other.
 */
export function MobileHeader({
  email,
  businessName,
  planStatus,
}: {
  email: string | null;
  businessName: string | null;
  planStatus: PlanStatus;
}) {
  return (
    // Same surface as the desktop bar, so the chrome reads the same on both.
    <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-hairline bg-surface/95 px-4 py-2 pt-[calc(0.5rem+env(safe-area-inset-top))] shadow-nav backdrop-blur lg:hidden">
      <Link href="/dashboard" className="shrink-0">
        <Wordmark />
      </Link>

      <div className="ml-auto flex shrink-0 items-center gap-1">
        <QuotaChip status={planStatus} />
        <AccountMenu
          email={email}
          businessName={businessName}
          plan={planStatus.plan}
        />
      </div>
    </header>
  );
}
