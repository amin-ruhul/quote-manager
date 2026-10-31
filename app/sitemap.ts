import type { MetadataRoute } from "next";

import { BLOG_POSTS } from "@/lib/blog";
import { MARKETING_URL } from "@/lib/constants";

/*
 * Public pages only. Login, the app and customer quote links stay out: a
 * sitemap that lists pages a crawler cannot use wastes the crawl.
 *
 * `lastModified` is a date the page actually changed, not the moment this
 * function ran. A sitemap that claims everything changed this morning gets
 * its dates ignored.
 *
 * Blog posts come from BLOG_POSTS. The free template is a public tool page.
 */

/** UTC midnight for an ISO date, so lastmod does not shift with the server zone. */
function utcDate(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`);
}

const PAGES: {
  path: string;
  updated: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}[] = [
  { path: "", updated: "2026-10-31", changeFrequency: "weekly", priority: 1 },
  {
    path: "/blog",
    updated: "2026-10-31",
    changeFrequency: "weekly",
    priority: 0.8,
  },
  {
    path: "/free-electrical-quote-template",
    updated: "2026-10-31",
    changeFrequency: "monthly",
    priority: 0.9,
  },
  {
    path: "/about",
    updated: "2026-10-31",
    changeFrequency: "monthly",
    priority: 0.5,
  },
  {
    path: "/contact",
    updated: "2026-10-31",
    changeFrequency: "monthly",
    priority: 0.5,
  },
  {
    path: "/privacy",
    updated: "2026-10-31",
    changeFrequency: "yearly",
    priority: 0.3,
  },
  {
    path: "/terms",
    updated: "2026-10-31",
    changeFrequency: "yearly",
    priority: 0.3,
  },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = PAGES.map(
    ({ path, updated, changeFrequency, priority }) => ({
      url: `${MARKETING_URL}${path}`,
      lastModified: utcDate(updated),
      changeFrequency,
      priority,
    }),
  );

  const posts: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${MARKETING_URL}/blog/${post.slug}`,
    lastModified: utcDate(post.publishedAt),
    changeFrequency: "monthly",
    priority: 0.9,
  }));

  return [...pages, ...posts];
}
