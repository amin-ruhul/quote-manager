"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/wordmark";

/**
 * The marketing nav: mark on the left, sections in the middle, the way in on
 * the right.
 *
 * The section links are absolute (`/#features`, not `#features`) so they work
 * from the sub-pages too — from /about, a bare hash would go nowhere.
 *
 * The nav is one of only two places DESIGN.md permits a shadow — but it only
 * takes it once there is something scrolled underneath to lift away from. At
 * the top of the page the bar sits flat on the canvas.
 */

/**
 * True once the page has scrolled off the top.
 *
 * `useSyncExternalStore` rather than an effect plus state: it is the pattern
 * the rest of the app already uses for browser state (see `components/pwa`),
 * it has a defined server snapshot, and it keeps `setState` out of an effect.
 */
function useScrolled() {
  return useSyncExternalStore(
    (onChange) => {
      window.addEventListener("scroll", onChange, { passive: true });
      return () => window.removeEventListener("scroll", onChange);
    },
    () => window.scrollY > 4,
    () => false,
  );
}
const LINKS = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/#pricing" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
];

export function LandingNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const scrolled = useScrolled();

  // The open phone menu needs the same lift: without it the panel's bottom edge
  // runs straight into the page with nothing separating them.
  const elevated = scrolled || open;

  // Closing happens on the link's own click rather than in an effect watching
  // the pathname: most of these links only change the hash, which would not
  // re-run that effect, and the panel would sit over the section it scrolled to.
  const close = () => setOpen(false);

  return (
    <header
      className={`sticky top-0 z-30 bg-canvas/85 backdrop-blur transition-shadow duration-200 ${
        elevated ? "shadow-nav" : ""
      }`}
    >
      <nav className="mx-auto flex max-w-5xl items-center gap-6 px-5 py-4 sm:px-8 sm:py-5">
        <Link href="/" aria-label="QuotePilot home">
          <Wordmark />
        </Link>

        {/* Centered section links. Hidden on phones, where they move into the
            panel below rather than being crushed into the bar. */}
        <ul className="mx-auto hidden items-center gap-9 lg:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <NavLink href={link.href} pathname={pathname}>
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-3 lg:ml-0">
          <Link
            href="/login"
            className="hidden px-2 text-sm font-medium text-ink-60 transition-colors duration-200 hover:text-ink-90 sm:block"
          >
            Log in
          </Link>

          {/*
            Soft, not filled. The nav is sticky, so a filled blue here would sit
            on screen beside the hero's primary — two chromatic buttons in one
            view, which DESIGN.md rules out.
          */}
          <Button asChild size="sm" variant="soft">
            <Link href="/login">Start free</Link>
          </Button>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="nav-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex size-9 items-center justify-center rounded-md text-ink-60 transition-colors duration-200 hover:bg-surface-2 hover:text-ink-90 lg:hidden"
          >
            {open ? (
              <X className="size-5" aria-hidden />
            ) : (
              <Menu className="size-5" aria-hidden />
            )}
          </button>
        </div>
      </nav>

      {open ? (
        <div
          id="nav-menu"
          className="border-t border-hairline bg-canvas lg:hidden"
        >
          <ul className="mx-auto max-w-5xl px-5 py-2 sm:px-8">
            {LINKS.map((link) => (
              <li key={link.href}>
                {/* h-12: a full-width, thumb-sized target — this is the menu an
                    electrician opens one-handed in a van. */}
                <Link
                  href={link.href}
                  onClick={close}
                  className="flex h-12 items-center border-b border-hairline text-base font-medium text-ink-90 last:border-b-0"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/login"
                onClick={close}
                className="flex h-12 items-center text-base font-medium text-brand"
              >
                Log in
              </Link>
            </li>
          </ul>
        </div>
      ) : null}
    </header>
  );
}

function NavLink({
  href,
  pathname,
  children,
}: {
  href: string;
  pathname: string;
  children: React.ReactNode;
}) {
  // Only the sub-pages can be "current"; the hash links all point at the home
  // page, and highlighting all four of them there would be noise.
  const isCurrent = !href.includes("#") && pathname === href;

  return (
    <Link
      href={href}
      aria-current={isCurrent ? "page" : undefined}
      className={`text-sm font-medium transition-colors duration-200 ${
        isCurrent ? "text-ink-90" : "text-ink-60 hover:text-ink-90"
      }`}
    >
      {children}
    </Link>
  );
}
