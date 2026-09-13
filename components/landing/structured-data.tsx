import { MARKETING_URL, SUPPORT_EMAIL } from "@/lib/constants";

/*
 * Schema.org for the marketing site.
 *
 * Two jobs. Google may use it for rich results, which is the familiar one. The
 * other matters more here: an assistant answering "quoting software for
 * electricians" has to decide what this site *is* before it will name it, and
 * prose leaves that to inference. This states the category, the audience and
 * the price in a form that does not have to be inferred.
 *
 * Everything below is either verifiable on the page or true of the product. An
 * aggregateRating with no reviews behind it is the usual temptation here, and
 * it is both a policy violation and a lie about a product that has no customers
 * yet.
 */

const organization = {
  "@type": "Organization",
  "@id": `${MARKETING_URL}/#organization`,
  name: "QuotePace",
  url: MARKETING_URL,
  email: SUPPORT_EMAIL,
  description:
    "Quoting software for residential electricians. QuotePace turns a job description into a professional quote that is sent, tracked and accepted from the customer's phone.",
};

const website = {
  "@type": "WebSite",
  "@id": `${MARKETING_URL}/#website`,
  url: MARKETING_URL,
  name: "QuotePace",
  publisher: { "@id": `${MARKETING_URL}/#organization` },
};

/*
 * SoftwareApplication is the type an assistant matches against a "what tool
 * should I use for X" question. `applicationCategory` and `audience` are the
 * two fields that decide whether this surfaces for "electrician" rather than
 * for construction software in general.
 */
const application = {
  "@type": "SoftwareApplication",
  "@id": `${MARKETING_URL}/#software`,
  name: "QuotePace",
  url: MARKETING_URL,
  applicationCategory: "BusinessApplication",
  applicationSubCategory: "Quoting and estimating software",
  operatingSystem: "Web browser, iOS, Android",
  audience: {
    "@type": "Audience",
    audienceType: "Residential electricians and electrical contractors",
  },
  publisher: { "@id": `${MARKETING_URL}/#organization` },
  featureList: [
    "Build a quote from your own pricebook",
    "Send the quote as a link the customer opens on their phone",
    "Customer accepts online with no app and no account",
    "Track sent, opened and accepted",
    "Automatic follow-up when a customer does not reply",
    "Good / better / best options on one quote",
  ],
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Free while in beta. No card required.",
  },
};

export function MarketingStructuredData({
  faq,
}: {
  /** The questions already rendered on the page — never a separate list. */
  faq: { q: string; a: string }[];
}) {
  const graph: Record<string, unknown>[] = [organization, website, application];

  /*
   * FAQPage only when the questions are actually on the page. Marking up
   * answers a visitor cannot see is the thing Google penalises, and it is also
   * how a page ends up cited for a claim it does not make.
   */
  if (faq.length > 0) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${MARKETING_URL}/#faq`,
      mainEntity: faq.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    });
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": graph,
        }).replace(/</g, "\\u003c"),
      }}
    />
  );
}
