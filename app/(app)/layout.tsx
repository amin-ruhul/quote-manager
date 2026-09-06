import type { Viewport } from "next";

import { AppHeader } from "@/components/app-shell/app-header";
import { BottomTabs } from "@/components/app-shell/bottom-tabs";
import { MobileHeader } from "@/components/app-shell/mobile-header";
import { Sidebar } from "@/components/app-shell/sidebar";
import { RegisterServiceWorker } from "@/components/pwa/register-service-worker";
import { getBusinessForOwner, requireUser } from "@/lib/auth";
import { getPlanStatus } from "@/lib/plan";

/*
 * Installed on a phone, the app draws edge to edge with no browser chrome, so
 * it has to keep itself clear of the notch and the home indicator. This is set
 * on the app shell only — the public quote page stays an ordinary web page.
 */
export const viewport: Viewport = { viewportFit: "cover" };

/*
 * Shell for every signed-in screen.
 *
 * Three pieces of chrome, one definition each:
 *
 * - The left rail (lg and up) owns primary navigation — the sections, and the
 *   one action the app exists for.
 * - The top bar (lg and up) owns what is true everywhere: the plan, the way to
 *   change it, and the account menu. Splitting them this way is what the
 *   category converged on, and it keeps the rail from collecting utilities.
 * - On a phone the rail becomes bottom tabs and the top bar becomes the mobile
 *   header, which carries the same account menu so nothing is desktop-only.
 */
export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // The profile row is created on sign-in and on email confirmation, not here:
  // doing it in the layout meant a database write on every single request.
  const user = await requireUser();

  // Both are request-cached, so a page that needs either does not pay twice.
  const [business, planStatus] = await Promise.all([
    getBusinessForOwner(user.id),
    getPlanStatus(user.id),
  ]);

  const businessName = business?.name ?? null;

  return (
    // The side insets are set once here so every inner padding stacks on top.
    <div className="min-h-dvh pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)] lg:flex">
      <RegisterServiceWorker />

      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <MobileHeader
          email={user.email}
          businessName={businessName}
          planStatus={planStatus}
        />
        <AppHeader
          email={user.email}
          businessName={businessName}
          planStatus={planStatus}
        />

        {/*
         * The bottom padding clears the tab bar on a phone, so the last row of
         * a list is reachable rather than sitting under it. From lg the tabs
         * are gone and the rail takes over, so it drops back to normal.
         *
         * `lg:pt-2` rather than `lg:pt-8`: the top bar now supplies the space
         * above the page that this padding used to.
         */}
        <main className="mx-auto w-full max-w-[1200px] px-4 pt-6 pb-[calc(5rem+env(safe-area-inset-bottom))] sm:px-6 lg:px-8 lg:pt-2 lg:pb-8">
          {children}
        </main>
      </div>

      <BottomTabs />
    </div>
  );
}
