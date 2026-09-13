import type { Metadata } from "next";

import { PageShell, Prose } from "@/components/landing/page-shell";

export const metadata: Metadata = {
  title: "About QuotePace",
  description:
    "Why QuotePace exists: quoting software built for residential electricians, not for general contractors or office admin teams.",
};

/*
 * TODO before launch: this is written in the product's voice and is true of the
 * product, but the founder paragraph is a placeholder. Replace it with your own
 * words and your real name — the same TODO as `FounderNote` on the home page.
 */
export default function AboutPage() {
  return (
    <PageShell
      eyebrow="About us"
      title="Built for the quote you never get around to writing."
      standfirst="QuotePace is quoting software for residential electricians. That is the whole scope, on purpose."
    >
      <Prose>
        <h2>The problem we picked</h2>
        <p>
          Most jobs are not lost on price. They are lost on the three days
          between the visit and the quote landing in someone&apos;s inbox. The
          electrician who quotes from the driveway wins work from the
          electrician who quotes at 10pm on Thursday — not because they are
          cheaper, but because they were first and the customer had stopped
          waiting.
        </p>
        <p>
          Every tool we looked at treated quoting as one feature inside a job
          management suite: scheduling, invoicing, timesheets, inventory. All
          useful, none of it the thing standing between you and a yes.
        </p>

        <h2>What we decided not to build</h2>
        <p>
          No scheduling. No inventory. No timesheets. No app for your customer
          to download. Adding those would make QuotePace a worse version of
          software that already exists, and a slower way to send a quote.
        </p>

        <h2>How we handle prices</h2>
        <p>
          Your pricebook is the only source of prices. Build a quote by hand and
          it uses what you set; ask the AI to draft one and it matches what you
          actually charge — and when it cannot match a line, it leaves the price
          blank and flags it rather than inventing a number. You review every
          quote before it goes anywhere. A tool that guesses at your margins is
          not saving you time, it is costing you money quietly.
        </p>

        <h2>Where we are</h2>
        <p>
          Early, and in beta. Quoting is free — we have not set a price, and we
          would rather find out what this is worth to you than guess. The
          handful of features that cost us money every time they run, AI
          drafting among them, are switched on by hand for businesses who ask,
          which is also how we learn which of them anyone actually wants.
        </p>
        <p>
          There are no customer logos on this site because we have not earned
          them yet, and we would rather say so than borrow someone else&apos;s.
          If QuotePace wins you a job, we would genuinely like to hear about it.
        </p>
      </Prose>
    </PageShell>
  );
}
