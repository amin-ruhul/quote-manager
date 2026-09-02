import type { Viewport } from "next";

import { MobileNav } from "@/components/app-shell/mobile-nav";
import { Sidebar } from "@/components/app-shell/sidebar";
import { RegisterServiceWorker } from "@/components/pwa/register-service-worker";
import { requireUser } from "@/lib/auth";

/*
 * Installed on a phone, the app draws edge to edge with no browser chrome, so
 * it has to keep itself clear of the notch and the home indicator. This is set
 * on the app shell only — the public quote page stays an ordinary web page.
 */
export const viewport: Viewport = { viewportFit: "cover" };

/*
 * Shell for every signed-in screen.
 *
 * Two navigations, one definition (components/app-shell/nav-items.ts): a sticky
 * top bar on a phone, where the owner works, and a persistent left rail from lg
 * up, where a row of identical buttons left the screen with no anchor and no
 * sense of place.
 */
export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // The profile row is created on sign-in and on email confirmation, not here:
  // doing it in the layout meant a database write on every single request.
  await requireUser();

  return (
    // The side insets are set once here so every inner padding stacks on top.
    <div className="min-h-dvh pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)] lg:flex">
      <RegisterServiceWorker />

      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <MobileNav />

        <main className="mx-auto w-full max-w-[1200px] px-4 pt-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:px-6 lg:px-8 lg:pt-8">
          {children}
        </main>
      </div>
    </div>
  );
}
