import type { Metadata } from "next";
import Link from "next/link";

import { PageShell, Prose } from "@/components/landing/page-shell";
import { SUPPORT_EMAIL } from "@/lib/constants";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact QuotePace",
  description:
    "Email QuotePace. Support and feedback from electricians, read by a person who can change the product.",
  path: "/contact",
});

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
          Send them. QuotePace does a small number of things on purpose, so we
          say no to a lot of requests. The ones that come from a real job you
          were quoting are the ones most likely to change our minds.
        </p>

        <h2>Your data</h2>
        <p>
          Want a copy of what we hold, a correction, or your account deleted?
          Email from the address on your account and we will do it. The{" "}
          <Link
            href="/privacy"
            className="font-medium text-brand hover:underline"
          >
            privacy page
          </Link>{" "}
          lists what we store.
        </p>

        <h2>Before you email</h2>
        <p>
          The{" "}
          <Link href="/#faq" className="font-medium text-brand hover:underline">
            FAQ
          </Link>{" "}
          answers the questions we get most: whether your customer needs an app,
          and what happens when the AI cannot price a line.
        </p>
      </Prose>
    </PageShell>
  );
}
