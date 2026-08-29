import Link from "next/link";

import { QuoteCardPreview } from "@/components/landing/quote-card-preview";
import { Button } from "@/components/ui/button";

/**
 * The thesis: an outcome an electrician recognises as their own Tuesday, next
 * to the screen that produces it. One filled blue button, and the trust line
 * that answers the three objections before they're asked.
 */
export function Hero() {
  return (
    <section className="mx-auto max-w-5xl px-5 pt-12 pb-16 sm:px-8 sm:pt-20 sm:pb-24">
      <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div>
          <p className="text-sm font-medium text-ink-60">
            For residential electricians
          </p>

          <h1 className="mt-4 text-4xl leading-[1.05] font-semibold text-balance sm:text-5xl lg:text-6xl">
            Send the quote before you
            <span className="mx-1.5 inline-block rounded-md bg-marigold px-2 py-0.5">
              leave
            </span>
            the driveway.
          </h1>

          <p className="mt-6 max-w-lg text-lg text-pretty text-body sm:text-xl">
            Describe the job in a sentence. QuotePilot builds the quote from
            your own prices, sends it, and lets the customer accept it on their
            phone while you&apos;re still parked outside.
          </p>

          <div className="mt-8">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/login">Start free — no card</Link>
            </Button>
          </div>

          <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-ink-60">
            <TrustPoint>Free to start</TrustPoint>
            <TrustPoint>No app for your customer</TrustPoint>
            <TrustPoint>Works on any phone</TrustPoint>
          </ul>
        </div>

        <QuoteCardPreview />
      </div>
    </section>
  );
}

function TrustPoint({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-1.5">
      <svg viewBox="0 0 16 16" className="size-3.5 text-brand" aria-hidden>
        <path
          d="M3 8.5l3.2 3.2L13 5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {children}
    </li>
  );
}
