import type { Metadata } from "next";
import Link from "next/link";

import { QuoteAnatomyFigure } from "@/components/blog/quote-anatomy-figure";
import { QuoteWorkflowFigure } from "@/components/blog/quote-workflow-figure";
import { Prose } from "@/components/landing/page-shell";
import { formatPostDate, getPost } from "@/lib/blog";

const post = getPost("how-to-quote-electrical-work")!;

export const metadata: Metadata = {
  title: `${post.title} — QuotePace`,
  description: post.description,
  alternates: { canonical: `/blog/${post.slug}` },
  openGraph: {
    type: "article",
    title: post.title,
    description: post.description,
    publishedTime: post.publishedAt,
  },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: post.title,
  description: post.description,
  datePublished: post.publishedAt,
  author: { "@type": "Organization", name: "QuotePace" },
  publisher: { "@type": "Organization", name: "QuotePace" },
};

const MATERIALS = [
  "Cable and wiring",
  "Outlets and switches",
  "Breakers",
  "Boxes and fittings",
  "Light fixtures",
  "Panels",
  "Fasteners and consumables",
  "Permits and inspection",
];

export default function Post() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <p className="flex items-center gap-2 text-xs text-ink-60">
        <Link href="/blog" className="text-brand hover:underline">
          Blog
        </Link>
        <span aria-hidden>·</span>
        <time dateTime={post.publishedAt}>
          {formatPostDate(post.publishedAt)}
        </time>
        <span aria-hidden>·</span>
        <span>{post.readingMinutes} min read</span>
      </p>

      <h1 className="mt-4 text-4xl font-semibold text-balance sm:text-5xl">
        {post.title}
      </h1>

      <p className="mt-5 text-lg text-pretty text-body">
        Writing the quote often takes longer than working out the price. You
        have to understand the request, cost the labor and materials, cover the
        overhead, decide the markup, and put it on a page the customer can
        actually agree to. Here is a process that does all of that, in order.
      </p>

      <div className="rounded-card mt-8 bg-brand-wash p-6">
        <p className="text-pretty text-ink-90">
          <strong>The short answer:</strong> a good electrical quote is a scope,
          a number, and the edges. Write what is included before you price it.
          Build labor, materials, overhead, and profit as separate lines. Say
          what is not included. Send it the same day. The seven steps below are
          that, unpacked.
        </p>
      </div>

      <Prose>
        <h2>1. Write the scope before you price it</h2>
        <p>
          Before any numbers, write down exactly what you are quoting. For a
          residential job that might be outlets, fixtures, a new circuit, a
          panel upgrade, an EV charger, or a larger renovation. What it must not
          be is &ldquo;electrical work&rdquo; or &ldquo;fix wiring.&rdquo; Those
          phrases tell the customer nothing about what the price covers, which
          is how arguments start after the walls are open.
        </p>
        <p>Describe the work in the language you would use on the driveway:</p>
        <blockquote className="border-l-2 border-brand pl-4 font-serif text-lg text-ink-90">
          Install six recessed LED lights in the kitchen, including wiring,
          fixtures, and testing.
        </blockquote>
        <p>
          A clear scope is also a record. Current quoting guides keep repeating
          the same advice for a reason: document the work, the materials, the
          labor, the assumptions, and the exclusions, so both sides can see what
          the price is for.
        </p>

        <h2>2. Price the labor for the whole day, not the install</h2>
        <p>
          Labor is usually the largest line, and the easiest to undercount.
          Estimate how long the work should take, then add the time that is not
          install: travel, preparation, isolation, collecting materials,
          testing, cleanup. If you only bill the minutes the screwdriver is
          turning, you are donating the rest of the day.
        </p>
        <p>
          Pick the method that matches how predictable the work is. Repetitive
          jobs — a run of outlets, a set of lights — often price cleanly per
          item. Uncertain work, such as troubleshooting, is safer as an hourly
          rate. Fixed price is fine when you have done the job enough times to
          know the day. The method is not a philosophy. It is a match to the job
          in front of you.
        </p>

        <h2>3. List the materials at your cost</h2>
        <p>
          Write down everything the job actually needs, then price it from what
          you pay, not from a list price you have not seen in years. If you mark
          materials up, use the same method every time so the quote is
          consistent and you can defend it.
        </p>
        <ul className="grid list-none grid-cols-1 gap-2 sm:grid-cols-2">
          {MATERIALS.map((item) => (
            <li
              key={item}
              className="rounded-lg border border-black/8 bg-surface px-3 py-2 text-sm text-ink-90"
            >
              {item}
            </li>
          ))}
        </ul>
        <p>
          On a larger job, grouping materials into categories — rough-in,
          finish, panel gear — makes the estimate easier to review before it
          goes out. A flat lump called &ldquo;materials&rdquo; is how things get
          missed.
        </p>

        <h2>4. Cover overhead, then add profit</h2>
        <p>
          The quote has to cover more than the direct cost of doing the work.
          Insurance, the van, tools, software, licensing, and the hours you
          spend quoting jobs you do not win all sit in the number whether you
          write them down or not. If you leave them off, they still get paid —
          out of the profit you thought you had.
        </p>
        <div className="rounded-card border border-black/8 bg-surface px-5 py-4">
          <p className="text-xs font-medium tracking-[0.08em] text-ink-60 uppercase">
            The selling price
          </p>
          <p className="mt-2 text-lg font-semibold text-balance text-ink-90">
            Materials + Labor + Overhead + Profit
          </p>
          <p className="mt-2 text-sm text-pretty text-body">
            The exact shares are yours. Local rates, experience, complexity, and
            what it costs to keep the lights on in the shop all move the number.
            The order is the part that should not move: margin goes on last, so
            it is not the first thing you shave.
          </p>
        </div>
        <p>
          For a worked example of this build-up on a specific job, see{" "}
          <Link
            href="/blog/what-to-charge-200a-panel-upgrade"
            className="text-brand hover:underline"
          >
            what to charge for a 200A panel upgrade.
          </Link>
        </p>

        <h2>5. Draw the line around what is not included</h2>
        <p>
          Electrical work hides things. Concealed damage, extra wiring behind a
          wall, a ground that was legal in 1974 — none of that belongs in your
          margin as a guess. It belongs in the exclusions, with a plain sentence
          that additional work needs the customer&apos;s approval before it is
          charged.
        </p>
        <p>
          This matters most on troubleshooting and renovation, where the final
          scope is not fully visible when you write the quote. A customer who
          already knows the edges is a customer who does not feel ambushed when
          you find them.
        </p>

        <h2>6. Write it so they can read it</h2>
        <p>
          A professional quote is not a number with a logo on it. It is a
          document the customer can take to the kitchen table and still
          understand. Itemizing also makes it easier for them to compare you
          with the other two quotes they asked for — which they will.
        </p>

        <QuoteAnatomyFigure />

        <h2>7. Send it while they are still deciding</h2>
        <p>
          Speed is part of the quote. If someone asks on Monday and the document
          arrives on Thursday, they may already have hired the electrician who
          answered on Monday night. The quality of the number still matters. So
          does being in the pile when they pick.
        </p>
        <p>
          That is why most shops that quote well do not start from a blank page.
          They keep common services, prices, and customer details somewhere
          reusable — a template, a pricebook, estimating software — and adjust
          the job in front of them instead of rebuilding the document every
          time.
        </p>

        <h2>The same process, every job</h2>
        <p>
          Once the sequence is a habit, quoting stops being a blank page and
          starts being a checklist you can run from the van.
        </p>

        <QuoteWorkflowFigure />

        <p>
          If you are still building every estimate in a spreadsheet, a dedicated
          quoting tool is the practical next step: services, prices, customers,
          and templates in one place, a reusable quote you adjust rather than
          rewrite, and a link you can send before you leave the driveway. That
          is what{" "}
          <Link href="/" className="text-brand hover:underline">
            QuotePace
          </Link>{" "}
          is for. The thinking above is yours. We are the thing that stops you
          doing it twice.
        </p>
      </Prose>
    </main>
  );
}
