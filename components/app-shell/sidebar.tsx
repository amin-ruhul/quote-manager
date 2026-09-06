"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  isNavItemActive,
  NAV_ACTIVE_CLASS,
  NAV_IDLE_CLASS,
  type NavItem,
  PRIMARY_NAV,
  SECONDARY_NAV,
} from "@/components/app-shell/nav-items";
import { NewQuoteButton } from "@/components/new-quote-button";
import { cn } from "@/lib/utils";

/*
 * Desktop navigation (lg and up).
 *
 * A persistent left rail is what every tool in this category does — Jobber and
 * Housecall Pro both put the sections down the left and reserve the top for
 * account chrome — so it is the shape an electrician switching from one of them
 * already knows. It also gives the wordmark somewhere to sit and makes "where
 * am I" unmissable, which a row of identical buttons never did. The wordmark
 * lives in the top bar above rather than here — it is about the whole app, not
 * about which section you are in.
 *
 * "New quote" lives up here rather than on each page: it is the one thing the
 * app is for, and the rail is the one place that is on every screen.
 *
 * It is the ghost variant, not a filled blue, and that is deliberate. A
 * persistent filled button in the chrome would be a second blue on every page
 * that has a real primary action of its own — "Save changes", "Send quote" —
 * which DESIGN.md forbids outright. Reserving the filled blue for the action
 * you came to the page to take, and giving navigation the wash, keeps the rule
 * literally true on every screen instead of carving an exception for the frame.
 */
export function Sidebar() {
  const pathname = usePathname();

  return (
    // top-16 / 4rem is the bar's height: the rail starts where the bar ends
    // and scrolls independently beneath it.
    <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-60 shrink-0 flex-col border-r border-hairline bg-surface px-3 py-4 lg:flex">
      {/* A hairline splits the action from the navigation. The wash is doing
          double duty otherwise — this button and the current section would
          read as the same kind of thing. */}
      <div className="border-b border-hairline px-1 pb-4">
        <NewQuoteButton className="w-full" size="default" variant="soft" />
      </div>

      <nav className="mt-4 flex flex-1 flex-col">
        <ul className="flex flex-col gap-0.5">
          {PRIMARY_NAV.map((item) => (
            <li key={item.href}>
              <SidebarLink item={item} pathname={pathname} />
            </li>
          ))}
        </ul>

        {/*
          Settings, held at the bottom and visually demoted.

          Sign out used to live here too. It moved to the account menu in the
          top bar, because account, billing and the way out belong together in
          one place — a second copy in the rail just teaches people to hunt.
        */}
        <div className="mt-auto flex flex-col gap-0.5 border-t border-hairline pt-3">
          {SECONDARY_NAV.map((item) => (
            <SidebarLink key={item.href} item={item} pathname={pathname} />
          ))}
        </div>
      </nav>
    </aside>
  );
}

function SidebarLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = isNavItemActive(pathname, item.href);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-10 items-center gap-2.5 rounded-md px-3 text-sm font-medium transition-colors",
        active ? NAV_ACTIVE_CLASS : NAV_IDLE_CLASS,
      )}
    >
      <Icon className="size-4 shrink-0" aria-hidden />
      {item.label}
    </Link>
  );
}
