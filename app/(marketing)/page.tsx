import type { Metadata } from "next";
import Link from "next/link";

import { Faq, QUESTIONS } from "@/components/landing/faq";
import { Features } from "@/components/landing/features";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Marquee } from "@/components/landing/marquee";
import { Pricing } from "@/components/landing/pricing";
import { PromiseBand } from "@/components/landing/promise";
import { FounderNote, Proof } from "@/components/landing/proof";
import { Reveal, RevealGroup, RevealItem } from "@/components/landing/reveal";
import { SectionHeading } from "@/components/landing/section-heading";
import { MarketingStructuredData } from "@/components/landing/structured-data";
import { Button } from "@/components/ui/button";

/*
 * The title leads with the category, not the slogan.
 *
 * "Send the quote before you leave the driveway" is the better line and it is
 * still the h1 — but nobody searches for it. A search result has about sixty
 * characters to answer "is this the thing I typed", and the thing they typed is
 * some arrangement of quoting, software and electrician. The slogan does its
 * work on the page, once they are here.
 *
 * The canonical is explicit because the site answers on both the apex and www;
 * without it, the two hosts compete as separate pages for the same content.
 */
export const metadata: Metadata = {
  title: "Quoting software for residential electricians — QuotePace",
  description:
    "Build a quote from your own prices in minutes on your phone, send the link, and let the customer accept it on theirs. Sent, opened and accepted, all tracked.",
  alternates: { canonical: "/" },
};

/*
 * The landing page (SPEC §1, §17). Rendered on the server; the only client
 * JavaScript is the scroll-reveal wrapper in `reveal.tsx`. Most visitors arrive
 * on a phone on site, so every section is readable the moment it paints —
 * reveals animate content that is already in the HTML, never gate it.
 */
export default function HomePage() {
  return (
    <>
      {/* The same questions the page renders, marked up for search and for
          assistants deciding whether this answers what was asked. */}
      <MarketingStructuredData faq={QUESTIONS} />

      <main>
        <Hero />
        <Marquee />

        {/* Loss aversion: name the evening they already recognise. */}
        <section className="border-y border-hairline bg-surface-2">
          <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-24">
            <Reveal>
              <SectionHeading
                eyebrow="The problem"
                title="The job wasn't lost on price. It was lost on Tuesday."
                body="You quoted Thursday. They'd already said yes to the electrician who quoted from the driveway on Tuesday."
                align="center"
              />
            </Reveal>

            <RevealGroup className="mt-10 grid gap-4 sm:grid-cols-3">
              <Pain
                when="Tuesday, 4pm"
                text="You measure up, promise a price “tonight”, and drive to the next job."
              />
              <Pain
                when="Tuesday, 10pm"
                text="You're in Word, retyping the same panel swap you've quoted forty times, guessing at last year's price."
              />
              <Pain
                when="Thursday"
                text="You send it. They've booked someone else. You never find out why."
                isLast
              />
            </RevealGroup>
          </div>
        </section>

        <HowItWorks />
        <Features />

        {/* The promise and the honest state of our proof, as one dark island. */}
        <PromiseBand />

        {/* Renders nothing until there are real testimonials, so it owns its
            own Reveal rather than leaving an empty wrapper here. */}
        <Proof />

        <Reveal>
          <FounderNote />
        </Reveal>
        <Reveal>
          <Pricing />
        </Reveal>
        <Reveal>
          <Faq />
        </Reveal>

        {/* Final CTA. */}
        <section className="mx-auto max-w-3xl px-5 pt-4 pb-20 text-center sm:px-8 sm:pb-28">
          <Reveal>
            <h2 className="text-3xl font-semibold text-balance sm:text-4xl">
              Your next quote could go out before you start the van.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-lg text-pretty text-body">
              Set up your pricebook once. Quote in minutes after that.
            </p>
            <Button asChild size="lg" className="mt-8 w-full sm:w-auto">
              <Link href="/register">Start free — no card</Link>
            </Button>
            {/* Not "free forever" — we intend to charge one day, and a
                promise we plan to break is worse than no promise. No quote
                count either: the cap in lib/quota.ts is real, so this must
                never read as unlimited, but naming it here turns the last
                line before the button into a limit. */}
            <p className="mt-4 text-sm text-ink-60">
              Free while we&apos;re in beta. No card, no trial countdown.
            </p>
          </Reveal>
        </section>
      </main>
    </>
  );
}

function Pain({
  when,
  text,
  isLast = false,
}: {
  when: string;
  text: string;
  isLast?: boolean;
}) {
  return (
    <RevealItem
      className={
        isLast
          ? "rounded-lg bg-coral p-5"
          : "rounded-lg border border-hairline bg-surface p-5"
      }
    >
      <p
        className={`text-xs font-medium tracking-[0.08em] uppercase ${
          isLast ? "text-ink-90" : "text-ink-60"
        }`}
      >
        {when}
      </p>
      <p className={`mt-2 text-sm ${isLast ? "text-ink-90" : "text-ink-60"}`}>
        {text}
      </p>
    </RevealItem>
  );
}
