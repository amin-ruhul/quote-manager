import type { Metadata } from "next";
import Link from "next/link";

import { PriceBuildupFigure } from "@/components/blog/price-buildup-figure";
import { Prose } from "@/components/landing/page-shell";
import { formatPostDate, getPost } from "@/lib/blog";

const post = getPost("what-to-charge-200a-panel-upgrade")!;

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

/*
 * Schema.org Article, so the post can be attributed in a search result or an AI
 * answer. Kept inline rather than abstracted — there is one post.
 */
const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: post.title,
  description: post.description,
  datePublished: post.publishedAt,
  author: { "@type": "Organization", name: "QuotePace" },
  publisher: { "@type": "Organization", name: "QuotePace" },
};

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
        Search that phrase and every result on the first page is a homeowner
        cost guide. Useful for knowing what your customer read before you got
        there. Useless for pricing the job in front of you. Here is the other
        side of it.
      </p>

      <div className="rounded-card mt-8 bg-brand-wash p-6">
        <p className="text-pretty text-ink-90">
          <strong>The short answer:</strong> there is no national figure you can
          safely copy. Published 2026 guides put a 100A→200A upgrade between
          $1,500 and $4,000 — and the same guides report the price varying
          30–50% between contractors in one market. That spread is the whole
          problem. Build the number from your own costs instead. The method is
          below.
        </p>
      </div>

      <Prose>
        <h2>What your customer read before you arrived</h2>
        <p>
          Assume they searched it. These are the ranges the big consumer sites
          were publishing in 2026, and the numbers already sitting in your
          customer&apos;s head when you walk up the drive:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-black/8">
                <th className="py-2 pr-4 font-medium text-ink-60">Job</th>
                <th className="py-2 font-medium text-ink-60">
                  Published range
                </th>
              </tr>
            </thead>
            <tbody className="tabular-nums">
              <tr className="border-b border-black/8">
                <td className="py-2 pr-4">100A → 200A service upgrade</td>
                <td className="py-2">$1,500 – $4,000</td>
              </tr>
              <tr className="border-b border-black/8">
                <td className="py-2 pr-4">Panel swap, same amperage</td>
                <td className="py-2">$1,200 – $2,500</td>
              </tr>
              <tr className="border-b border-black/8">
                <td className="py-2 pr-4">100A subpanel</td>
                <td className="py-2">$500 – $1,500</td>
              </tr>
              <tr className="border-b border-black/8">
                <td className="py-2 pr-4">Permit</td>
                <td className="py-2">$50 – $300</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Quoted labor</td>
                <td className="py-2">$50 – $150 / hr</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-ink-60">
          Ranges as published by HomeAdvisor, Angi and similar consumer cost
          guides, 2026. They describe a national market, not yours.
        </p>

        <h2>Why you can&apos;t just copy the average</h2>
        <p>
          An average is a bad instrument for three reasons, and all three cost
          you money in the same direction.
        </p>
        <p>
          <strong>It is describing a different job.</strong> The published range
          blends the clean swap where the meter stays put with the one that
          needs a new mast, a relocated meter base, and grounding brought up to
          current code. Those are not the same day&apos;s work and they should
          not be the same price.
        </p>
        <p>
          <strong>It is describing a different market.</strong> Your loaded
          labor cost is set by what you pay, what insurance costs where you are,
          and what your permit office charges. A national midpoint knows none of
          that.
        </p>
        <p>
          <strong>It is describing a different electrician.</strong> If you
          match the average, you have quietly accepted the margin of whichever
          shop in that sample most needed the work that month. That shop is not
          necessarily still trading.
        </p>

        <h2>Build the number instead</h2>
        <p>
          The build-up is five lines, in this order. The order is the point:
          margin goes on last, which is what stops it becoming the thing you
          shave when a customer pauses.
        </p>

        <PriceBuildupFigure />

        <p>
          Two of those lines are the ones people get wrong.{" "}
          <strong>Labor</strong> is hours multiplied by your <em>loaded</em>{" "}
          rate — the wage plus payroll taxes, insurance, the van, the phone, the
          license. If you are multiplying by what you pay an apprentice per
          hour, you are billing out at a loss and calling it competitive.{" "}
          <strong>Overhead recovery</strong> is this job&apos;s share of the
          costs that exist whether or not you win it, including the hours you
          spend quoting jobs you don&apos;t get. Spread your annual overhead
          across the jobs you realistically bill in a year. That number is
          usually larger than people expect the first time they work it out.
        </p>

        <h2>The three line items that get left off</h2>
        <p>
          <strong>1. The inspection wait.</strong> The permit fee is easy to
          remember because it is an invoice. The half-day someone stands around
          waiting for the inspector is not, because it is only time — and time
          is the thing you are actually selling.
        </p>
        <p>
          <strong>2. Make-safe and temporary power.</strong> The house is dead
          while you work. If the customer needs the refrigerator running, or you
          need to pull and reset the meter with the utility, that is scheduling
          and it is labor.
        </p>
        <p>
          <strong>3. Whatever is behind the panel.</strong> Drywall to open and
          make good, a service mast that has rusted through, grounding that was
          legal in 1974. You cannot price what you cannot see, which is exactly
          why it belongs in the exclusions rather than in your margin.
        </p>

        <h2>Quote one number, then say what would change it</h2>
        <p>
          A range on a quote reads as uncertainty, and uncertainty is what makes
          a customer get two more prices. Give one firm figure for the work you
          can see, then list plainly what would change it — mast replacement,
          meter relocation, concealed damage, an inspection re-visit. You have
          not hedged. You have told them you have done this before and you know
          where the surprises live.
        </p>

        <h2>Then write it down, once</h2>
        <p>
          The real cost of pricing this way is that it takes an evening, and
          most electricians do it from memory afterwards anyway because the
          evening is gone. It only pays off if the build-up outlives the job:
          saved as a priced item you reuse, adjusted when your supplier prices
          move, and applied the same way to the next panel upgrade whether you
          are quoting it on Monday morning or from the driveway on a Friday.
        </p>
        <p>
          That is the whole idea behind{" "}
          <Link href="/" className="text-brand hover:underline">
            QuotePace
          </Link>
          : your prices, written down once, assembled into a quote in a few
          minutes on your phone, and sent before you leave. The pricing thinking
          above is yours and always will be — we are just the thing that stops
          you doing it twice.
        </p>
      </Prose>

      <hr className="mt-12 border-black/8" />
      <p className="mt-6 text-sm text-ink-60">
        Figures in the worked example are illustrative. Nothing here is a
        recommendation to charge a particular price — that is yours to set, and
        in most places it is illegal for competitors to set it together.
      </p>
    </main>
  );
}
