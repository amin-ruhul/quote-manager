import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/landing/wordmark";

/**
 * One CTA, everywhere, with the same words. The nav is one of only two places
 * DESIGN.md permits a shadow, so it is the only thing on the page that floats
 * besides the quote card.
 */
export function LandingNav() {
  return (
    <header className="sticky top-0 z-20 bg-canvas/85 shadow-nav backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center gap-4 px-5 py-3 sm:px-8">
        <Link href="/" aria-label="QuotePilot home" className="mr-auto">
          <Wordmark />
        </Link>

        <Link
          href="#pricing"
          className="hidden text-sm font-medium text-ink-60 hover:text-ink-90 sm:block"
        >
          Pricing
        </Link>

        {/*
          Soft, not filled. The nav is sticky, so a filled blue here would sit
          on screen beside the hero's primary — two chromatic buttons in one
          view, which DESIGN.md rules out. Same label and destination, so it is
          still the one repeated CTA.
        */}
        <Button asChild size="sm" variant="soft">
          <Link href="/login">Start free</Link>
        </Button>
      </nav>
    </header>
  );
}
