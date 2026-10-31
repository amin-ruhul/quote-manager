import Link from "next/link";

import { otherPosts } from "@/lib/blog";

/** Three other posts, rotated so the links are not the same on every page. */
export function RelatedPosts({ slug }: { slug: string }) {
  const posts = otherPosts(slug);
  if (posts.length === 0) return null;

  return (
    <nav className="mt-10" aria-label="More from the blog">
      <h2 className="text-sm font-medium text-ink-60">More from the blog</h2>
      <ul className="mt-3 space-y-2">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="font-medium text-brand hover:underline"
            >
              {post.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
