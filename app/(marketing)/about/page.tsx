import type { Metadata } from "next";

import { PageShell, Prose } from "@/components/landing/page-shell";
import { FOUNDER_NAME, SUPPORT_EMAIL } from "@/lib/constants";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About QuotePace",
  description:
    "Why QuotePace exists: free quoting software for residential electricians, so the quote goes out from the driveway.",
  path: "/about",
});

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
      standfirst="QuotePace is quoting software for residential electricians. It does one job: getting a quote to your customer the same day."
    >
      <Prose>
        <h2>The problem we picked</h2>
        <p>
          A lot of jobs are lost in the days between the visit and the quote.
          The customer usually asked two or three electricians. If one of them
          sends a price that afternoon and yours shows up Thursday night, they
          may have already said yes to the first one. Being cheaper doesn&apos;t
          help much if you&apos;re late.
        </p>
        <p>
          Most of the tools we looked at treat quoting as one small part of a
          job management suite with scheduling, invoicing, timesheets and
          inventory. That&apos;s useful stuff, but none of it gets the quote out
          any faster.
        </p>

        <h2>What we decided not to build</h2>
        <p>
          We left out scheduling, inventory and timesheets, and your customer
          doesn&apos;t need to download anything. Plenty of good software
          already does those jobs, and adding them here would only make sending
          a quote slower.
        </p>

        <h2>How we handle prices</h2>
        <p>
          Your pricebook is the only source of prices. Build a quote by hand and
          it uses what you set; ask the AI to draft one and it matches what you
          actually charge. If it can&apos;t match a line, it leaves the price
          blank and flags it for you. It won&apos;t make up a number. You review
          every quote before it goes anywhere, because a wrong price costs you
          more than the minutes the tool saved.
        </p>

        <h2>Why it&apos;s free</h2>
        <p>
          Quoting costs very little to run, and a tool you have to justify
          paying for is a tool you don&apos;t use. Core quoting stays free. AI
          drafting is a paid extra.
        </p>
        <p>
          If QuotePace wins you a job, I&apos;d like to hear about it: {SUPPORT_EMAIL}.
        </p>
        <p>{FOUNDER_NAME}, founder</p>
      </Prose>
    </PageShell>
  );
}
