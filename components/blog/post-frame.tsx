import type { ReactNode } from "react";
import Link from "next/link";

import { BlogCta } from "@/components/blog/blog-cta";
import { RelatedPosts } from "@/components/blog/related-posts";
import { Prose } from "@/components/landing/page-shell";
import { articleJsonLd, formatPostDate, type BlogPost } from "@/lib/blog";

export type FaqItem = {
  question: string;
  answer: string;
};

/**
 * Article chrome shared by the search posts: dateline, short answer, the ask,
 * the body, a FAQ with schema, and the ask again.
 */
export function PostFrame({
  post,
  lede,
  answer,
  children,
  faq,
}: {
  post: BlogPost;
  lede: ReactNode;
  answer: ReactNode;
  children: ReactNode;
  faq: FaqItem[];
}) {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

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
        <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
        <span aria-hidden>·</span>
        <span>{post.readingMinutes} min read</span>
      </p>

      <h1 className="mt-4 text-4xl font-semibold text-balance sm:text-5xl">
        {post.title}
      </h1>

      <p className="mt-5 text-lg text-pretty text-body">{lede}</p>

      <div className="rounded-card mt-8 bg-brand-wash p-6">
        <p className="text-pretty text-ink-90">
          <strong>The short answer: </strong>
          {answer}
        </p>
      </div>

      <BlogCta />

      <Prose>{children}</Prose>

      <section className="mt-10" aria-labelledby="post-faq">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqLd).replace(/</g, "\\u003c"),
          }}
        />
        <h2 id="post-faq" className="text-xl font-semibold text-ink-90">
          Common questions
        </h2>
        <dl className="mt-4 space-y-5">
          {faq.map((item) => (
            <div key={item.question}>
              <dt className="font-medium text-ink-90">{item.question}</dt>
              <dd className="mt-1 text-pretty text-body">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      <BlogCta />
      <RelatedPosts slug={post.slug} />
    </main>
  );
}
