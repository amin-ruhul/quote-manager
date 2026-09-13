import type { MetadataRoute } from "next";

import { MARKETING_URL } from "@/lib/constants";

/*
 * What a crawler may read.
 *
 * Allow everything public, then name the three areas that must never be
 * indexed. `/q/` matters most: those pages already send `noindex`, but that
 * only helps once a crawler has fetched one — and fetching one is itself a
 * view, which records a quote_event and tells an owner their customer opened
 * the quote when nobody did. Disallowing the path stops the request.
 *
 * The app routes are behind auth and would only ever yield a login redirect;
 * excluding them keeps that noise out of the crawl budget.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/q/",
          "/api/",
          "/dashboard",
          "/quotes",
          "/customers",
          "/pricebook",
          "/onboarding",
          "/plan",
          "/billing",
          "/auth/",
        ],
      },
    ],
    sitemap: `${MARKETING_URL}/sitemap.xml`,
    host: MARKETING_URL,
  };
}
