import type { Metadata } from "next";
import Link from "next/link";

import { PageShell } from "@/components/landing/page-shell";
import { BLOG_POSTS, formatPostDate } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog — QuotePace",
  description:
    "Writing about quoting, pricing, and winning residential electrical work — from the contractor's side of the job, not the homeowner's.",
};

export default function BlogPage() {
  return (
    <PageShell
      eyebrow="Blog"
      title="Pricing and quoting, from the van."
      standfirst="What wins residential electrical work and what loses it. Written for the person doing the quoting, which is more than can be said for most of what ranks."
    >
      <ul className="space-y-4">
        {BLOG_POSTS.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="rounded-card block border border-black/8 bg-surface p-6 transition-colors hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
            >
              <p className="flex items-center gap-2 text-xs text-ink-60">
                <time dateTime={post.publishedAt}>
                  {formatPostDate(post.publishedAt)}
                </time>
                <span aria-hidden>·</span>
                <span>{post.readingMinutes} min read</span>
              </p>
              <h2 className="mt-2 text-xl font-semibold text-balance text-ink-90">
                {post.title}
              </h2>
              <p className="mt-2 text-pretty text-body">{post.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
