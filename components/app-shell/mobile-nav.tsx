"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { signOut } from "@/app/login/actions";
import {
  isNavItemActive,
  NAV_ACTIVE_CLASS,
  NAV_IDLE_CLASS,
  PRIMARY_NAV,
  SECONDARY_NAV,
} from "@/components/app-shell/nav-items";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/wordmark";
import { cn } from "@/lib/utils";

/*
 * Phone navigation (below lg) — the owner's main case, standing in someone's
 * kitchen.
 *
 * Deliberately still one row: the sections scroll sideways between a pinned
 * wordmark and a pinned way out, so nothing steals vertical space from the
 * screen they came here to read. What it gains over the old row is a visible
 * current section, which is the thing it never had.
 */
export function MobileNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 bg-canvas/85 pt-[env(safe-area-inset-top)] shadow-nav backdrop-blur lg:hidden">
      <div className="flex items-center gap-2 px-4 py-2">
        <Link href="/dashboard" className="shrink-0">
          {/* Just the mark on a phone: the sections need that width more than
              the wordtext does. */}
          <Wordmark labelClassName="hidden sm:inline" />
        </Link>

        <nav
          aria-label="Sections"
          className="no-scrollbar flex min-w-0 flex-1 gap-1 overflow-x-auto whitespace-nowrap"
        >
          {[...PRIMARY_NAV, ...SECONDARY_NAV].map((item) => {
            const active = isNavItemActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  // 44px tall: this is a thumb target on a job site.
                  "flex h-11 shrink-0 items-center rounded-md px-3 text-sm font-medium transition-colors",
                  active ? NAV_ACTIVE_CLASS : NAV_IDLE_CLASS,
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <form action={signOut} className="shrink-0">
          <Button
            type="submit"
            variant="ghost"
            size="icon-sm"
            aria-label="Sign out"
          >
            <LogOut />
          </Button>
        </form>
      </div>
    </header>
  );
}
