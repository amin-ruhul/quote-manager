import type { Metadata } from "next";
import Link from "next/link";

import { BlogCta } from "@/components/blog/blog-cta";
import { PriceBuildupFigure } from "@/components/blog/price-buildup-figure";
import { RelatedPosts } from "@/components/blog/related-posts";
import { Prose } from "@/components/landing/page-shell";
import { articleJsonLd, formatPostDate, getPost } from "@/lib/blog";
import { pageMetadata } from "@/lib/seo";

const post = getPost("what-to-charge-200a-panel-upgrade")!;

export const metadata: Metadata = pageMetadata({
  title: `${post.title} — QuotePace`,
  description: post.description,
  path: `/blog/${post.slug}`,
  type: "article",
  publishedTime: post.publishedAt,
  // This folder's opengraph-image.tsx is the share card, not the site default.
  ownShareImage: true,
});

export default function Post() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd(post)).replace(/</g, "\\u003c"),
        }}
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
        there, but no help when you are the one pricing the job. This post is
        written for the electrician.
      </p>

      <div className="rounded-card mt-8 bg-brand-wash p-6">
        <p className="text-pretty text-ink-90">
          <strong>The short answer:</strong> there is no national figure you can
          safely copy. A consumer cost page mixes a clean panel swap with a new
          mast, a moved meter, and a grounding upgrade, then prints one range.
          Those are different jobs. Build the number from your own costs. The
          method is below.
        </p>
      </div>

      <BlogCta />

      <Prose>
        <h2>What your customer read before you arrived</h2>
        <p>
          Assume they searched it. The first page is written for the homeowner,
          and it offers one national range for &ldquo;panel upgrade.&rdquo; That
          phrase covers a same-day swap and a service change that needs the
          utility. The customer has a number in their head. You do not have to
          match a number nobody sourced to your city.
        </p>
        <p>
          Ask which job they think they bought. Same amperage, or a step up to
          200A. Meter staying put, or moving. Mast, grounding, and the drywall
          around the panel: in the price, or not. Once those are separate
          lines, the argument about &ldquo;the average&rdquo; is over, because
          you are no longer quoting the average job.
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
          The build-up is five lines, in this order. Margin goes on last on
          purpose, which is what stops it becoming the thing you
          shave when a customer pauses.
        </p>

        <PriceBuildupFigure />

        <p>
          Two of those lines are the ones people get wrong.{" "}
          <strong>Labor</strong> is hours multiplied by your <em>loaded</em>{" "}
          rate: the wage plus payroll taxes, insurance, the van, the phone, the
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
          waiting for the inspector is not, because it is only time, and time
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
          can see, then list plainly what would change it: mast replacement,
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
          That is what{" "}
          <Link href="/" className="text-brand hover:underline">
            QuotePace
          </Link>
{" "}
          is for. You write your prices down once, build a quote from them in a
          few minutes on your phone, and send it before you leave. The pricing
          decisions are still yours. QuotePace just saves you from doing them
          twice.
        </p>
      </Prose>

      <BlogCta />
      <RelatedPosts slug={post.slug} />

      <hr className="mt-12 border-black/8" />
      <p className="mt-6 text-sm text-ink-60">
        Figures in the worked example are illustrative. Nothing here is a
        recommendation to charge a particular price. That is yours to set, and
        in most places it is illegal for competitors to set it together.
      </p>
    </main>
  );
}
