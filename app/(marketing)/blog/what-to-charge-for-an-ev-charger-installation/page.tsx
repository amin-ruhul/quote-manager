import type { Metadata } from "next";
import Link from "next/link";

import { PostFrame } from "@/components/blog/post-frame";
import { getPost } from "@/lib/blog";
import { pageMetadata } from "@/lib/seo";

const post = getPost("what-to-charge-for-an-ev-charger-installation")!;

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
      lede="What to charge for an EV charger installation is not the number on a homeowner blog. The published studies split the charger from the installation, and they still are not your price. Here is how to read them, then build the quote from the house in front of you."
      answer="Do not copy a national average. The Alternative Fuels Data Center lists residential Level 2 hardware around $380 to $690, and a separate install figure of about $1,300 per connector that does not include labor and permitting. An Idaho National Laboratory report, using older job records, found a median installation of $1,098, with a long tail when the run is hard or the service needs work. Price the circuit, the distance, the permit, and any panel work as their own lines."
      faq={[
        {
          question: "Does the customer already have the charger?",
          answer:
            "Ask before you price. Hardware and installation are different costs in the federal write-ups, and they should be different lines on your quote. If they supply it, say which model, and say you are not warranting their unit.",
        },
        {
          question: "When is a panel upgrade part of this job?",
          answer:
            "When the load calculation says the existing service cannot take the new circuit. That is a separate scope and a separate price. Do not bury a service change inside a charger line.",
        },
        {
          question: "Are the study prices what I should charge?",
          answer:
            "No. They are what a published sample cost, in the years and cities that sample covered. Your price is your labor, your material, your permit office, and the feet of conduit on this wall.",
        },
        {
          question: "Level 1 or Level 2?",
          answer:
            "Many drivers can live on the cord that came with the car if a suitable outlet already exists. Level 2 is the 240-volt equipment people ask you to install when they want a faster charge. Quote the one they asked for, and mention the other only if the panel or the parking spot makes it the honest option.",
        },
      ]}
    >
      <h2>Two federal sources, and they do not add together</h2>
      <p>
        The{" "}
        <a
          href="https://afdc.energy.gov/fuels/electricity-infrastructure-development"
          className={link}
        >
          Alternative Fuels Data Center
        </a>{" "}
        is the page to read before you argue with a customer who &ldquo;looked
        it up.&rdquo; It says a residential Level 2 charger can range from
        $380 to $690, citing a Rocky Mountain Institute report. It also says
        residential Level 2 installation is about $1,300 per connector, from a
        national-lab cost-of-charging report, and that this install figure
        does not include labor and permitting. Level 1 hardware on the same
        page runs from $0, if no extra equipment is needed, up to $900.
      </p>
      <p>
        Do not add $690 to $1,300 and call it the job. The $1,300 is not a
        labor price, and the $380 to $690 is not the conduit. They are
        different scopes published next to each other. Say that out loud if
        the customer added them.
      </p>
      <p>
        The other study electricians can actually use is{" "}
        <a
          href="https://www.osti.gov/servlets/purl/1887854"
          className={link}
        >
          Idaho National Laboratory report INL/RPT-22-68598
        </a>
        , August 2022, &ldquo;Breakdown of Electric Vehicle Supply Equipment
        Installation Costs.&rdquo; On the residential jobs in that write-up,
        installation cost averaged $1,310 and the median was $1,098. The range
        ran from about $150 for an easy install to about $18,000 for a hard
        one. Service upgrades were uncommon and added about $2,600 when they
        happened. Distance from the power source added about $12 a foot.
        Permit fees averaged 3.5% of installation cost. Electrician time
        averaged 5.4 hours.
      </p>
      <p>
        Those are 2022-era records from one program&apos;s contractors, not a
        bid for the house you are standing at. Use them as a checklist of what
        moves the price: feet, hours, the permit, and whether the service has
        room. Then throw the dollars out and put yours in.
      </p>

      <h2>The lines that belong on the quote</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          A dedicated circuit and the gear it needs, sized for the charger
          they are actually installing.
        </li>
        <li>
          The path: feet of wire or conduit, penetrations, and whether you are
          in a finished garage or an open one. The lab&apos;s per-foot note is
          a reminder to measure, not a rate to copy.
        </li>
        <li>
          The charger, if you supply it, as its own line. If they supply it,
          write the model and exclude warranty on the unit.
        </li>
        <li>
          Permit and inspection. The lab&apos;s average share was a few
          percent. Your city&apos;s fee is a number you can look up, so look
          it up.
        </li>
        <li>
          Panel capacity. If the calculation fails, stop and quote the service
          work separately. A 200-amp conversation has its own method in{" "}
          <Link
            href="/blog/what-to-charge-200a-panel-upgrade"
            className={link}
          >
            what to charge for a 200A panel upgrade
          </Link>
          .
        </li>
        <li>
          What is not included: trenching you have not seen, a mast, drywall,
          a second trip because the car or the charger was not on site.
        </li>
      </ul>
      <p>
        The National Electrical Code covers this equipment in Article 625 of
        NFPA 70. The code is not reprinted here, and it is adopted with local
        amendments. The copy that matters is the one your inspector uses. The
        catalog entry is on the{" "}
        <a
          href="https://www.nfpa.org/codes-and-standards/nfpa-70-standard-development/70"
          className={link}
        >
          NFPA 70 page
        </a>
        . Your quote should say you will install to the adopted code, not
        that a blog post cleared the job.
      </p>

      <h2>Level 1 is sometimes the whole answer</h2>
      <p>
        The{" "}
        <a
          href="https://afdc.energy.gov/fuels/electricity-charging-home"
          className={link}
        >
          AFDC home-charging page
        </a>{" "}
        notes that many owners can cover daily driving with the Level 1 cord
        that came with the vehicle, if a suitable outlet is already near where
        they park. Level 2 is the ask when the battery, the commute, or the
        schedule does not fit overnight on 120 volts. Quoting a Level 2
        install for a customer who needed a receptacle you can see from the
        panel is how you lose the job to someone who looked.
      </p>
      <p>
        If you do quote Level 2, write the supply as 240-volt equipment in
        words they already used, and write the circuit as a line. Do not sell
        &ldquo;a charger&rdquo; as if the wire were free.
      </p>

      <h2>How to talk about the published range</h2>
      <p>
        Customers remember one number. You remember a garage that is forty
        feet from the panel. Put the measurement on the quote so the number
        has a reason. &ldquo;Forty feet of circuit from the main panel to the
        garage wall, permit included, charger by owner&rdquo; beats
        &ldquo;EV charger install&rdquo; even when the total is higher than
        the median in a 2022 report.
      </p>
      <p>
        If your total lands far from that median, you do not owe them an
        apology. You owe them the lines. A short run with spare breaker space
        can land under the median. A service change will not look like a
        charger price, and it should not be forced to. State incentives, if
        any, are their homework or a link you trust. Do not subtract a rebate
        you do not administer from the price you need to get paid.
      </p>

      <h2>What to measure before you leave the garage</h2>
      <p>
        The studies are a list of things that moved cost in someone else&apos;s
        jobs. Your quote gets good when those things are measurements, taken
        while you are still there.
      </p>
      <ul className="list-disc space-y-2 pl-5">
        <li>Where the car parks, and which wall the charger would actually hang on. Not the wall they first pointed at if the cable will not reach the port.</li>
        <li>The path from the panel to that wall: up, across, down, and every finished surface you would rather not open.</li>
        <li>Spare spaces and the size of the service. If the panel is full, that is a separate quote.</li>
        <li>Who is buying the charger, the model if they already own it, and whether it is on site for the install day.</li>
        <li>The permit office&apos;s fee and whether they want a load calculation attached. Look it up. Do not inherit it from a national percentage.</li>
        <li>Anything in the way: a water heater, a finished ceiling, a driveway you would have to trench. If you did not see it, exclude it.</li>
      </ul>
      <p>
        Read the list back in one sentence before you type the total.
        &ldquo;Forty feet, surface conduit on the garage wall, your charger,
        permit included, no panel work.&rdquo; If you cannot say the sentence,
        you are about to send an estimate. Send the estimate. A firm number
        with a hole in the path is the number you will eat.
      </p>
      <p>
        Then put the sentence on the quote, above the lines, so the customer
        accepts the path and not a vibe called &ldquo;EV charger.&rdquo; When
        the inspector or the next driver asks what was included, the page
        answers. Your memory of the garage will not.
      </p>

      <h2>Put it on a page they can accept</h2>
      <p>
        An EV quote that sits in a text thread gets compared with a national
        median and dies. An itemized quote, with the feet and the exclusions,
        gets accepted or it gets a real question. Send it before you leave if
        you have the path measured. That habit is{" "}
        <Link
          href="/blog/how-to-write-an-electrical-quote-on-your-phone"
          className={link}
        >
          how to write an electrical quote on your phone
        </Link>
        . The labor rate behind the hours is not the federal wage statistic.
        What that statistic is, and what it is not, is in{" "}
        <Link href="/blog/how-to-build-an-electrical-pricebook" className={link}>
          how to build an electrical pricebook
        </Link>
        .
      </p>

      <h2>Sources</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <a
            href="https://afdc.energy.gov/fuels/electricity-infrastructure-development"
            className={link}
          >
            AFDC, procurement and installation
          </a>
          . Level 2 residential hardware $380 to $690. Level 2 installation
          about $1,300 per connector, not including labor and permitting.
        </li>
        <li>
          <a
            href="https://afdc.energy.gov/fuels/electricity-charging-home"
            className={link}
          >
            AFDC, charging at home
          </a>
          . Level 1 as the cord that came with the car, when an outlet is
          already suitable. Level 2 as 240-volt equipment.
        </li>
        <li>
          <a href="https://www.osti.gov/servlets/purl/1887854" className={link}>
            INL/RPT-22-68598 (August 2022)
          </a>
          . Median installation $1,098, average $1,310, range about $150 to
          about $18,000, about $12 per foot, about $2,600 when a service
          upgrade was required, permits averaging 3.5%, electrician time
          averaging 5.4 hours.
        </li>
        <li>
          <a
            href="https://www.nfpa.org/codes-and-standards/nfpa-70-standard-development/70"
            className={link}
          >
            NFPA 70
          </a>
          . Article 625 is the EV charging equipment article. Follow the
          edition your jurisdiction adopted.
        </li>
      </ul>
    </PostFrame>
  );
}