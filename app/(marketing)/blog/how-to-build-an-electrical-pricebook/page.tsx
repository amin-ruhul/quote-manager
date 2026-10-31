import type { Metadata } from "next";
import Link from "next/link";

import { PostFrame } from "@/components/blog/post-frame";
import { getPost } from "@/lib/blog";
import { pageMetadata } from "@/lib/seo";

const post = getPost("how-to-build-an-electrical-pricebook")!;

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
      lede="A good electrical pricebook is the reason some electricians can quote on site in a few minutes instead of spending a night at the kitchen table. A short list of your prices, in units you can count, beats a folder of old invoices."
      answer="List the jobs you actually sell. Give each one a unit you can count on site: each, opening, foot, or hour. Store your price, not a national average. Keep labor and material as separate lines when they move for different reasons. Review the list when your supplier or your insurance changes, not every Sunday out of guilt."
      faq={[
        {
          question: "How many items should the first version have?",
          answer:
            "The twenty things you quoted last month. A pricebook of three hundred lines you have never sold is not one you will use on site. Add a line the second time you type it from scratch.",
        },
        {
          question: "Should the pricebook be labor only?",
          answer:
            "No. Store both, and do not mash them into one number unless you have done that exact job enough times to know the mash still works. Material moves when the supplier moves. Labor moves when the house is harder than the last one.",
        },
        {
          question: "Is the government wage my hourly rate?",
          answer:
            "No. The Bureau of Labor Statistics publishes what employed electricians earn. That is not a billable rate, it excludes most self-employed people, and it is not a price for a customer.",
        },
        {
          question: "What if a job is not on the list?",
          answer:
            "Price it as hours plus material, write down the assumptions, and add a unit price later if you do it again. Do not force a strange job into a line that means something else.",
        },
      ]}
    >
      <h2>What a pricebook is</h2>
      <p>
        A pricebook is the list you quote from so you are not inventing a
        number in front of the customer. Each row is something you can point
        at: an outlet, a foot of circuit, an hour of troubleshooting, a permit
        trip. The row has your price. The quote is a stack of rows, plus the
        sentences that say what the stack does not include.
      </p>
      <p>
        It is not a menu you hand the customer, and it is not a software
        feature. Software can hold it. The list is still the prices you are
        willing to work for. QuotePace stores that list and drops the lines
        onto a quote. It will not decide them.
      </p>

      <h2>The columns that earn their keep</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-black/8">
              <th className="py-2 pr-3 font-medium text-ink-60">Column</th>
              <th className="py-2 font-medium text-ink-60">What you put there</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-black/8">
              <td className="py-2 pr-3">Name</td>
              <td className="py-2">
                Words you would say in the driveway. &ldquo;Recessed light,
                open attic.&rdquo;
              </td>
            </tr>
            <tr className="border-b border-black/8">
              <td className="py-2 pr-3">Unit</td>
              <td className="py-2">Each, opening, foot, or hour. One unit per row.</td>
            </tr>
            <tr className="border-b border-black/8">
              <td className="py-2 pr-3">Your price</td>
              <td className="py-2">
                What you charge for one unit, built from your cost and the
                margin you mean to keep.
              </td>
            </tr>
            <tr className="border-b border-black/8">
              <td className="py-2 pr-3">Tax</td>
              <td className="py-2">
                Whether this line is taxed in your state. Do not guess from a
                neighboring city.
              </td>
            </tr>
            <tr>
              <td className="py-2 pr-3">Note</td>
              <td className="py-2">
                The assumption. &ldquo;Open attic. Not a finished ceiling
                below.&rdquo;
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        If the note is doing too much work, you need two rows. &ldquo;Recessed
        light, open attic&rdquo; and &ldquo;recessed light, finished ceiling,
        from below&rdquo; are different days. One row with a shrug in the note
        is how the second job loses money.
      </p>

      <h2>Units you can count without a tape argument</h2>
      <p>
        Each, for a device you can touch: a receptacle, a switch, a smoke
        alarm, a charger. Opening, for a light, because the can and the trim
        and the wire to that hole travel together often enough to price as
        one, with the weird ceilings split out. Foot, for a circuit run,
        because a garage forty feet from the panel is not the same row as a
        garage on the other side of the wall. Hour, for troubleshooting and
        for anything you cannot see yet.
      </p>
      <p>
        Do not store &ldquo;kitchen&rdquo; or &ldquo;house rewire&rdquo; as a
        unit. Those are quotes, made of units. A pricebook row that says
        kitchen will be wrong on the next kitchen.
      </p>

      <h2>Labor, material, and the wage that is not your rate</h2>
      <p>
        Build a labor row from the time the job actually takes, including the
        drive, the supply house, and the test. Then decide what an hour of
        your work has to bring in so the business still works after insurance,
        the truck, and the weeks that are thin. That number is yours.
      </p>
      <p>
        The{" "}
        <a
          href="https://www.bls.gov/ooh/construction-and-extraction/electricians.htm"
          className={link}
        >
          Bureau of Labor Statistics
        </a>{" "}
        reported a median wage for electricians of $29.98 an hour in May 2024,
        or $62,350 a year. The lowest 10 percent earned less than $39,430 and
        the highest 10 percent earned more than $106,030. Read the footnote in
        spirit even when you do not open it: this is pay to employees, the
        survey is not a bill for a homeowner, and a self-employed contractor&apos;s
        books are a different document. If your pricebook&apos;s labor row is
        $29.98, you have priced the job as if you were the employee and
        someone else owned the truck.
      </p>
      <p>
        Material rows should start from the invoice you pay, plus the waste
        and the small parts you never write down: connectors, screws, the
        breaker you keep on the van. A row priced at last year&apos;s shelf
        tag will quietly subsidize the supplier.
      </p>

      <h2>What does not belong on the list</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>A price you copied from a forum or a homeowner article.</li>
        <li>A single &ldquo;service call&rdquo; that mixes showing up, diagnosing, and the repair. Those are three prices, explained in{" "}
          <Link
            href="/blog/what-to-charge-for-an-electrical-service-call"
            className={link}
          >
            what to charge for an electrical service call
          </Link>
          .
        </li>
        <li>Options mashed together. Good, better, and best are bundles of rows, built when you quote, not a fourth kind of unit.</li>
        <li>Someone else&apos;s logo, terms, or tax rate.</li>
      </ul>

      <h2>Keep it true without a weekly ritual</h2>
      <p>
        A pricebook dies when it becomes a project. You do not need a Sunday
        review. You need a rule for the moment a price is wrong.
      </p>
      <ul className="list-disc space-y-2 pl-5">
        <li>When the supplier changes a part you sell often, change that row before the next quote, not after the next argument.</li>
        <li>When a job loses money for a reason you will see again, split the row. Do not average the pain into the old price and hope.</li>
        <li>When you type a description from scratch twice, add the row. Once is a strange house. Twice is a product you sell.</li>
        <li>When tax rules change where you work, fix the tax flag. A wrong flag is a quiet discount or a quiet overcharge, and neither feels quiet later.</li>
        <li>When a helper starts quoting, they use the rows. They do not get a private version in their head. One list is the point.</li>
      </ul>
      <p>
        Leave a note on the row when you change it: the date, and the reason,
        in a few words. Next winter you will not remember why the attic light
        went up. The note will. If the note is &ldquo;felt like it,&rdquo; the
        row is not finished.
      </p>
      <p>
        Resist importing someone else&apos;s spreadsheet from a forum, even as
        a start. Their unit is not your unit. Their insurance is not on your
        truck. A short list you built from your own last month of work will
        beat a long list you do not believe, because you will actually tap it
        on site. Where you keep the list matters much less than trusting
        it.
      </p>

      <h2>Make the first list this week</h2>
      <p>
        Pull the last month of quotes, or the last month of invoices if that
        is what you have. Write the twenty lines that repeat. Give them units
        and your current price. Put the assumptions in the note while you
        still remember why the price was that price. The rest of the trade can
        wait until a job forces a new row.
      </p>
      <p>
        Then use it on the next visit, in the driveway, before the details
        fade. The sequence for that visit is{" "}
        <Link
          href="/blog/how-to-write-an-electrical-quote-on-your-phone"
          className={link}
        >
          how to write an electrical quote on your phone
        </Link>
        . If the list is still in a spreadsheet, that is fine until the
        spreadsheet is why the quote goes out at 9 p.m. The point of the list
        is the quote the same day, which is the subject of{" "}
        <Link
          href="/blog/how-fast-should-you-send-an-electrical-quote"
          className={link}
        >
          how fast should you send an electrical quote
        </Link>
        .
      </p>

      <h2>How a quote uses the row</h2>
      <p>
        In the driveway you should not be doing math you have not already
        done. You pick the row, you enter the count, and the line total is
        count times your price. If the house is harder than the note on the
        row, you do not silently raise the count to hide the difficulty. You
        add a second line: tight attic, finished ceiling, a second trip. The
        customer can see the reason. You can see it next month when you wonder
        why that job felt long.
      </p>
      <p>
        Tax sits on the quote, not in the row&apos;s price. A row that has tax
        baked in will be wrong the day the rate changes, and it will be wrong
        on a tax-exempt job. Keep the price as the price. Let the quote apply
        the rate you checked. The same idea covers a discount. Do not keep a
        secret cheap row for people who flinch. If you are going to charge
        less, show a smaller scope. The pricebook stays the honest list, and
        the quote is where this house differs.
      </p>

      <h2>Sources</h2>
      <p>
        Wage figures are from the{" "}
        <a
          href="https://www.bls.gov/ooh/construction-and-extraction/electricians.htm"
          className={link}
        >
          BLS Occupational Outlook Handbook, electricians
        </a>
        , May 2024 median of $29.98 an hour and $62,350 a year. Use them as a
        description of employee pay, not as a line on a quote.
      </p>
    </PostFrame>
  );
}