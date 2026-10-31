import type { Metadata } from "next";

/**
 * Title, description, canonical and Open Graph for one public page.
 *
 * The root layout's Open Graph is the homepage's. A page that only sets
 * `title` and `description` still ships that homepage card when someone pastes
 * the link. Setting all four here is what stops that.
 */
export function pageMetadata({
  title,
  description,
  path,
  type = "website",
  publishedTime,
}: {
  title: string;
  description: string;
  /** Site path, including the leading slash. `/` for the homepage. */
  path: string;
  type?: "website" | "article";
  /** ISO date. Set on articles. */
  publishedTime?: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      type,
      ...(publishedTime ? { publishedTime } : {}),
    },
  };
}
