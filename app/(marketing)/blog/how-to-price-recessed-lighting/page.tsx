import type { Metadata } from "next";
import Link from "next/link";

import { PostFrame } from "@/components/blog/post-frame";
import { getPost } from "@/lib/blog";
import { pageMetadata } from "@/lib/seo";

const post = getPost("how-to-price-recessed-lighting")!;

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
      lede="How to price recessed lighting per fixture works when the fixtures are actually the same job. Six holes in an open attic are one unit times six. Six holes in a finished ceiling, with insulation against the can and a new switch leg, are a different unit. The per-fixture number is the last step, not the first."
      answer="Count openings. Split the easy ceiling from the hard one. Price wire, the switch or dimmer, the fixture, and the patch as their own lines when they are not inside your per-opening unit. If the can will touch insulation, the fixture has to be listed for that. The listing is on the fixture. A blog does not clear it."
      faq={[
        {
          question: "Should I quote per fixture or per room?",
          answer:
            "Per opening, then add the lines that belong to the room once: the home run, the switch, the dimmer, the patch. A room price hides a seventh hole they add while you are writing.",
        },
        {
          question: "Who supplies the trim?",
          answer:
            "Decide on the quote. If they supply it, your unit is the opening, the wire, and the install of their trim, and you are not warranting a fixture you did not buy. If you supply it, the fixture is a line they can see.",
        },
        {
          question: "Do I include drywall?",
          answer:
            "Only if you do drywall. Most electrical quotes should say patching and paint are excluded. A per-fixture price that quietly includes a trade you will subcontract is a price you will resent.",
        },
        {
          question: "What if the attic is not the attic I hoped for?",
          answer:
            "Stop and reprice the remaining openings. A note on the original quote that finished ceilings are a different rate is what makes that a change, not a favor.",
        },
      ]}
    >
      <h2>The unit is the opening, with a condition</h2>
      <p>
        A recessed light is a hole, a can or a wafer, a trim, wire to the
        next hole or to the switch, and a test. In an open attic those pieces
        repeat, so a per-opening price is fair. The condition has to be in the
        name of the pricebook row. &ldquo;Recessed, open attic, you supply a
        listed fixture&rdquo; is a unit. &ldquo;Recessed light&rdquo; is a
        memory.
      </p>
      <p>
        Build two or three rows, not one row and a hope.
      </p>
      <ul className="list-disc space-y-2 pl-5">
        <li>Open attic or open joist, working room to move.</li>
        <li>Tight attic, insulation pulled back, or a scuttle you have to fight.</li>
        <li>Finished ceiling from below, where each hole is also a patch someone has to own.</li>
      </ul>
      <p>
        The third one is often not an electrical unit at all. It is electrical
        work plus a drywall exclusion. Say so.
      </p>

      <h2>What a per-fixture price forgets</h2>
      <p>
        These show up once per room, or once per job. Leave them out of the
        multiplied number or you will underprice the first light and overprice
        the tenth, or the reverse, and you will not know which.
      </p>
      <ul className="list-disc space-y-2 pl-5">
        <li>The home run back to the panel, priced by the foot if the path is long.</li>
        <li>A new switch leg, when the old switch does not land where the lights need to live.</li>
        <li>A dimmer, or a smart control, including the box fill and the neutral if the old box has neither.</li>
        <li>The fixture itself, when you are buying a specific trim rather than a basic one in the unit.</li>
        <li>Insulation contact. If the housing will touch insulation, it has to be a type listed for insulation contact. Read the label. Do not take a room-by-room blog as the listing.</li>
        <li>Old wiring you uncover. Knob-and-tube, a brittle cable, or a box with no ground is a change, not a free extra on light number four.</li>
        <li>Permit, if this town wants one for the circuit you are adding.</li>
        <li>Patch and paint, excluded unless you wrote a number and you have someone to do it.</li>
      </ul>

      <h2>An example of the shape, not of the price</h2>
      <p>
        Example only. The dollars are placeholders so you can see which lines
        multiply and which lines do not. They are not a recessed-light price
        for your market. Delete them and use your rows.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-black/8">
              <th className="py-2 pr-3 font-medium text-ink-60">Line</th>
              <th className="py-2 pr-3 font-medium text-ink-60">Count</th>
              <th className="py-2 font-medium text-ink-60">Why it is separate</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-black/8">
              <td className="py-2 pr-3">Opening, open attic</td>
              <td className="py-2 pr-3">6</td>
              <td className="py-2">This is the unit that repeats.</td>
            </tr>
            <tr className="border-b border-black/8">
              <td className="py-2 pr-3">Dimmer and switch leg</td>
              <td className="py-2 pr-3">1</td>
              <td className="py-2">Once for the room, not once per can.</td>
            </tr>
            <tr className="border-b border-black/8">
              <td className="py-2 pr-3">Fixture allowance</td>
              <td className="py-2 pr-3">6</td>
              <td className="py-2">
                Their choice. True it up when they pick.
              </td>
            </tr>
            <tr>
              <td className="py-2 pr-3">Drywall and paint</td>
              <td className="py-2 pr-3">Excluded</td>
              <td className="py-2">Not your trade on this example.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        If you want them to choose basic, dimmed, or their own fixtures, those
        are three quotes of this same stack, not three moods. That layout is{" "}
        <Link
          href="/blog/good-better-best-pricing-for-electricians"
          className={link}
        >
          good, better, best pricing for electricians
        </Link>
        , and the example there uses this job on purpose.
      </p>

      <h2>Cans, wafers, and the trim they have not picked</h2>
      <p>
        The housing changes the unit. A remodel can from below is not a wafer
        that clamps in a half-inch of ceiling, and neither is a new-construction
        can you would have set before the drywall. If your pricebook has one
        row called recessed, you will use it for all three and only one of
        them will make money. Split the row when you have done each once and
        know the difference in time, not when a blog tells you a minute count.
      </p>
      <p>
        The trim is where quotes go soft. &ldquo;Lighting included&rdquo; with
        no product is an allowance pretending to be a scope. Either name the
        fixture you will supply, or write an allowance with a count of
        openings and a sentence that says the price changes when they pick
        something else. Update the quote when they pick. Do not absorb a
        designer trim inside a unit you built for a builder-grade one.
      </p>
      <p>
        Layout is their decision if they have one, and yours to flag if they
        do not. You can space holes so the room looks even. You should not
        invent a lighting design and bury it in the per-fixture price as if
        it were free thinking. If they hand you a sketch, price the sketch. If
        the sketch puts a can where a joist is, say so before you accept the
        count. Moving two holes after the quote is a change. Pretending you
        will &ldquo;make it look right&rdquo; is how the sixth light takes as
        long as the first five.
      </p>
      <p>
        Insulation is the other quiet change. A can that will be buried needs
        to be listed for contact with insulation, or the insulation has to
        stay off it the way the listing requires. You do not need a national
        price for that sentence. You need the label on the box you are about
        to install, and a line on the quote if the listed fixture costs more
        than the one in your default row. If you have not been in the ceiling,
        you do not know which one you are selling. Go look, or exclude the
        unknown and price the look.
      </p>

      <h2>Walk the room before you multiply</h2>
      <p>
        Count holes with them standing there. Mark who owns the furniture. Look
        at the attic or admit you have not. Find the switch and the panel so
        the home run is a measurement, not a adjective. A per-fixture price
        multiplied by a count you took over the phone is an estimate. Call it
        one. The difference is{" "}
        <Link href="/blog/electrical-quote-vs-estimate-vs-bid" className={link}>
          electrical quote vs estimate vs bid
        </Link>
        .
      </p>
      <p>
        Write the exclusions in the same visit. Insulation type, a can that
        is not listed for contact, a plaster ceiling, a fixture they have not
        bought. The customer can accept a shorter job. They cannot accept a
        job you described as &ldquo;the lights&rdquo; and priced as the easy
        attic.
      </p>

      <h2>After the first room, write down what surprised you</h2>
      <p>
        The first recessed quote in a new town is a lesson you will waste if
        you only remember that it &ldquo;took longer.&rdquo; Note which part
        took longer: the scuttle, the plaster, the switch with no neutral, the
        fixture that arrived in the wrong finish. That note becomes the next
        row or the next exclusion. Without it, the per-fixture price stays a
        mood, and the next kitchen inherits the mood instead of the fact.
      </p>
      <p>
        Count the openings on the invoice the same way you counted them on the
        quote. If you installed seven and quoted six, the seventh is either a
        change they accepted or a gift you did not mean to give. Gifts feel
        generous on the day and expensive when you are pricing the next one
        from memory of a job that was secretly bigger. The unit only works if
        the count is the count.
      </p>

      <h2>Keep the unit in the pricebook</h2>
      <p>
        After the second kitchen, the open-attic opening should be a row you
        do not retype. The note on the row holds the condition. The quote
        holds the count. There is more on setting that up in{" "}
        <Link href="/blog/how-to-build-an-electrical-pricebook" className={link}>
          how to build an electrical pricebook
        </Link>
        . From the driveway, you pick the row, type six, add the dimmer if
        they want it, and send. The phone version of that sequence is{" "}
        <Link
          href="/blog/how-to-write-an-electrical-quote-on-your-phone"
          className={link}
        >
          how to write an electrical quote on your phone
        </Link>
        .
      </p>
    </PostFrame>
  );
}