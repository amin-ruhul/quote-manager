import type { Metadata } from "next";
import Link from "next/link";

import { PostFrame } from "@/components/blog/post-frame";
import { getPost } from "@/lib/blog";
import { pageMetadata } from "@/lib/seo";

const post = getPost("free-electrical-estimate-software")!;

export const metadata: Metadata = pageMetadata({
  title: `${post.title} — QuotePace`,
  description: post.description,
  path: `/blog/${post.slug}`,
  type: "article",
  publishedTime: post.publishedAt,
});

const link = "text-brand hover:underline";

export default function Post() {
  return (
    <PostFrame
      post={post}
      lede="Free electrical estimate software is a crowded search, and most of the results are a trial with a countdown. This is the contractor's sort: what is actually free, what becomes a bill, and which one belongs in the van."
      answer="A spreadsheet or a one-page template is free and forgets the job. A field-service app is usually a 14-day trial, then a subscription. QuotePace is free for the quote itself: your prices, a link, they accept on their phone. It is not a scheduler, and it is not unlimited: a free account can send 100 quotes a month."
      faq={[
        {
          question: "Is there electrical estimate software that stays free?",
          answer:
            "Yes, with limits. A spreadsheet stays free. The QuotePace free quote template stays free and does not require an account. QuotePace itself is free to quote from, with a cap of 100 quotes a month on the free plan, and AI drafting is a paid extra.",
        },
        {
          question: "Is a free trial the same as free software?",
          answer:
            "No. Jobber, Housecall Pro, and Joist each publish a 14-day trial. Joist says its free plan is no longer available. When the trial ends you pay, or you stop. Your prices and customers are inside their account by then.",
        },
        {
          question: "Will any of these tell me what to charge?",
          answer:
            "No. Software stores the prices you type. A national average on a homeowner site is not your price. If a tool invents a number you did not enter, do not send it.",
        },
        {
          question: "What should a one-person shop start with?",
          answer:
            "Start with a pricebook and a quote you can send from the driveway. Add scheduling and payments when those are the thing slowing you down, not because a pricing page bundled them.",
        },
      ]}
    >
      <h2>Three different things called free</h2>
      <p>
        People search for free electrical estimate software when they are tired
        of writing the same quote in a notes app. The results mix three
        products that are not substitutes.
      </p>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <strong>Free, and it stays that way.</strong> A spreadsheet, a PDF
          you fill in, or a page that prints a quote and forgets it. You pay
          with time.
        </li>
        <li>
          <strong>Free for two weeks.</strong> Full access, no card, then a
          plan. Jobber and Housecall Pro publish this. Joist does too, and
          says the old free plan is gone.
        </li>
        <li>
          <strong>Free to quote, paid for the extras.</strong> The document
          and the accept link do not have a monthly price. Something else on
          the same site might. Read the line that says what is not included.
        </li>
      </ul>
      <p>
        Prices below are what those companies printed on their own pricing
        pages when this was written, in October 2026. Open the page before you
        buy. A blog cannot keep a vendor&apos;s price honest for you.
      </p>

      <h2>What each option is actually for</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-black/8">
              <th className="py-2 pr-3 font-medium text-ink-60">Option</th>
              <th className="py-2 pr-3 font-medium text-ink-60">You pay</th>
              <th className="py-2 font-medium text-ink-60">The catch</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-black/8">
              <td className="py-2 pr-3">Spreadsheet, or the free template</td>
              <td className="py-2 pr-3">Nothing</td>
              <td className="py-2">
                No accept link. Nobody tells you they opened it.
              </td>
            </tr>
            <tr className="border-b border-black/8">
              <td className="py-2 pr-3">QuotePace</td>
              <td className="py-2 pr-3">Nothing to quote</td>
              <td className="py-2">
                100 quotes a month on the free plan. AI is a paid extra.
              </td>
            </tr>
            <tr className="border-b border-black/8">
              <td className="py-2 pr-3">Joist</td>
              <td className="py-2 pr-3">Trial, then a plan</td>
              <td className="py-2">Their page says the free plan ended.</td>
            </tr>
            <tr className="border-b border-black/8">
              <td className="py-2 pr-3">Jobber</td>
              <td className="py-2 pr-3">
                14 days, then Core from $29/mo
              </td>
              <td className="py-2">
                That $29 is annual billing, one user, on their page.
              </td>
            </tr>
            <tr>
              <td className="py-2 pr-3">Housecall Pro</td>
              <td className="py-2 pr-3">14 days, then Basic at $59/mo</td>
              <td className="py-2">$59 is billed annually, on their page.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>The spreadsheet, and a template that prints</h2>
      <p>
        A spreadsheet is honest. The formulas are yours, the file is yours,
        and it costs nothing. It is a bad place to be when you are standing in
        a driveway with one hand on a panel cover. You rebuild the header,
        you forget the tax, and the customer gets a photo of a screen.
      </p>
      <p>
        The{" "}
        <Link href="/free-electrical-quote-template" className={link}>
          free electrical quote template
        </Link>{" "}
        is the same idea with the quote already laid out. Business name,
        customer, lines, tax, notes, and a print-to-PDF. No account. It does
        not save the quote, and it does not tell you when they open it. Use it
        when you need a page today and you are not ready to keep a pricebook.
      </p>

      <h2>QuotePace, said the way the product works</h2>
      <p>
        QuotePace is quoting software for residential electricians. You price
        the job from your own prices, on your phone. The customer gets a link,
        accepts and signs on their phone, and you see that they opened it and
        accepted it. Good/better/best options and job photos are part of that
        quote. There is no card to start.
      </p>
      <p>
        The limits are real, so here they are. The terms allow 100 quotes a
        month on the free plan. That is a lot for a one-person shop and it is
        not the word &ldquo;unlimited.&rdquo; AI drafting is a paid extra, and
        it only matches lines to prices you already entered. Sending email for
        you, automatic follow-up, and downloading a PDF from inside the app
        are switched on for businesses who ask. The public template can still
        print a PDF with no account.
      </p>
      <p>
        It will not schedule your week or take the card payment. If that is
        the hole in the business, this is the wrong tool, and a trial of a
        bigger suite is the honest next look.
      </p>

      <h2>The trials that become a subscription</h2>
      <p>
        <a href="https://www.joist.com/pricing/" className={link}>
          Joist&apos;s pricing page
        </a>{" "}
        says the free plan is no longer available. What they offer is a 14-day
        trial, then a paid plan. Estimates are the product, which is closer to
        this search than a full office suite. Confirm the current Basics price
        on their page. It was presented in more than one figure when this was
        written, so it is not repeated here.
      </p>
      <p>
        <a href="https://www.getjobber.com/pricing/" className={link}>
          Jobber
        </a>{" "}
        publishes a 14-day trial of the Grow plan, no card. After that, the
        Core plan is listed as starting at $29 a month on annual billing, for
        one user, and it includes sending quotes. Core is a business system:
        schedule, invoices, a website, reporting. You are paying for the week,
        not for one quote. Extra users are a separate line on that page.
      </p>
      <p>
        <a href="https://www.housecallpro.com/pricing/" className={link}>
          Housecall Pro
        </a>{" "}
        publishes a 14-day trial and a Basic plan at $59 a month, billed
        annually. Basic includes quotes, scheduling, invoices, and review
        tools. Same shape as Jobber: useful when the van is one part of a
        dispatch problem, expensive if all you needed was the quote.
      </p>
      <p>
        None of these three is free electrical estimate software after the
        trial. Calling the trial &ldquo;free software&rdquo; is how shops end
        up with a card on file and a pricebook they now have to export.
      </p>

      <h2>How to choose without a spreadsheet of features</h2>
      <p>
        If you send a handful of quotes a month and you lose them in text
        threads, start with a template or with QuotePace. You want the
        customer to accept a defined scope, and you want to know they saw it.
        You do not yet need a dispatcher.
      </p>
      <p>
        If the pain is the route, the invoice, and who is on which job, trial
        Jobber or Housecall Pro on a real week, not on a demo job. Cancel
        before the trial ends if the quote was the only screen you opened.
      </p>
      <p>
        If you already have a system and you only hate the estimating, do not
        add a second one to get a free month. Fix the pricebook inside the
        tool you already pay for. A second login is how prices drift.
      </p>
      <p>
        Whichever you pick, the number on the quote is still yours. Software
        does not know what the last panel took. For the order of operations
        once you are in front of the house, see{" "}
        <Link href="/blog/how-to-write-an-electrical-quote-on-your-phone" className={link}>
          how to write an electrical quote on your phone
        </Link>{" "}
        and{" "}
        <Link href="/blog/how-to-build-an-electrical-pricebook" className={link}>
          how to build an electrical pricebook
        </Link>
        .
      </p>

      <h2>What to check before you type a card</h2>
      <p>
        A pricing page is a sales page. Read it like a scope. The questions
        that matter are boring, and they are the ones the headline skips.
      </p>
      <ul className="list-disc space-y-2 pl-5">
        <li>When does the trial end, and do they want a card today or on day 14?</li>
        <li>Is the price monthly, or an annual contract that is advertised as a month?</li>
        <li>What happens to the quotes and the customer list if you leave?</li>
        <li>Is the quote limit per user, per month, or &ldquo;unlimited&rdquo; until you read the fair-use line?</li>
        <li>Does &ldquo;quotes&rdquo; include the thing you actually need, which is a customer accepting on their phone, or only a PDF you still have to chase?</li>
        <li>Is there a second product, payments or a website, that you will be nudged into before you have sent ten quotes?</li>
      </ul>
      <p>
        Write the answers down. If you cannot find them on the page, that is
        an answer. Ask in their chat and keep the reply. A tool you cannot
        explain in one sentence to yourself is a tool you will resent in
        March, when the renewal hits and the busy season has not.
      </p>
      <p>
        Then try it on a real job, not a sample called &ldquo;Test
        Customer.&rdquo; One kitchen, one panel, one charger. If you did not
        send the quote from the driveway, the tool did not pass, however long
        the feature list is. The sequence for that test is the same one you
        would use on paper. If the software sends you back to a laptop at
        9 p.m., it is not saving you the time you need.
      </p>
      <p>
        Keep the pricebook in a form you can leave with. A list trapped in a
        trial is a list you will rebuild. That rebuild is more expensive than
        the subscription, and it is the part nobody puts on the pricing page.
      </p>

      <h2>Sources</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <a href="https://www.getjobber.com/pricing/" className={link}>
            Jobber pricing
          </a>
          , including the 14-day trial and the Core plan&apos;s published
          starting price.
        </li>
        <li>
          <a href="https://www.housecallpro.com/pricing/" className={link}>
            Housecall Pro pricing
          </a>
          , including the 14-day trial and Basic at $59 a month billed
          annually.
        </li>
        <li>
          <a href="https://www.joist.com/pricing/" className={link}>
            Joist pricing
          </a>
          , including the note that the free plan is no longer available.
        </li>
      </ul>
    </PostFrame>
  );
}
