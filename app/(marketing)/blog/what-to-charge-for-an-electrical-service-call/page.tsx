import type { Metadata } from "next";
import Link from "next/link";

import { PostFrame } from "@/components/blog/post-frame";
import { getPost } from "@/lib/blog";
import { pageMetadata } from "@/lib/seo";

const post = getPost("what-to-charge-for-an-electrical-service-call")!;

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
      lede="What to charge for an electrical service call depends on which of three things you mean. Showing up, finding the fault, and fixing it are different work. Folding them into one polite number is how the trip becomes free and the repair becomes an argument."
      answer="Price the trip, the diagnosis, and the repair as separate lines. Tell the customer, before you roll, which of those the first visit includes. Credit the trip toward the repair only if you wrote that down. There is no national service-call price worth copying."
      faq={[
        {
          question: "Should I waive the trip fee if they hire me?",
          answer:
            "Only as a written rule, the same for everyone. If the trip disappears only when you feel like it, you are negotiating with yourself in the driveway. Put the credit on the quote so the first number and the second number still add up.",
        },
        {
          question: "Is a diagnostic fee the same as an hourly rate?",
          answer:
            "It can be an hour of troubleshooting at your hourly line, or a flat fee for the first hour with an hourly rate after. Say which. A flat fee that quietly becomes a blank check is the thing customers complain about.",
        },
        {
          question: "What do I send if I find the fault and they want a day to think?",
          answer:
            "A quote for the repair, with the diagnostic already paid or listed as credited. That document is a quote, not another service call. They should be able to accept it without you going back.",
        },
        {
          question: "Can I use the government wage as the service rate?",
          answer:
            "No. The Bureau of Labor Statistics median is employee pay, not your billable rate. Your service price has to carry the truck, the insurance, and the calls that do not turn into work.",
        },
      ]}
    >
      <h2>Three prices, one driveway</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-black/8">
              <th className="py-2 pr-3 font-medium text-ink-60">Price</th>
              <th className="py-2 pr-3 font-medium text-ink-60">You did this</th>
              <th className="py-2 font-medium text-ink-60">They should hear</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-black/8">
              <td className="py-2 pr-3">Trip</td>
              <td className="py-2 pr-3">You went to the house.</td>
              <td className="py-2">This covers the visit, not the repair.</td>
            </tr>
            <tr className="border-b border-black/8">
              <td className="py-2 pr-3">Diagnostic</td>
              <td className="py-2 pr-3">You found, or ruled out, the fault.</td>
              <td className="py-2">This pays for the hour with the meter.</td>
            </tr>
            <tr>
              <td className="py-2 pr-3">Repair</td>
              <td className="py-2 pr-3">You fixed a defined thing.</td>
              <td className="py-2">This is a quote. Accept it or do not.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        The trip is real even when the outlet was a tripped breaker they could
        have reset. The diagnostic is real even when the answer is &ldquo;the
        panel is full and I will not add a tandem to make it look fine.&rdquo;
        The repair starts only when both of you know what the repair is.
      </p>

      <h2>Say it before you drive</h2>
      <p>
        The fight happens when the first mention of money is after the cover
        is off. On the phone, use one sentence you can repeat without
        thinking. Example of the shape, not a rate: &ldquo;The visit is a flat
        trip fee. If I have to test to find it, the diagnostic is separate. If
        you want it fixed today and I can, I&apos;ll quote that before I
        start, and the trip comes off the repair.&rdquo;
      </p>
      <p>
        Do not put a dollar on that example. Your fee is a function of your
        radius, your parking, and what an hour of the business must earn. The{" "}
        <a
          href="https://www.bls.gov/ooh/construction-and-extraction/electricians.htm"
          className={link}
        >
          Bureau of Labor Statistics
        </a>{" "}
        put the May 2024 median wage for electricians at $29.98 an hour. That
        is wages, not a service-call fee. A shop that bills the median wage
        for a trip has not priced the trip. It has priced an employee who does
        not own the van. More on that distinction is in{" "}
        <Link href="/blog/how-to-build-an-electrical-pricebook" className={link}>
          how to build an electrical pricebook
        </Link>
        .
      </p>

      <h2>What the trip should and should not buy</h2>
      <p>
        The trip buys presence: the drive, the knock, a look at what they
        described, and a recommendation you can say in a minute. It does not
        buy an hour of opening boxes, and it does not buy the part you happen
        to have on the van. If the look turns into testing, you are in the
        diagnostic, and you should say so before the testing starts.
      </p>
      <p>
        Some shops fold the first minutes of looking into the trip and start
        the clock when the tools come out. That is a fine rule if it is the
        rule every time. Write it on the pricebook row so the person who
        answers the phone and the person in the van tell the same story.
      </p>

      <h2>The diagnostic is a product</h2>
      <p>
        Troubleshooting is the job when the symptom is &ldquo;sometimes the
        kitchen dies.&rdquo; Price it by the hour, with a first-hour minimum
        if you need one, and tell them the minimum. Stop at a natural break
        and report. A diagnostic that expands until the customer is afraid to
        ask the total is a diagnostic you priced badly.
      </p>
      <p>
        Write down what you found, even when they do not hire you to fix it.
        That note is what makes the next quote fast, and it is what you will
        wish you had if they call another electrician and misremember your
        visit. If the finding is &ldquo;I do not know yet, and the next step
        is opening the wall,&rdquo; that next step is an estimate or a quoted
        exploration, not a shrug. The wording is in{" "}
        <Link href="/blog/electrical-quote-vs-estimate-vs-bid" className={link}>
          electrical quote vs estimate vs bid
        </Link>
        .
      </p>

      <h2>After hours, and the calls that are not repairs</h2>
      <p>
        Nights and weekends cost you a different evening than a Tuesday slot.
        If you charge more then, say so on the phone before you agree to come,
        in the same plain sentence as the trip. A surprise multiplier on the
        invoice is the review you cannot answer. A posted rule is boring,
        which is what you want.
      </p>
      <p>
        Some calls are not a repair and not a mystery. The customer wants a
        price for work you can see: a charger, a set of lights, a panel. That
        visit is an estimating visit. Decide whether the trip fee applies, and
        say it. Many shops waive it when the visit exists only to quote, and
        charge it when the visit exists to fix something unknown. Either rule
        is fine. Having two rules and picking the one that feels fair in the
        moment is how the customer hears a different story from the person who
        answered the phone.
      </p>
      <p>
        Write the rule where the phone is answered. If that is you, write it
        in the pricebook note anyway, because at the end of a long day it is
        easy to start discounting on the fly. Then put it on the quote as lines
        they can see: trip, diagnostic if you tested, repair if they
        want it, credit if your rule says the trip comes off.
      </p>
      <p>
        If they decline the repair, you still did the trip and, if you tested,
        the diagnostic. Invoice those. Do not quietly delete them because the
        visit felt unsuccessful. Finding out the circuit is dangerous, or that
        the repair is a panel and not a device, is the work they called you
        for. Leaving unpaid because you wanted the bigger job is a habit, and
        it is an expensive one.
      </p>

      <h2>The repair is a quote, sent while you are there</h2>
      <p>
        Once you know the repair, quote it before you do it, unless it is
        small enough that your posted rule already covered it. Small and
        defined can be a pricebook line: a device, a breaker, a GFCI. Large or
        newly discovered gets a quote with lines, exclusions, and a way to
        accept. Doing the large one on a handshake because you are already
        there is how &ldquo;service call&rdquo; becomes a dispute about scope.
      </p>
      <p>
        If your rule is that the trip is credited when they go ahead the same
        day, the quote should show the trip, then the credit, then the repair.
        Example of the shape only: trip listed, credit listed, repair listed,
        total equal to the repair. The dollars are yours. The shape is what
        stops the customer feeling the trip was a trick.
      </p>
      <p>
        Send that quote from the driveway when you can. Waiting until evening
        is how a service call turns into a forgotten thread. The sequence is{" "}
        <Link
          href="/blog/how-to-write-an-electrical-quote-on-your-phone"
          className={link}
        >
          how to write an electrical quote on your phone
        </Link>
        .
      </p>

      <h2>Put the three prices where you will reuse them</h2>
      <p>
        The trip, the diagnostic hour, and the common small repairs belong in
        the pricebook as separate rows, with notes that match the sentence you
        say on the phone. When the row and the sentence drift, the customer
        hears one deal and the invoice shows another. Fix the drift the day
        you notice it. A service call is the job you do most often, which
        means a sloppy row taxes every week, not just the weird panel.
      </p>
      <p>
        On the quote or the invoice, keep the labels boring and specific.
        &ldquo;Trip,&rdquo; &ldquo;diagnostic, first hour,&rdquo; &ldquo;replace
        GFCI in the kitchen.&rdquo; Avoid a single line called service call
        with a number that changed since the phone call. If the credit
        applies, it is a line too, so the arithmetic is visible. People argue
        with a total that appeared. They rarely argue with three lines they
        were told about before you left the shop.
      </p>

      <h2>Sources</h2>
      <p>
        The only published figure in this piece is the BLS May 2024 median
        wage, $29.98 an hour, from the{" "}
        <a
          href="https://www.bls.gov/ooh/construction-and-extraction/electricians.htm"
          className={link}
        >
          Occupational Outlook Handbook page for electricians
        </a>
        . It is here so you do not use it as a service-call price.
      </p>
    </PostFrame>
  );
}