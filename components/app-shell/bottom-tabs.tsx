"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  isNavItemActive,
  PRIMARY_NAV,
  SECONDARY_NAV,
} from "@/components/app-shell/nav-items";
import { cn } from "@/lib/utils";

/*
 * Phone navigation (below lg).
 *
 * A scrolling row of links put three of the five sections off-screen, so
 * reaching the pricebook meant discovering a swipe. Tabs put every section in
 * one tap, in the same place every time, at the bottom of the screen where a
 * thumb already is — the electrician is holding the phone one-handed on a
 * ladder, not two-handed at a desk.
 *
 * Same nav definition as the desktop rail (nav-items.ts), so the two can't
 * drift apart.
 */

const TABS = [...PRIMARY_NAV, ...SECONDARY_NAV];

export function BottomTabs() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Sections"
      // Hairline rather than a shadow: DESIGN.md spends its two shadows
      // elsewhere, and a bar this size doesn't need to lift off the page.
      className="fixed inset-x-0 bottom-0 z-20 border-t border-hairline bg-canvas/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <ul className="flex">
        {TABS.map((item) => {
          const active = isNavItemActive(pathname, item.href);
          const Icon = item.icon;

          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                // 56px of height plus the safe area: a thumb target, not a link.
                className="flex h-14 flex-col items-center justify-center gap-0.5"
              >
                {/* The wash pill sits behind the icon rather than the whole
                    tab, so the bar stays light while still using the same
                    "you are here" language as the desktop rail. */}
                <span
                  className={cn(
                    "flex h-6 w-10 items-center justify-center rounded-pill transition-colors",
                    active ? "bg-brand-wash text-brand" : "text-ink-40",
                  )}
                >
                  <Icon className="size-[18px]" aria-hidden />
                </span>
                <span
                  className={cn(
                    "text-[10px] leading-none font-medium",
                    active ? "text-brand" : "text-ink-60",
                  )}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
