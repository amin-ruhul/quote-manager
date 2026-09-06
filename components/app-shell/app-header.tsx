import { AccountMenu } from "@/components/app-shell/account-menu";
import { QuotaChip } from "@/components/app-shell/quota-chip";
import type { PlanStatus } from "@/lib/plan";

/**
 * Desktop top bar (lg and up), above the content column and beside the rail.
 *
 * The two-layer shape is the category standard: the sidebar owns primary
 * navigation, and the top bar owns the things that are true everywhere —
 * account, plan, billing. Keeping account chrome out of the rail is what stops
 * the rail from slowly becoming a junk drawer.
 *
 * It sits inside the content column rather than spanning the full width, so the
 * wordmark stays at the top of the rail where it already anchors the app.
 *
 * There is no page title here on purpose: every screen already opens with its
 * own h1, and repeating it would be two headings competing on one screen.
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
    // White on the warm canvas, with a hairline to land the edge and the one
    // shadow DESIGN.md grants a sticky nav. Canvas-on-canvas gave it nothing to
    // separate it from the page — the bar was there and read as absent.
    <header className="sticky top-0 z-20 hidden border-b border-hairline bg-surface/95 shadow-nav backdrop-blur lg:block">
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center gap-3 px-8">
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
