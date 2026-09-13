import type { Metadata } from "next";
import Link from "next/link";

import { PageShell, Prose } from "@/components/landing/page-shell";
import {
  BILLING_ENABLED,
  FREE_QUOTES_PER_MONTH,
  SUPPORT_EMAIL,
} from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms of use — QuotePace",
  description:
    "The terms you agree to by using QuotePace: what the service does, what it costs, what you are responsible for, and what we are.",
};

/*
 * The operative terms for the beta, written from what the product actually
 * does. Deliberately plain: QuotePace takes no payment, stores no card, and
 * signs nothing on anyone's behalf, so contract language borrowed from a
 * company that does all three would describe a service this isn't.
 *
 * When billing lands, three sections need real text before a single charge:
 * payment, refunds, and cancellation. `BILLING_ENABLED` already branches them.
 */
export default function TermsPage() {
  return (
    <PageShell
      eyebrow="Terms of use"
      title="How this works between us."
      standfirst=""
    >
      <Prose>
        <p className="text-sm text-ink-60">
          Last updated 13 September 2026. By creating an account you agree to
          what is on this page.
        </p>

        <h2>What QuotePace is</h2>
        <p>
          QuotePace is software for building, sending and tracking quotes. You
          build a pricebook, you make a quote from it, we host a link your
          customer can open and accept, and we record what happened to it. That
          is the whole service.
        </p>
        <p>
          We are not a party to the work you quote for. QuotePace is not a
          contractor, an accountant, a lawyer or a tax adviser, and nothing the
          software produces is professional advice.
        </p>

        <h2>Your account</h2>
        <p>
          You need an email address and a password. Keep them to yourself —
          anything done from your account is treated as done by you. One account
          is for one business; if you run two businesses, use two accounts.
        </p>
        <p>
          You must be old enough to enter a contract where you live, and the
          business details you put on a quote must be ones you are entitled to
          use.
        </p>

        <h2>What it costs</h2>
        {BILLING_ENABLED ? (
          <p>
            The free plan allows {FREE_QUOTES_PER_MONTH} quotes a month and
            carries a &ldquo;Made with QuotePace&rdquo; line on the quotes you
            send. Paid plans lift the limit and remove the badge. Prices are
            shown on the home page.
          </p>
        ) : (
          <p>
            Nothing, right now. QuotePace is in beta: {FREE_QUOTES_PER_MONTH}{" "}
            quotes a month, no card, nothing to buy. Some features cost us money
            every time they run — AI drafting, sending email on your behalf,
            automatic follow-up, PDF download — so we switch those on by hand
            for businesses who ask.
          </p>
        )}
        <p>
          We intend to charge for QuotePace one day. If that happens you will
          be told before it applies to you, and using the free plan now does not
          commit you to paying later. We will not take money from you without
          you choosing to give it.
        </p>

        <h2>Hitting the monthly limit</h2>
        <p>
          Nothing breaks. Quotes you have already sent stay live, your customers
          can still open and accept them, and your pricebook is untouched. You
          simply cannot start a new quote until the month rolls over
          {BILLING_ENABLED ? " or you upgrade" : " or we raise your limit"}.
        </p>

        <h2>The quotes you send are yours</h2>
        <p>
          You are the one quoting. QuotePace drafts and delivers; you review
          every quote before it goes out, and every price comes from the
          pricebook you built. What you commit to a customer — the price, the
          scope, the warranty, the licence you hold — is between you and them.
          We are not responsible for a job quoted wrong, underpriced, or
          performed badly.
        </p>

        <h2>What the AI does and does not do</h2>
        <p>
          It matches your description to items in your pricebook. It cannot
          invent a price: a line it could not match comes back blank and flagged
          for you to fill in. It can still match the wrong item or miss
          something, which is why nothing is sent until you have read it. Treat
          an AI draft as a first pass by an apprentice, not as a quote.
        </p>

        <h2>Acceptances and signatures</h2>
        <p>
          When a customer accepts a quote we record that it happened, when, and
          the name they typed. That record is evidence of what passed between
          you, not a legal contract drafted by us, and it does not replace
          whatever paperwork your trade or your jurisdiction requires.
        </p>

        <h2>What you must not do</h2>
        <p>
          Do not use QuotePace to send anything you were not asked for, to
          quote for work you are not licensed to do, to impersonate another
          business, or to break the law where you or your customer are. Do not
          try to reach other businesses&apos; data, hammer the service
          automatically, or resell it as your own. We can suspend an account
          doing any of that.
        </p>

        <h2>What we promise, and what we don&apos;t</h2>
        <p>
          We work hard to keep QuotePace up, fast and correct. We cannot
          promise it will never be down, never lose a keystroke, or never have a
          bug. It is provided as it is. To the extent the law allows, we are not
          liable for work you lose, a quote that did not arrive, or a number
          that came out wrong — which is also why every quote passes your eyes
          before it goes anywhere.
        </p>
        <p>
          During the beta, expect things to change. Features can move, improve
          or be withdrawn, and we will tell you in the app when something you
          rely on changes.
        </p>

        <h2>Leaving</h2>
        <p>
          You can stop using QuotePace whenever you like, and you can ask us to
          delete your account by emailing{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. Deleting an
          account removes your pricebook, your quotes and the links your
          customers hold, so export or save anything you still need first.
        </p>
        <p>
          We can close an account that is being used for the things listed
          above, or if we shut the service down — in which case we will give you
          notice and a chance to get your data out.
        </p>

        <h2>Changes to these terms</h2>
        <p>
          If we change anything here that matters, we will update the date at
          the top and tell you in the app. Carrying on using QuotePace after
          that means the new version applies.
        </p>

        <h2>Getting hold of us</h2>
        <p>
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>, or the{" "}
          <Link href="/contact">contact page</Link>. A person reads it.
        </p>
      </Prose>
    </PageShell>
  );
}
