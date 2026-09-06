import type { Metadata } from "next";

import { DraftNotice, PageShell, Prose } from "@/components/landing/page-shell";

export const metadata: Metadata = {
  title: "Terms — QuotePilot",
  description:
    "How QuotePilot works as a service: plans, limits, what we are responsible for, and what you are.",
  // Not indexable until these are real, reviewed terms.
  robots: { index: false, follow: true },
};

/*
 * ⚠️ THESE ARE NOT TERMS OF SERVICE. This is a plain-English description of how
 * the product works commercially, so the footer link resolves to something
 * honest instead of a 404 or invented contract language.
 *
 * Before launch: have real terms drafted or reviewed by someone qualified,
 * replace everything below, remove the `robots` block above, and delete the
 * DraftNotice. Generated contract text is not enforceable comfort.
 */
export default function TermsPage() {
  return (
    <PageShell
      eyebrow="Terms"
      title="How this works between us."
      standfirst="The commercial shape of the service, stated plainly."
    >
      <DraftNotice>
        This page describes how the product works. It is not our terms of
        service — the binding agreement has not been published yet. If you need
        it before signing up, email us and we will tell you where it stands.
      </DraftNotice>

      <Prose>
        <h2>Plans and limits</h2>
        <p>
          The free plan allows five quotes a month and carries a “Made with
          QuotePilot” line on the quotes you send. Paid plans lift the limit and
          the badge. Prices are shown on the home page in USD.
        </p>

        <h2>Hitting the free limit</h2>
        <p>
          Nothing breaks. Quotes you have already sent stay live and your
          customers can still accept them. You cannot create a new quote until
          the month rolls over or you upgrade.
        </p>

        <h2>The quotes you send are yours</h2>
        <p>
          You are the one quoting. QuotePilot drafts and delivers; you review
          every quote before it goes out, and the prices come from the pricebook
          you built. What you commit to a customer is between you and them.
        </p>

        <h2>What the AI does and does not do</h2>
        <p>
          It matches your description to items in your pricebook. It does not
          set a price it could not match — those lines come back blank and
          flagged for you. It can still get a match wrong, which is why nothing
          sends until you have looked at it.
        </p>

        <h2>Cancelling</h2>
        <p>
          Cancel any time. Your quotes and pricebook stay yours, and quote links
          already in your customers&apos; hands keep working.
        </p>
      </Prose>
    </PageShell>
  );
}
