import type { Metadata } from "next";
import Link from "next/link";

import { PageShell, Prose } from "@/components/landing/page-shell";
import { BILLING_ENABLED, SUPPORT_EMAIL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact QuotePace",
  description:
    "Get in touch with QuotePace — support, access requests, and feedback from electricians using the product.",
};

export default function ContactPage() {
  return (
    <PageShell
      eyebrow="Contact"
      title="Talk to a person."
      standfirst="No ticket portal, no chatbot. Email lands with someone who can actually change the product."
    >
      <div className="rounded-lg border border-hairline bg-surface p-6 sm:p-8">
        <h2 className="font-semibold">Email us</h2>
        <p className="mt-2 text-sm text-ink-60">
          The fastest way to reach us, for anything at all.
        </p>
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="mt-4 inline-block text-lg font-medium text-brand hover:underline"
        >
          {SUPPORT_EMAIL}
        </a>
      </div>

      <Prose>
        <h2>What to include</h2>
        <p>
          If something is broken, the quote number and roughly when it happened
          is usually enough for us to find it in the logs. If a price came out
          wrong, telling us what you expected helps more than a screenshot.
        </p>

        <h2>Feature requests</h2>
        <p>
          Worth sending. QuotePace is deliberately narrow, so the honest answer
          to a lot of requests is no — but the ones that come from a real job
          you were quoting are the ones that change our minds.
        </p>

        <h2>Getting the invite-only features</h2>
        <p>
          {BILLING_ENABLED
            ? "Cancel any time from your account; your quotes and pricebook stay yours either way. If a charge looks wrong, email us and we will sort it out rather than pointing you at a policy."
            : "AI drafting, emailing quotes, automatic follow-up and PDF download are switched on by hand while we test them. The fastest way to ask is the button on Plan & usage inside the app — it tells us which feature you were reaching for. Emailing works too, and there is nothing to pay either way."}
        </p>

        <h2>Your data</h2>
        <p>
          Want a copy of what we hold, a correction, or your account deleted?
          Email from the address on your account and we will do it — see the{" "}
          <Link
            href="/privacy"
            className="font-medium text-brand hover:underline"
          >
            privacy page
          </Link>{" "}
          for what we store in the first place.
        </p>

        <h2>Before you email</h2>
        <p>
          The{" "}
          <Link href="/#faq" className="font-medium text-brand hover:underline">
            FAQ
          </Link>{" "}
          answers the questions we get most: whether your customer needs an app,
          what happens when the AI cannot price a line, and what changes when
          you reach the monthly limit.
        </p>
      </Prose>
    </PageShell>
  );
}
