import Link from "next/link";

import { signOut } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { ensureProfile, requireUser } from "@/lib/auth";

/*
 * Shell for every signed-in screen. Mobile-first: the nav is a single sticky
 * bar with large tap targets, since the owner is on a phone at a job site.
 */
export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireUser();
  await ensureProfile(user.id, user.email ?? "");

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-10 bg-canvas/85 shadow-nav backdrop-blur">
        <nav className="mx-auto flex max-w-3xl items-center gap-1 px-4 py-2">
          <Link href="/pricebook" className="mr-auto font-semibold">
            QuotePilot
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link href="/pricebook">Pricebook</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/onboarding">Business</Link>
          </Button>
          <form action={signOut}>
            <Button type="submit" variant="ghost" size="sm">
              Sign out
            </Button>
          </form>
        </nav>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
