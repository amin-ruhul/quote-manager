/*
 * The blog index, in one place.
 *
 * Metadata only — each post's body is its own route under app/(marketing)/blog,
 * written as JSX. That is deliberate: one post does not justify an MDX pipeline,
 * and a post that can import a chart component beats one that cannot. Revisit
 * when there are enough posts that the routes start repeating each other.
 *
 * Posts are listed newest first; the index renders them in array order.
 */

export type BlogPost = {
  slug: string;
  /** The H1 and the card heading. Keep it the phrase someone would search. */
  title: string;
  /** The <meta> description and the card standfirst — under ~160 characters. */
  description: string;
  /** ISO date. Rendered as the dateline and as <time dateTime>. */
  publishedAt: string;
  readingMinutes: number;
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "how-to-quote-electrical-work",
    title: "How to quote electrical work",
    description:
      "A seven-step process for writing electrical quotes that cover the job, the price, and what the customer is actually agreeing to.",
    publishedAt: "2026-09-14",
    readingMinutes: 8,
  },
  {
    slug: "what-to-charge-200a-panel-upgrade",
    title: "What to charge for a 200A panel upgrade",
    description:
      "Every result on that search is written for homeowners. Here is the contractor's side: how to build the price from your own costs, and the three line items that get left off.",
    publishedAt: "2026-09-13",
    readingMinutes: 7,
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

/** "13 September 2026" — spelled out, because a dateline with 09/13 is ambiguous. */
export function formatPostDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
