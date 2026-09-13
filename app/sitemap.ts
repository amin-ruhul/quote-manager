import type { MetadataRoute } from "next";

import { BLOG_POSTS } from "@/lib/blog";
import { MARKETING_URL } from "@/lib/constants";

/*
 * Every page we want found, and nothing else.
 *
 * Listed by hand rather than walked from the filesystem: a generated sitemap
 * eventually lists /login, /register and the signed-in app, and a sitemap that
 * promises pages a crawler cannot use is worse than a short one. The blog pulls
 * from BLOG_POSTS so a new post cannot be published and left out.
 *
 * `priority` is a hint search engines mostly ignore; it is here to say which
 * pages we would rather have crawled first, not to claim importance.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const pages: MetadataRoute.Sitemap = [
    { path: "", changeFrequency: "weekly", priority: 1 },
    { path: "/blog", changeFrequency: "weekly", priority: 0.8 },
    { path: "/guides", changeFrequency: "monthly", priority: 0.7 },
    { path: "/about", changeFrequency: "monthly", priority: 0.5 },
    { path: "/contact", changeFrequency: "monthly", priority: 0.5 },
    { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
    { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  ].map(({ path, changeFrequency, priority }) => ({
    url: `${MARKETING_URL}${path}`,
    lastModified: now,
    // Widened to `string` by the map otherwise; the literal union is what
    // MetadataRoute.Sitemap asks for.
    changeFrequency:
      changeFrequency as MetadataRoute.Sitemap[number]["changeFrequency"],
    priority,
  }));

  const posts: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${MARKETING_URL}/blog/${post.slug}`,
    // The post's own date, not today's. Claiming everything changed this
    // morning is the fastest way to have lastModified ignored entirely.
    lastModified: new Date(`${post.publishedAt}T00:00:00Z`),
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  return [...pages, ...posts];
}
