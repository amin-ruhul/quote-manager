import type { Metadata } from "next";
import Link from "next/link";

import { PostFrame } from "@/components/blog/post-frame";
import { getPost } from "@/lib/blog";
import { pageMetadata } from "@/lib/seo";

const post = getPost("how-to-write-an-electrical-quote-on-your-phone")!;

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
      lede="Writing an electrical quote on your phone mostly comes down to doing the same steps in the same order. You already worked out the job while walking the house. Here is how to turn that into a quote the customer can accept before you pull away."
      answer="Photos first, then one sentence of scope, then lines from your pricebook, then what is not included, then send. If you do not have the prices on the phone yet, write the scope and the count anyway and mark the missing prices, or use a one-page template. Do not promise a quote tonight and send a memory tomorrow."
      faq={[
        {
          question: "What if the phone signal is bad in the basement?",
          answer:
            "Take the photos and the counts downstairs. Write the quote in the driveway, where the signal usually is. The customer can still be in the doorway when you hit send.",
        },
        {
          question: "Should I email a PDF instead of a link?",
          answer:
            "A link they can open and accept is the thing you can track. A PDF is a file they can lose. If you have no account yet, the free template will print a PDF. It will not tell you they opened it.",
        },
        {
          question: "How long should this take?",
          answer:
            "A familiar job, with the pricebook already built, is a few minutes of counting and tapping. An unfamiliar job should become an estimate, not a ten-minute fiction.",
        },
        {
          question: "Do I need a laptop later to make it look professional?",
          answer:
            "No. The customer reads it on their phone. A clean list, your name, and a way to accept beats a desktop document that arrives after dinner.",
        },
      ]}
    >
      <h2>Before you open the app</h2>
      <p>
        Walk the job with the phone already out. You are collecting evidence
        you will not remember at the next light.
      </p>
      <ul className="list-disc space-y-2 pl-5">
        <li>Photos of the panel, the device, the path, and anything ugly.</li>
        <li>A count: openings, devices, feet if the run is the price.</li>
        <li>One sentence you could read back: what they asked you to do.</li>
        <li>The thing you are not doing: patch, permit, fixture by owner, a service change.</li>
      </ul>
      <p>
        If you cannot say the sentence, you are not ready to quote. You are
        ready to estimate. Send that instead of a firm number. The difference
        is{" "}
        <Link href="/blog/electrical-quote-vs-estimate-vs-bid" className={link}>
          electrical quote vs estimate vs bid
        </Link>
        .
      </p>

      <h2>The order on the screen</h2>
      <p>
        Same order every house, so you are not designing a document in a
        driveway.
      </p>
      <ol className="list-decimal space-y-2 pl-5">
        <li>Your business name, already saved. Their name, typed while they spell it.</li>
        <li>The job title in their words. &ldquo;Six kitchen lights,&rdquo; not &ldquo;electrical.&rdquo;</li>
        <li>Lines from the pricebook. Quantity, then the row. Add a row only for the thing this house did that the row did not expect.</li>
        <li>Tax the way your state actually works, or a note that the price does not add it.</li>
        <li>Exclusions and how long the price holds.</li>
        <li>Send. Then look at it once, as they will, before you drive.</li>
      </ol>
      <p>
        The pricebook is the only way step three is fast. If you are typing
        descriptions from nothing, you will defer the quote, and deferring is
        the loss described in{" "}
        <Link
          href="/blog/how-fast-should-you-send-an-electrical-quote"
          className={link}
        >
          how fast should you send an electrical quote
        </Link>
        . Making the list is{" "}
        <Link href="/blog/how-to-build-an-electrical-pricebook" className={link}>
          how to build an electrical pricebook
        </Link>
        .
      </p>

      <h2>A worked example, labelled as an example</h2>
      <p>
        Example, not a ticket from a real house. You are in a kitchen.
        Attic is open. They want six recessed lights and a dimmer. You are not
        patching. Your pricebook has a row for an opening in an open attic and
        a row for a dimmer.
      </p>
      <p>
        You take one photo of the scuttle and one of the switch. You say,
        &ldquo;Six lights, dimmer, I am not patching or painting.&rdquo; They
        nod. On the phone you add the opening six times, add the dimmer once,
        write the exclusion, set the price good for 30 days because that is
        your habit and not a rule, and send the link while they are still in
        the room. They can accept it after you leave. You can see that they
        opened it.
      </p>
      <p>
        The per-opening thinking behind that row is{" "}
        <Link href="/blog/how-to-price-recessed-lighting" className={link}>
          how to price recessed lighting
        </Link>
        . If they hesitate between basic lights and the dimmer, do not invent
        a discount. Offer the two scopes as options, which is{" "}
        <Link
          href="/blog/good-better-best-pricing-for-electricians"
          className={link}
        >
          good, better, best pricing for electricians
        </Link>
        .
      </p>

      <h2>If you do not have the software open yet</h2>
      <p>
        You can still leave with a page. The{" "}
        <Link href="/free-electrical-quote-template" className={link}>
          free electrical quote template
        </Link>{" "}
        takes a business name, a customer, lines, tax, and notes, and it
        prints to PDF. No account. It will not save the quote and it will not
        tell you they opened it. Use it once so the customer is not waiting on
        your evening. Move the same lines into a real quote when you want the
        accept link.
      </p>
      <p>
        QuotePace is that next step: the pricebook on the phone, the link, the
        open, the accept. Quoting is free, with a cap of 100 quotes a month on
        the free plan. AI drafting is a paid extra and it is optional. You can
        write this whole sequence by tapping your own lines. A wider look at
        what &ldquo;free&rdquo; means next to the trials is{" "}
        <Link href="/blog/free-electrical-estimate-software" className={link}>
          free electrical estimate software
        </Link>
        .
      </p>

      <h2>The mistakes that make you reopen the laptop</h2>
      <p>
        Most &ldquo;I&apos;ll finish it at home&rdquo; moments are a missing
        habit, not a missing feature. Fix the habit and the phone is enough.
      </p>
      <ul className="list-disc space-y-2 pl-5">
        <li>No pricebook row, so you are composing prose. Add the row tonight if you will sell it again. For this house, use an hourly line plus material and say that is what it is.</li>
        <li>You did not ask them to spell the name and the address. The quote looks sloppy before they read the price. Ask while you are there. Typing it later from a voicemail is how you quote the wrong house.</li>
        <li>The exclusion stayed in your head. If it is not on the page, it is not in the deal. Read the exclusions out loud once. Patching, fixtures, permit, a full panel.</li>
        <li>You are redesigning the layout. Stop. The customer will read it on a phone. Lines, a total, a way to accept. A desktop theme will not win the job.</li>
        <li>You are waiting for a perfect photo set. Two clear photos are enough to remember the job. Ten photos you will not attach are a delay.</li>
      </ul>
      <p>
        If the screen is fighting you, drop to the smallest true document. One
        scope sentence. The lines you are sure of. The exclusion. Send that as
        a quote if it is complete, or as an estimate if it is not. Completeness
        is the scope, not the graphic. A short page they can accept beats a
        beautiful one they see tomorrow.
      </p>
      <p>
        When you get a row wrong, fix the row after the visit, not only the
        quote. Otherwise you will make the same mistake on the next job. The
        phone is only fast when the list behind it is right, and ten minutes
        fixing a row saves trouble on every quote after it.
      </p>

      <h2>After you send</h2>
      <p>
        Do not sit in the cab rewriting it. If they go quiet, one text that
        points at the exclusions is enough for today. The rest of the cadence
        is{" "}
        <Link
          href="/blog/how-to-follow-up-on-an-electrical-quote"
          className={link}
        >
          how to follow up on an electrical quote
        </Link>
        . If you find, on the way to the truck, that you forgot the permit,
        send a corrected quote. Do not correct it in a text and leave the old
        total on the page they might accept.
      </p>
      <p>
        Check the total against the lines before you hit send. A phone makes
        it easy to tap an extra zero or to leave a quantity at one when you
        counted six. Read the quantity column out loud. If the total surprises
        you, it is better to catch it on site, where you can still explain
        it, not in a text thread an hour later. Tax, if you charge it, should
        be visible as tax and not hidden inside a round number you liked the
        look of.
      </p>
      <p>
        Then look at the link on your own phone, not only on the screen you
        just typed. The customer will see it on a small screen too.
        If a line wraps into nonsense, rename the row in plain words and send
        again. If the business name is still the placeholder, fix it before
        they see it. The header is the first thing they read, and a wrong
        company name is hard to take back.
      </p>
      <p>
        The longer version of the same habits, for when you are building the
        process rather than running it, is{" "}
        <Link href="/blog/how-to-quote-electrical-work" className={link}>
          how to quote electrical work
        </Link>
        . The phone does not replace that process. It is where the process has
        to fit.
      </p>
    </PostFrame>
  );
}