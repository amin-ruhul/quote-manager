import type { Metadata } from "next";
import Link from "next/link";

import { PostFrame } from "@/components/blog/post-frame";
import { getPost } from "@/lib/blog";
import { pageMetadata } from "@/lib/seo";

const post = getPost("electrical-quote-vs-estimate-vs-bid")!;

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
      lede="Electrical quote vs estimate vs bid is a wording problem that turns into a money problem. The customer hears one word. You meant another. This is which document to send, from the person who has to do the work."
      answer="An estimate is a number you are still working out. A quote is a price for a scope they can accept. A bid is that quote dropped into someone else's competition, usually a general contractor or a set of plans. Send the one you mean, and write the word on the page."
      faq={[
        {
          question: "Can a customer accept an estimate?",
          answer:
            "They can say yes to it. If the page did not define the work, you do not have agreement on the work. Call it an estimate, give a range or mark it budgetary, and send a quote once you have seen enough to name the scope.",
        },
        {
          question: "Is a bid legally different from a quote?",
          answer:
            "This is trade practice, not legal advice. In a house call they are often the same document with different cover words. On a formal bid the plans, the deadline, and the instructions are the GC's or the owner's. Read those before you treat your number as the whole deal.",
        },
        {
          question: "Should the first visit produce a quote?",
          answer:
            "When you can see the work, yes. When you cannot, send a short estimate that says what you have not opened, and quote the diagnostic as its own line. Guessing a firm price for a closed wall is how the second visit becomes an argument.",
        },
        {
          question: "What if the scope changes after they accept?",
          answer:
            "Stop and write the change. A quote is for the scope on the page. New work is a new line they accept, not a surprise on the invoice.",
        },
      ]}
    >
      <h2>The three words, on one page</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-black/8">
              <th className="py-2 pr-3 font-medium text-ink-60">Document</th>
              <th className="py-2 pr-3 font-medium text-ink-60">You are saying</th>
              <th className="py-2 font-medium text-ink-60">They can</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-black/8">
              <td className="py-2 pr-3">Estimate</td>
              <td className="py-2 pr-3">Roughly what it will cost.</td>
              <td className="py-2">Plan. Not hire you for a defined job.</td>
            </tr>
            <tr className="border-b border-black/8">
              <td className="py-2 pr-3">Quote</td>
              <td className="py-2 pr-3">This scope, this price, until this date.</td>
              <td className="py-2">Accept it and expect that work.</td>
            </tr>
            <tr>
              <td className="py-2 pr-3">Bid</td>
              <td className="py-2 pr-3">
                My number, against the documents you issued.
              </td>
              <td className="py-2">Compare you with the other bidders.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        If you only remember one test: could a stranger do the job from the
        page, and would both of you agree it was finished? If yes, it can be a
        quote. If you still need to open a wall, it is an estimate, or it is a
        quote for the opening and a promise to price the rest.
      </p>

      <h2>When the estimate is the right document</h2>
      <p>
        Send an estimate when the customer is budgeting, when another trade
        has not finished the plans, or when you have not been to the house.
        Say it is an estimate in the first line. Give what it depends on. A
        range is honest. A single firm number with the word &ldquo;estimate&rdquo;
        in the footer is how people get sued in small-claims court and how
        you get a one-star review that quotes your own page back at you.
      </p>
      <p>
        An estimate should still be specific. &ldquo;Electrical, about a few
        thousand&rdquo; helps nobody. &ldquo;Budget for six recessed lights in
        a kitchen with an open attic, not including patching or a panel
        change&rdquo; helps them decide whether to invite you. Mark every
        allowance. An allowance is a placeholder, and it should say whose
        price it will be replaced with.
      </p>
      <p>
        Leaving with only an estimate is fine. It means you did not guess at
        work you could not see. Price the visit if you need to. That fee is
        its own conversation, covered in{" "}
        <Link
          href="/blog/what-to-charge-for-an-electrical-service-call"
          className={link}
        >
          what to charge for an electrical service call
        </Link>
        .
      </p>

      <h2>What a quote has to contain</h2>
      <p>
        A quote is the page they say yes to. It needs your business name and a
        way to reach you, their name, and the address if you have it. It needs
        the work in driveway language, lines with quantity and your price, and
        a sentence on what is not included. Tax is either on the page or
        declared absent. The price needs an expiry, because a panel and a coil
        of copper do not hold still.
      </p>
      <p>
        It also needs a way to accept. A PDF in an email inbox is a quote they
        can lose. A link they can open and sign is a quote you can see. The
        difference between those two is most of the follow-up you would
        otherwise do by text. How that follow-up should sound, when you still
        have to send it, is in{" "}
        <Link
          href="/blog/how-to-follow-up-on-an-electrical-quote"
          className={link}
        >
          how to follow up on an electrical quote
        </Link>
        .
      </p>
      <p>
        Do not mix options inside one lump sum. If they might choose a
        different fixture or a different scope, those are separate prices.
        That layout is{" "}
        <Link
          href="/blog/good-better-best-pricing-for-electricians"
          className={link}
        >
          good, better, best pricing
        </Link>
        , and it is still a quote. Each option has to be acceptable on its
        own.
      </p>

      <h2>A bid is a quote with someone else&apos;s rules</h2>
      <p>
        On a service call you invent the scope, because the customer described
        a symptom. On a bid, the scope arrives as plans, a spec, or a
        general contractor&apos;s list. Your job is to price what they asked,
        name what they left out, and hit their deadline. Late bids are often
        unread. Exclusions they did not ask for are how you stay solvent.
      </p>
      <p>
        Read the instructions before you price. Who supplies the fixtures. Who
        cuts the drywall. Who pulls the permit. Whether you are allowed to
        substitute. A residential GC who says &ldquo;just give me a
        number&rdquo; still has a list in their head. Write yours down so the
        two lists can be compared before you are the one in the attic.
      </p>
      <p>
        Allowances on a bid need a unit. &ldquo;Lighting allowance&rdquo; with
        no count of openings is a blank check in both directions. Count the
        openings on the plan, price your labor per opening, and let the
        fixture dollar amount sit on its own line as an allowance you will
        true up. The same habit shows up in{" "}
        <Link href="/blog/how-to-price-recessed-lighting" className={link}>
          how to price recessed lighting
        </Link>
        .
      </p>

      <h2>The sentence that keeps the words apart</h2>
      <p>
        Put one of these under the title, in plain language, every time.
      </p>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          Estimate: &ldquo;Budget only. I have not opened the walls. This is
          not a price you can accept.&rdquo;
        </li>
        <li>
          Quote: &ldquo;This price is for the work listed. It is good until
          the date below. Accept it and that is the job.&rdquo;
        </li>
        <li>
          Bid: &ldquo;Priced from the plans and notes listed. Anything not on
          those sheets is excluded.&rdquo;
        </li>
      </ul>
      <p>
        Then send the document while the conversation is still warm. A perfect
        quote that arrives after they hired someone else does not win the
        job. How to send one from the job site is covered in{" "}
        <Link
          href="/blog/how-to-write-an-electrical-quote-on-your-phone"
          className={link}
        >
          how to write an electrical quote on your phone
        </Link>
        .
      </p>

      <h2>A check before it leaves your phone</h2>
      <p>
        Read the page once as the customer, in the truck, before you send.
        You are looking for the word you used and the promise it makes.
      </p>
      <ul className="list-disc space-y-2 pl-5">
        <li>The title says estimate, quote, or bid, and the first sentence agrees with the title.</li>
        <li>If it is an estimate, a stranger could not hire you from it by accident. The range or the missing information is visible.</li>
        <li>If it is a quote, the work, the price, the exclusions, and the date the price dies are all on the page.</li>
        <li>If it is a bid, the plans or the GC&apos;s list are named, and anything you did not see on those sheets is excluded.</li>
        <li>Allowances have a count or a unit, not just a dollar amount floating alone.</li>
        <li>There is one way to say yes, and it is obvious which document they are saying yes to.</li>
      </ul>
      <p>
        Fix the page. Do not repair it in the text message you send afterward.
        A text that contradicts the total is two documents, and the customer
        will keep the one they like. If you change the scope after they have
        the link, send a new quote and say the old one is replaced. Leaving
        both live is how you install the cheaper of the two by accident.
      </p>
      <p>
        On a bid day, do this earlier than you think. The deadline is theirs.
        A careful exclusion sent ten minutes late is often the same as an
        exclusion they never saw. If their form forbids exclusions, decide
        whether you are willing to hold the risk before you submit, not after
        you are the low number.
      </p>
      <p>
        None of this makes the document a contract review. It makes the word
        on the page match the job in your head. That match is what you can
        control from the van. The rest is for the bid form and, when the job
        is large, for whoever usually reads those forms with you.
      </p>

      <h2>What this is not</h2>
      <p>
        Nothing here is a substitute for the contract rules in your state, a
        license board, or the general contractor&apos;s bid form. If a job is
        large enough that the wording might be argued in front of someone
        other than the homeowner, have that form read by whoever usually reads
        them for you. The point of the three words is simpler than that. Use
        the word that matches how finished the scope is, and do not let a
        customer accept a guess.
      </p>
    </PostFrame>
  );
}
