import type { Metadata } from "next";
import Link from "next/link";

import { PostFrame } from "@/components/blog/post-frame";
import { getPost } from "@/lib/blog";
import { pageMetadata } from "@/lib/seo";

const post = getPost("good-better-best-pricing-for-electricians")!;

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
      lede="Good, better, best pricing for electricians is a way to let the customer choose the job, instead of arguing you down to a thinner one. Each option should be different work at its own price."
      answer="Price the same visit three ways only when the ways are different work: different gear, different labor, or a different warranty you will actually honor. Label every dollar in an example as an example. The numbers below are not a market rate."
      faq={[
        {
          question: "Do I have to offer three options on every job?",
          answer:
            "No. A panel swap with one legal way to do it is one price. Options are for choices the customer actually has, such as fixture grade, a dimmer, or doing the whole room instead of half.",
        },
        {
          question: "Should the middle option be the one I want them to pick?",
          answer:
            "Only if the middle option is a real job you are happy to do. A decoy price that you hope they reject is how trust dies when they pick it and you sigh.",
        },
        {
          question: "Where does the pricebook fit?",
          answer:
            "Each option is a bundle of pricebook lines, not a new invented total. If you cannot point at the lines, you do not have three prices. You have a guess.",
        },
        {
          question: "Can they mix lines from two options?",
          answer:
            "If you allow it, rewrite the quote as the mix they asked for and have them accept that page. Do not let them assemble a fourth price in a text thread.",
        },
      ]}
    >
      <h2>What the three options are for</h2>
      <p>
        A single price asks a yes or a no. Three prices ask which job. That is
        useful when the customer is comparing you with someone who left a
        cheaper, thinner scope, and you would rather show the thin scope
        yourself than discover it on the invoice.
      </p>
      <p>
        Good is the job that meets the request and the code, nothing extra.
        Better is the job you would put in your own house if the budget was
        normal. Best is the job with the part, the control, or the coverage
        they asked about and you can actually deliver. If you cannot say that
        sentence for each column, you do not have three options yet.
      </p>

      <h2>What must change between columns</h2>
      <p>Change something the customer can see or that you will stand behind.</p>
      <ul className="list-disc space-y-2 pl-5">
        <li>The gear: builder-grade trim versus a named fixture they picked.</li>
        <li>The labor: six openings versus six openings plus a new switch leg and a dimmer.</li>
        <li>The edge: who patches drywall, who hauls the old gear, how long you warrant the workmanship.</li>
      </ul>
      <p>
        Do not change the math and leave the scope identical. A higher markup
        with the same lines is not &ldquo;best.&rdquo; It is the same job at
        a higher price, and a careful customer will spot it because the lines
        are itemized.
      </p>

      <h2>A worked example, labelled as an example</h2>
      <p>
        Example only. These figures are round numbers so the shape is easy to
        see. They are not what recessed lights cost in your city, and they are
        not a suggestion. Replace every one of them with a line from your own
        pricebook before this leaves your phone.
      </p>
      <p>
        The request: six recessed lights in a kitchen, attic access is a
        scuttle, no panel work, customer is undecided on dimming.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-black/8">
              <th className="py-2 pr-3 font-medium text-ink-60">Line</th>
              <th className="py-2 pr-3 font-medium text-ink-60">Good</th>
              <th className="py-2 pr-3 font-medium text-ink-60">Better</th>
              <th className="py-2 font-medium text-ink-60">Best</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-black/8">
              <td className="py-2 pr-3">Six openings, wire, trim, test</td>
              <td className="py-2 pr-3">Included</td>
              <td className="py-2 pr-3">Included</td>
              <td className="py-2">Included</td>
            </tr>
            <tr className="border-b border-black/8">
              <td className="py-2 pr-3">Dimmer and new switch leg</td>
              <td className="py-2 pr-3">No</td>
              <td className="py-2 pr-3">Yes</td>
              <td className="py-2">Yes</td>
            </tr>
            <tr className="border-b border-black/8">
              <td className="py-2 pr-3">Fixture</td>
              <td className="py-2 pr-3">Basic, you supply</td>
              <td className="py-2 pr-3">Basic, you supply</td>
              <td className="py-2">The ones they picked</td>
            </tr>
            <tr className="border-b border-black/8">
              <td className="py-2 pr-3">Drywall patch</td>
              <td className="py-2 pr-3">Not included</td>
              <td className="py-2 pr-3">Not included</td>
              <td className="py-2">Not included</td>
            </tr>
            <tr>
              <td className="py-2 pr-3">Example total, before tax</td>
              <td className="py-2 pr-3">$900</td>
              <td className="py-2 pr-3">$1,150</td>
              <td className="py-2">$1,450</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        The gaps are the point of the example, not the dollars. Better costs
        more because there is a dimmer and another run of wire. Best costs
        more because the fixtures are a different product. Drywall stays out
        of all three, so nobody &ldquo;upgrades&rdquo; into a trade you do not
        do. If your town requires a permit for this, the permit is its own
        line on every column, or on none of them with a sentence that says so.
      </p>
      <p>
        How the per-opening price should be built, before you ever make three
        columns, is{" "}
        <Link href="/blog/how-to-price-recessed-lighting" className={link}>
          how to price recessed lighting
        </Link>
        .
      </p>

      <h2>How to say it on the page</h2>
      <p>
        Give each option a name a homeowner can repeat at dinner.
        &ldquo;Lights only,&rdquo; &ldquo;Lights and dimmer,&rdquo;
        &ldquo;Lights, dimmer, and your fixtures.&rdquo; A paragraph under each
        name. Then the lines. Then one place to accept one option, not a
        signature that could mean all three.
      </p>
      <p>
        Put the same exclusions under all of them. Concealed damage, painting,
        and a panel that turns out to be full are not an upgrade path. They
        are conditions. If you hide them under Best only, Good looks cheaper
        than it is.
      </p>
      <p>
        Keep the price hold the same across the columns unless a special-order
        fixture has its own lead time. Say that lead time on Best. A customer
        who picks Best and expects Thursday is a customer you failed in the
        writing, not in the price.
      </p>

      <h2>When to stay with one price</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>The code, the utility, or the existing gear leaves one legal method.</li>
        <li>You have not seen the job. Options on a guess multiply the guess.</li>
        <li>The customer asked for a number to compare with a written scope from someone else. Match their scope first. Offer the other two only after.</li>
      </ul>
      <p>
        A single price is fine when there is only one sensible way to do the
        job. The document type still matters: if they cannot accept it,
        you sent an estimate. That distinction is{" "}
        <Link href="/blog/electrical-quote-vs-estimate-vs-bid" className={link}>
          electrical quote vs estimate vs bid
        </Link>
        .
      </p>

      <h2>How the conversation usually goes</h2>
      <p>
        Present Good first, in one sentence, as the job that does what they
        asked. Then Better, as the thing you would add if it were your kitchen
        and the budget was ordinary. Then Best, as the specific upgrade they
        already mentioned. Then stop talking. The pause is them deciding. Filling
        it with a discount is how three prices collapse back into one.
      </p>
      <p>
        If they pick Good, do Good. Do not sigh, and do not &ldquo;throw
        in&rdquo; the dimmer because you wanted Better. The thrown-in dimmer
        trains the next customer to wait for the throw-in, and it means Better
        was never a real price. If they pick Best and the fixture is
        special-order, read the lead time again before you promise a day.
      </p>
      <p>
        Write down which option they accepted. A verbal &ldquo;we&apos;ll do
        the nice ones&rdquo; is not an accept. The page they sign should name
        the option. If your tool can show three options and record which one
        they chose, use that. If you are still on paper, circle it and have
        them initial the circle. A text that says &ldquo;let&apos;s do
        better&rdquo; is easy to misremember when the invoice arrives.
      </p>
      <p>
        After the job, notice which column you actually wanted to sell and
        which one they bought. If everyone buys Good, Better may be a weak
        difference, not a moral failing on their part. Make the difference
        visible: a dimmer they can touch, a trim they picked, a warranty
        sentence they can read. If nobody buys Best, it may not be something
        your customers want. Take it off until a customer asks for that exact thing.
      </p>

      <h2>What to do when they want a blend</h2>
      <p>
        They will. Good&apos;s fixture, Better&apos;s dimmer, Best&apos;s
        warranty sentence. Do not price that blend in your head while you are
        standing in the doorway. Say you will send the mix as its own option,
        then send it. The mix needs the same exclusions as the column it came
        from. If the warranty sentence only existed because Best included a
        fixture you supply, it does not survive a swap to their fixture. Read
        the sentence again before you paste it.
      </p>
      <p>
        Two options are enough when you only have two real jobs. Three empty
        columns look like a template. A fourth column for every blend looks
        like you do not know what you sell. Cap it. If they keep editing, the
        job is not ready to be accepted, and you are back in estimate
        territory until the list stops moving. Freeze the page, tell them the
        price holds to the date you already wrote, and let them choose from
        what is written.
      </p>

      <h2>Build the columns from lines you already trust</h2>
      <p>
        Good, better, best falls apart when each column is typed from memory
        in the driveway. The lines should already exist: an opening, a dimmer,
        a fixture allowance, a trip. That list is the pricebook, and the way
        to make one you will actually use is{" "}
        <Link href="/blog/how-to-build-an-electrical-pricebook" className={link}>
          how to build an electrical pricebook
        </Link>
        . QuotePace can hold the three options on the quote the customer sees.
        The judgment about what differs between them is still yours, which is
        the part that should not be automated.
      </p>
    </PostFrame>
  );
}