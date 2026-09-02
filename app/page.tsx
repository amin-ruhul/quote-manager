import Link from "next/link";

import { Faq } from "@/components/landing/faq";
import { Features } from "@/components/landing/features";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { LandingNav } from "@/components/landing/landing-nav";
import { Pricing } from "@/components/landing/pricing";
import { FounderNote, Proof } from "@/components/landing/proof";
import { SectionHeading } from "@/components/landing/section-heading";
import { Wordmark } from "@/components/wordmark";
import { Button } from "@/components/ui/button";

/*
 * The landing page (SPEC §1, §17). Static, no client JavaScript beyond what
 * Next ships by default — most visitors arrive on a phone on site, so the page
 * has to be readable before the second tap.
 */
export default function HomePage() {
  return (
    <>
      <LandingNav />

      <main>
        <Hero />

        {/* Loss aversion: name the evening they already recognise. */}
        <section className="border-y border-hairline bg-surface-2">
          <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-24">
            <SectionHeading
              eyebrow="The problem"
              title="The job wasn't lost on price. It was lost on Tuesday."
              body="You quoted Thursday. They'd already said yes to the electrician who quoted from the driveway on Tuesday."
            />

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
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
            </div>
          </div>
        </section>

        <HowItWorks />
        <Features />

        {/* Outcome band — the promise, stated once, in the accent that means won. */}
        <section className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="rounded-lg bg-midnight px-6 py-12 text-white sm:px-10 sm:py-16">
            <p className="text-3xl font-semibold text-balance sm:text-4xl">
              Win the jobs you were losing to a slow quote.
            </p>
            <p className="mt-4 max-w-xl text-lg text-pretty text-white/70">
              Same work, same prices. The only thing that changes is how long
              your customer waits to say yes.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-8 w-full bg-white text-black hover:bg-white/90 sm:w-auto"
            >
              <Link href="/login">Start free — no card</Link>
            </Button>
          </div>
        </section>

        <Proof />
        <FounderNote />
        <Pricing />
        <Faq />

        {/* Final CTA. */}
        <section className="mx-auto max-w-3xl px-5 pt-4 pb-20 text-center sm:px-8 sm:pb-28">
          <h2 className="text-3xl font-semibold text-balance sm:text-4xl">
            Your next quote could go out before you start the van.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-lg text-pretty text-body">
            Set up your pricebook once. Quote in minutes after that.
          </p>
          <Button asChild size="lg" className="mt-8 w-full sm:w-auto">
            <Link href="/login">Start free — no card</Link>
          </Button>
          <p className="mt-4 text-sm text-ink-40">
            5 quotes a month, free forever. No card to start.
          </p>
        </section>
      </main>

      <footer className="border-t border-hairline">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-5 py-8 text-sm text-ink-60 sm:flex-row sm:items-center sm:px-8">
          <Wordmark />
          <p className="sm:ml-auto">
            Quoting software for residential electricians.
          </p>
          <Link href="/login" className="font-medium text-brand sm:ml-4">
            Start free
          </Link>
        </div>
      </footer>
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
    <div
      className={
        isLast
          ? "rounded-lg bg-coral p-5"
          : "rounded-lg border border-hairline bg-surface p-5"
      }
    >
      <p
        className={`text-xs font-medium tracking-[0.08em] uppercase ${
          isLast ? "text-ink-90" : "text-ink-40"
        }`}
      >
        {when}
      </p>
      <p className={`mt-2 text-sm ${isLast ? "text-ink-90" : "text-ink-60"}`}>
        {text}
      </p>
    </div>
  );
}
