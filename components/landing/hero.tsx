import Link from "next/link";
import { BellRing, FileText, MessageSquareText, Zap } from "lucide-react";

import { QuoteCardPreview } from "@/components/landing/quote-card-preview";
import { Reveal, RevealGroup, RevealItem } from "@/components/landing/reveal";
import { Button } from "@/components/ui/button";

/**
 * The thesis, centered: an outcome an electrician recognises as their own
 * Tuesday, with the screen that produces it directly underneath.
 *
 * One filled blue button, the marigold highlight pill on a single verb
 * (DESIGN.md's signature typographic move), and the trust line that answers the
 * three objections before they're asked.
 */

/**
 * The tiles that float around the headline on a wide screen. Each one is a
 * stage of the job, so the ring reads as the workflow even before the steps
 * section names it. Hidden below `lg`, where there is no margin to float into.
 */
const FLOATING = [
  {
    icon: MessageSquareText,
    label: "Describe the job",
    tone: "bg-brand-wash text-brand",
    position: "top-4 -left-24 -rotate-6",
  },
  {
    icon: FileText,
    label: "Priced quote",
    tone: "bg-marigold/25 text-saffron",
    position: "top-24 -right-24 rotate-6",
  },
  {
    icon: BellRing,
    label: "Opened",
    tone: "bg-status-viewed-bg text-status-viewed",
    position: "bottom-16 -left-16 rotate-6",
  },
  {
    icon: Zap,
    label: "Accepted",
    tone: "bg-status-accepted-bg text-status-accepted",
    position: "bottom-6 -right-16 -rotate-6",
  },
];

export function Hero() {
  return (
    <section className="mx-auto max-w-5xl px-5 pt-16 pb-14 sm:px-8 sm:pt-24 sm:pb-20">
      <RevealGroup onMount className="relative mx-auto max-w-3xl text-center">
        {FLOATING.map((tile) => (
          <FloatingTile key={tile.label} {...tile} />
        ))}

        <RevealItem>
          <p className="inline-flex rounded-pill bg-brand-wash px-3 py-1.5 text-sm font-medium text-brand">
            For residential electricians
          </p>
        </RevealItem>

        <RevealItem>
          <h1 className="mt-6 text-4xl leading-[1.05] font-semibold text-balance sm:text-5xl lg:text-6xl">
            Send the quote before you
            <span className="mx-1.5 inline-block rounded-md bg-marigold px-2 py-0.5">
              leave
            </span>
            the driveway.
          </h1>
        </RevealItem>

        <RevealItem>
          <p className="mx-auto mt-6 max-w-xl text-lg text-pretty text-body sm:text-xl">
            Describe the job in a sentence. QuotePilot builds the quote from
            your own prices, sends it, and lets the customer accept it on their
            phone while you&apos;re still parked outside.
          </p>
        </RevealItem>

        <RevealItem>
          <div className="mt-8">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/login">Start free — no card</Link>
            </Button>
          </div>
        </RevealItem>

        <RevealItem>
          <ul className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-1.5 text-sm text-ink-60">
            <TrustPoint>Free to start</TrustPoint>
            <TrustPoint>No app for your customer</TrustPoint>
            <TrustPoint>Works on any phone</TrustPoint>
          </ul>
        </RevealItem>
      </RevealGroup>

      {/* The money shot sits under the promise rather than beside it, so the
          headline gets the full column width and the card gets a stage. */}
      <Reveal
        onMount
        delay={0.45}
        className="mx-auto mt-14 max-w-md sm:mt-16 lg:max-w-lg"
      >
        <QuoteCardPreview />
      </Reveal>
    </section>
  );
}

function FloatingTile({
  icon: Icon,
  label,
  tone,
  position,
}: (typeof FLOATING)[number]) {
  return (
    <RevealItem
      className={`absolute z-10 hidden lg:block ${position}`}
      aria-hidden
    >
      {/* Marketing furniture, not a content card — it takes the sanctioned
          floating-mockup shadow so it reads as lifted off the paper. */}
      <div className="rounded-lg border border-hairline bg-surface p-3 shadow-quote">
        <span
          className={`flex size-9 items-center justify-center rounded-md ${tone}`}
        >
          <Icon className="size-4.5" strokeWidth={2} />
        </span>
        <p className="mt-2 text-[0.7rem] font-medium whitespace-nowrap text-ink-60">
          {label}
        </p>
      </div>
    </RevealItem>
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
