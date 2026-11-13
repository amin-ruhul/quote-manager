import type { Metadata } from "next";

import { MARKETING_URL } from "@/lib/constants";

/**
 * The site-wide share card: the PNG `app/opengraph-image.tsx` generates.
 *
 * Named explicitly rather than left to the file convention. Next merges
 * metadata shallowly, so the moment a page sets its own `openGraph` (every
 * page does, through `pageMetadata` below) the root card is dropped and the
 * link is pasted as a bare text card. Width, height and alt keep the numbers in
 * step with the image itself.
 *
 * A post with its own `opengraph-image.tsx` passes `ownShareImage` to
 * `pageMetadata` instead: an `images` entry set in config would override it.
 */
export const DEFAULT_SHARE_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "QuotePace — send the quote before you leave the driveway",
} as const;

/**
 * The logo search engines show beside the brand. The 512px PWA icon: square,
 * well above Google's 112px minimum, and already a public static file.
 */
export const ORGANIZATION_LOGO = {
  "@type": "ImageObject",
  url: `${MARKETING_URL}/icons/icon-512.png`,
  width: 512,
  height: 512,
} as const;

/**
 * Title, description, canonical, Open Graph and X card for one public page.
 *
 * The root layout's Open Graph is the homepage's. A page that only sets
 * `title` and `description` still ships that homepage card when someone pastes
 * the link. Setting all of them here is what stops that.
 */
export function pageMetadata({
  title,
  description,
  path,
  type = "website",
  publishedTime,
  noIndex = false,
  ownShareImage = false,
}: {
  title: string;
  description: string;
  /** Site path, including the leading slash. `/` for the homepage. */
  path: string;
  type?: "website" | "article";
  /** ISO date. Set on articles. */
  publishedTime?: string;
  /**
   * For pages a visitor can reach but a search result should never lead to
   * (sign-in, sign-up). Links on them are still followed.
   */
  noIndex?: boolean;
  /**
   * The page's folder has its own `opengraph-image.tsx`. Naming an image here
   * would override it, so the default card is left out and the file
   * convention fills og:image (and the X card falls back to it).
   */
  ownShareImage?: boolean;
}): Metadata {
  const images = ownShareImage ? {} : { images: [DEFAULT_SHARE_IMAGE] };
  return {
    title,
    description,
    alternates: { canonical: path },
    ...(noIndex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      title,
      description,
      url: path,
      siteName: "QuotePace",
      type,
      ...images,
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...images,
    },
  };
}
