import { FOUNDER_NAME, MARKETING_URL } from "@/lib/constants";

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
    slug: "free-electrical-estimate-software",
    title: "Free electrical estimate software",
    description:
      "Free electrical estimate software, compared without the pitch. Spreadsheets, QuotePace, and the trials that become a monthly bill. Read it before you pay.",
    publishedAt: "2026-10-31",
    readingMinutes: 8,
  },
  {
    slug: "electrical-quote-vs-estimate-vs-bid",
    title: "Electrical quote vs estimate vs bid",
    description:
      "Electrical quote vs estimate vs bid, from the contractor side. What each document promises, when you send it, and which one they can accept. A plain guide.",
    publishedAt: "2026-10-30",
    readingMinutes: 8,
  },
  {
    slug: "how-to-follow-up-on-an-electrical-quote",
    title: "How to follow up on an electrical quote",
    description:
      "How to follow up on an electrical quote without nagging. Three text-message scripts, when to send each, and the day you stop writing. Copy them, then edit.",
    publishedAt: "2026-10-29",
    readingMinutes: 7,
  },
  {
    slug: "good-better-best-pricing-for-electricians",
    title: "Good, better, best pricing for electricians",
    description:
      "Good, better, best pricing for electricians. Turn one scope into three options the customer can choose, with a labelled worked example. Not prices to copy.",
    publishedAt: "2026-10-28",
    readingMinutes: 8,
  },
  {
    slug: "what-to-charge-for-an-ev-charger-installation",
    title: "What to charge for an EV charger installation",
    description:
      "What to charge for an EV charger installation. Published cost studies, the lines those studies skip, and how you price the job yourself. Use your costs.",
    publishedAt: "2026-10-27",
    readingMinutes: 7,
  },
  {
    slug: "how-to-build-an-electrical-pricebook",
    title: "How to build an electrical pricebook",
    description:
      "How to build an electrical pricebook you can quote from in minutes. What to list, how to unit each line, and what never belongs on it. Then quote from it.",
    publishedAt: "2026-10-26",
    readingMinutes: 8,
  },
  {
    slug: "what-to-charge-for-an-electrical-service-call",
    title: "What to charge for an electrical service call",
    description:
      "What to charge for an electrical service call. Separate the trip fee, the diagnostic fee, and the repair quote. They are not one price. Price them apart.",
    publishedAt: "2026-10-25",
    readingMinutes: 7,
  },
  {
    slug: "how-to-price-recessed-lighting",
    title: "How to price recessed lighting",
    description:
      "How to price recessed lighting per fixture. Openings, wiring, trim, and the lines a single per-light number usually leaves off the quote. Price the job.",
    publishedAt: "2026-10-24",
    readingMinutes: 8,
  },
  {
    slug: "how-fast-should-you-send-an-electrical-quote",
    title: "How fast should you send an electrical quote?",
    description:
      "How fast should you send an electrical quote? What a published lead-response study measured, what it did not, and what to do in the van. Send it today.",
    publishedAt: "2026-10-23",
    readingMinutes: 8,
  },
  {
    slug: "how-to-write-an-electrical-quote-on-your-phone",
    title: "How to write an electrical quote on your phone",
    description:
      "How to write an electrical quote on your phone from the driveway. The scope, the lines, and a number they can accept before the van starts. A field guide.",
    publishedAt: "2026-10-22",
    readingMinutes: 8,
  },
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
      "How to price a 200A panel upgrade from your own costs. The contractor's side, and the three line items most quotes leave off.",
    publishedAt: "2026-09-13",
    readingMinutes: 7,
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

/** The next three posts in list order, wrapping so the links are not identical. */
export function otherPosts(slug: string): BlogPost[] {
  const index = BLOG_POSTS.findIndex((post) => post.slug === slug);
  if (index === -1) return [];
  const picks: BlogPost[] = [];
  for (let step = 1; picks.length < 3 && step < BLOG_POSTS.length; step++) {
    const post = BLOG_POSTS[(index + step) % BLOG_POSTS.length];
    if (post) picks.push(post);
  }
  return picks;
}

/**
 * Article JSON-LD. Author is the founder named on the site. `dateModified`
 * matches `publishedAt` until a post is actually revised.
 */
export function articleJsonLd(post: BlogPost) {
  const url = `${MARKETING_URL}/blog/${post.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    mainEntityOfPage: url,
    url,
    author: {
      "@type": "Person",
      name: FOUNDER_NAME,
      url: `${MARKETING_URL}/about`,
    },
    publisher: {
      "@type": "Organization",
      name: "QuotePace",
      url: MARKETING_URL,
    },
  };
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
