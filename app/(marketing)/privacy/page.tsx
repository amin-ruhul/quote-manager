import type { Metadata } from "next";
import Link from "next/link";

import { PageShell, Prose } from "@/components/landing/page-shell";
import { BILLING_ENABLED, SUPPORT_EMAIL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy — QuotePace",
  description:
    "What QuotePace stores, who processes it, how long we keep it, and what we never do with your pricebook.",
};

/*
 * Written from the code, not from a template: every processor named here is one
 * this repo actually calls, and every claim about isolation is one RLS and the
 * business_id scoping in lib/auth.ts actually enforce. If a processor is added
 * or dropped, this page changes in the same commit — a privacy policy that has
 * drifted from the code is worse than none, because people rely on it.
 */
export default function PrivacyPage() {
  return (
    <PageShell
      eyebrow="Privacy"
      title="What we store, and who touches it."
      standfirst="Written in plain English so you can see exactly what happens to your data — yours and your customers'."
    >
      <Prose>
        <p className="text-sm text-ink-60">Last updated 13 September 2026.</p>

        <h2>The short version</h2>
        <p>
          We store what the product needs to work: your account, your business
          details, your pricebook, your quotes, the customers you address them
          to, and a log of what happened to each quote. We do not sell any of
          it, we do not use your prices to set anyone else&apos;s, and we do not
          advertise.
        </p>

        <h2>What we collect from you</h2>
        <p>
          <strong>Your account.</strong> Your name, email address and a password
          you choose. The password is hashed by our authentication provider — we
          never see it.
        </p>
        <p>
          <strong>Your business.</strong> Business name, contact details,
          address, logo, currency, tax rate and the terms you put on a quote.
          All of it appears on the quotes you send, which is why we hold it.
        </p>
        <p>
          <strong>Your pricebook and quotes.</strong> The items you sell, the
          prices you charge, the job descriptions you write, and any photos you
          attach.
        </p>
        <p>
          <strong>Your customers.</strong> Name, and whichever of phone, email
          and address you choose to record. You are giving us this about someone
          else, so the section below on your customers matters.
        </p>
        <p>
          <strong>What happened to each quote.</strong> Sent, opened, accepted,
          declined, follow-up sent, with timestamps. This is what powers your
          acceptance rate. It records the quote and the moment — not a profile
          of the person reading it.
        </p>

        <h2>What we collect automatically</h2>
        <p>
          A session cookie so you stay signed in — strictly necessary, and there
          are no advertising or analytics cookies on the app. Our hosting keeps
          ordinary server logs (IP address, browser, page requested) for
          security and debugging, and we write error logs when something breaks
          so we can fix it. We do not track you across other websites.
        </p>
        {BILLING_ENABLED ? null : (
          <p>
            We take no payments while QuotePace is in beta, so we never ask for
            or handle card details.
          </p>
        )}

        <h2>Who else processes it</h2>
        <p>These are the only companies your data passes through:</p>
        <ul>
          <li>
            <strong>Supabase</strong> — hosts the database and handles sign-in.
          </li>
          <li>
            <strong>Vercel</strong> — serves the app and the quote links.
          </li>
          <li>
            <strong>Resend</strong> — delivers email: a quote to your customer,
            a follow-up, or a notification to you.
          </li>
          <li>
            <strong>OpenAI</strong> — receives the job description you type, and
            the pricebook items it needs to match against, only when you ask it
            to draft a quote. It is not used to train their models. If you never
            use AI drafting, nothing of yours ever reaches them.
          </li>
          {BILLING_ENABLED ? (
            <li>
              <strong>Paddle</strong> — handles payment. Card details go to
              Paddle and are never stored or seen by us.
            </li>
          ) : null}
        </ul>
        <p>
          Each one only gets what it needs to do its job, and each is bound by
          its own terms not to do anything else with it.
        </p>

        <h2>Your pricebook is yours</h2>
        <p>
          Your prices are isolated to your business at the database level, not
          merely hidden in the interface. They are never pooled with other
          businesses, never used to suggest prices to anyone else, and never
          sold as market data.
        </p>

        <h2>What your customer sees</h2>
        <p>
          A quote link opens one page showing one quote: your business details,
          the lines, the total, and an Accept button. It exposes nothing else —
          not your pricebook, not your other customers, not your other quotes.
          The link contains a long random token, so it cannot be guessed, but
          treat it like any link: whoever holds it can open the quote.
        </p>
        <p>
          When your customer opens or accepts a quote we record that it
          happened, when, and the name they type when accepting. We do not place
          advertising or analytics trackers on that page.
        </p>

        <h2>Your customers&apos; details</h2>
        <p>
          When you add a customer you are sharing someone else&apos;s
          information with us. You are responsible for having a reason to hold
          it and for the accuracy of what you enter; we process it only to
          produce and deliver the quotes you address to them, and we never
          market to your customers. If one of them asks you to remove their
          details, you can delete them in the app, or email us and we will.
        </p>

        <h2>How long we keep it</h2>
        <p>
          Your account data stays until you delete it — a quote from two years
          ago is still your record of what you charged. Delete a quote or a
          customer and it goes; ask us to delete your account and all of it
          goes, including the links your customers hold. Deleted data can
          survive for a short while in our database host&apos;s backups before
          those roll off on their own schedule, and server logs are kept briefly
          for security.
        </p>

        <h2>Security</h2>
        <p>
          Everything travels over HTTPS. Access is scoped to your business in
          two independent layers — every query is filtered by your business, and
          the database itself enforces row-level security so one business cannot
          read another&apos;s rows even if the application asked it to. Nobody
          on our side reads your data as routine; we look at your account only
          when you ask us to fix something, or if we must to keep the service
          safe.
        </p>
        <p>
          No system is perfect. If something happens to your data that you ought
          to know about, we will tell you — quickly and in plain terms.
        </p>

        <h2>What you can ask for</h2>
        <p>
          A copy of what we hold, a correction, or deletion. Email{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> from the
          address on your account and we will sort it out — no form, no ticket
          number. If you are unhappy with how we handled it, tell us and we will
          try again properly.
        </p>

        <h2>Children</h2>
        <p>
          QuotePace is a tool for running a trade business. It is not for
          children and we do not knowingly collect anything from them.
        </p>

        <h2>Where your data lives</h2>
        <p>
          Our database and the services above run on infrastructure outside your
          country in all likelihood, and your data crosses borders to reach
          them. If you need to know the specific region your data sits in before
          you sign up, ask and we will tell you.
        </p>

        <h2>Changes</h2>
        <p>
          If we change what we collect or who processes it, we will update this
          page and the date at the top, and tell you in the app when the change
          matters.
        </p>

        <h2>Getting hold of us</h2>
        <p>
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>, or the{" "}
          <Link href="/contact">contact page</Link>.
        </p>
      </Prose>
    </PageShell>
  );
}
