import Link from "next/link";

import { FreeQuoteTool } from "@/components/free-quote/free-quote-tool";
import { Prose } from "@/components/landing/page-shell";
import { Button } from "@/components/ui/button";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Free Electrical Quote Template — QuotePace",
  description:
    "Free electrical quote template. Fill in the lines, preview the electrician quote, and download a PDF. No account.",
  path: "/free-electrical-quote-template",
});

export default function FreeElectricalQuoteTemplatePage() {
  return (
    <div className="quote-template mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <div className="no-print mx-auto max-w-3xl">
        <p className="inline-flex rounded-pill bg-brand-wash px-2.5 py-1 text-xs font-medium tracking-[0.08em] text-brand uppercase">
          Free tool
        </p>
        <h1 className="mt-4 text-4xl font-semibold text-balance sm:text-5xl">
          Free electrical quote template
        </h1>
        <p className="mt-5 text-lg text-pretty text-body">
          An electrician quote template you can fill in on your phone, with a
          live preview and a PDF. No account. Use it as an electrical estimate
          template when you need a number out the door today, then keep the
          prices you actually charge.
        </p>
      </div>

      <FreeQuoteTool />

      <div className="no-print mx-auto mt-12 max-w-3xl">
        <div className="rounded-lg border border-hairline bg-surface p-5 sm:p-6">
          <p className="text-pretty text-ink-90">
            Want to send this as a link they can accept on their phone, and
            know when they open it? Do it free in QuotePace.
          </p>
          <Button asChild size="lg" className="mt-4 w-full sm:w-auto">
            <Link href="/register">Send your first quote free</Link>
          </Button>
        </div>

        <Prose>
          <h2>What to put on an electrical quote</h2>
          <p>
            A quote is the document the customer says yes to. An estimate is
            the number you are still working out. If you send one page and call
            it both, say which it is. A firm quote names the work, the price,
            and what would change the price. An estimate that looks finished
            is how you end up doing work you never priced.
          </p>
          <p>
            Start with who is quoting and who it is for. Your business name,
            a phone number, and the customer&apos;s name. Add the job address
            when you have it. A quote with no address is easy to mix up with
            the other kitchen you looked at this week.
          </p>
          <p>
            Then write the work in the words you would use in the driveway.
            &ldquo;Install six recessed lights in the kitchen, including wiring,
            fixtures, and testing&rdquo; is a scope. &ldquo;Electrical
            work&rdquo; is not. The customer has to be able to read it at the
            kitchen table and know what the money covers.
          </p>
          <p>
            Price it in lines, not one lump. Each line needs a description, a
            quantity, and your price. Split labor and materials when you can.
            A panel swap, a permit, and a trip are different lines, because
            they fail in different ways. If the fixture is customer-supplied,
            say so on that line so you are not buying it later out of the labor.
          </p>
          <p>
            Tax depends on the state and on whether the job is a repair or an
            improvement. Do not copy a rate from another city. If you charge
            tax, show it. If you do not, say the price is the price.
          </p>
          <h2>The edges are part of the price</h2>
          <p>
            Write what is not included. Concealed damage, drywall, a mast that
            has rusted through, a ground that was legal when the house was
            built, a second trip for an inspection. Those are not a surprise
            you eat. They are the next quote, if the customer wants them.
          </p>
          <p>
            Say how long the price holds. Thirty days is a common habit. It is
            not a rule. If copper or a panel moves, a short validity is how you
            avoid doing tomorrow&apos;s job at last month&apos;s cost.
          </p>
          <p>
            Use your own numbers. A template does not know your hourly rate,
            your supplier, or what the last job like this actually took. If a
            line is a guess, mark it as a guess or leave it off until you have
            looked. A blank price is safer than a confident one you cannot
            defend.
          </p>
          <h2>Checklist before you send it</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>Your business name and a way to reach you.</li>
            <li>Customer name, and the job address if you have it.</li>
            <li>The work, written so they can tell what is included.</li>
            <li>A line for each task, with quantity and your price.</li>
            <li>Labor and materials separated when they are not the same thing.</li>
            <li>Permit and inspection, if this job needs them.</li>
            <li>What is not included, in plain language.</li>
            <li>Tax, or a note that the price does not add it.</li>
            <li>How long the price is good for.</li>
            <li>A place for them to accept, if this is a quote and not a guess.</li>
          </ul>
          <p>
            Read it once as if you were the customer. If a line could mean two
            different jobs, rewrite it. If a price is a placeholder, do not
            send it. The template only prints what you typed.
          </p>
          <p>
            This page builds the document. It does not save it, and it does not
            tell you when they open it. When you want that, the same lines go
            out as a link from QuotePace, on your phone, with your prices.
          </p>
        </Prose>
      </div>
    </div>
  );
}
