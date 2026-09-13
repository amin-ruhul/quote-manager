import type { Metadata } from "next";

import { DraftNotice, PageShell, Prose } from "@/components/landing/page-shell";
import { BILLING_ENABLED } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy — QuotePilot",
  description:
    "What QuotePilot stores, who processes it, and what we do not do with your pricebook.",
  // Not indexable until it is a real, reviewed policy.
  robots: { index: false, follow: true },
};

/*
 * ⚠️ THIS IS NOT A PRIVACY POLICY. It is an accurate plain-English description
 * of what the app does with data, written from the code, so the footer link
 * resolves to something honest instead of a 404 or invented legalese.
 *
 * Before launch: have a real policy drafted or reviewed by someone qualified,
 * replace everything below, remove the `robots` block above, and delete the
 * DraftNotice. Publishing this as a policy would be a liability, not a shortcut.
 */
export default function PrivacyPage() {
  return (
    <PageShell
      eyebrow="Privacy"
      title="What we store, and who touches it."
      standfirst="Written in plain English so you can see what actually happens to your data."
    >
      <DraftNotice>
        This page is a factual summary, not our privacy policy. The binding
        policy has not been published yet. If you need the legal document before
        signing up, email us and we will tell you where it stands.
      </DraftNotice>

      <Prose>
        <h2>What QuotePilot stores</h2>
        <p>
          Your account and business details, your pricebook, the quotes you
          create, the customers you address them to, and a log of what happened
          to each quote — sent, viewed, accepted, declined, follow-up sent. That
          event log is what powers your acceptance rate; it records the quote
          and the timestamp, not the person browsing.
        </p>

        <h2>Who else processes it</h2>
        <p>
          Supabase hosts the database and handles sign-in. Resend delivers quote
          and notification emails. OpenAI receives the job description you type
          when you ask it to draft a quote.{" "}
          {BILLING_ENABLED
            ? "Paddle handles payment — card details go to Paddle and are never stored by us or seen by us."
            : "There is no payment processor: QuotePilot is free while we are in beta, so we never ask for or handle card details."}{" "}
          Vercel serves the app.
        </p>

        <h2>Your pricebook</h2>
        <p>
          Your prices are yours. They are scoped to your business at the
          database level, they are not pooled with other businesses, and they
          are not used to set anyone else&apos;s prices.
        </p>

        <h2>What your customer sees</h2>
        <p>
          A quote link opens a page showing only that quote: your business
          details, the line items, and the total. It does not expose your
          pricebook, your other customers, or your other quotes.
        </p>

        <h2>Leaving</h2>
        <p>
          Cancel any time. Your quotes and pricebook remain yours, and existing
          quote links keep working for the customers who already have them.
        </p>
      </Prose>
    </PageShell>
  );
}
