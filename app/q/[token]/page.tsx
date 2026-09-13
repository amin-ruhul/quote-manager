import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { after } from "next/server";

import { AcceptPanel } from "@/app/q/[token]/accept-panel";
import { QuoteDocument } from "@/components/quote/quote-document";
import type { Currency } from "@/lib/constants";
import { getQuoteByPublicToken, recordQuoteViewed } from "@/lib/public-quote";
import { canAccept, isExpired } from "@/lib/quote-status";
import { clientIpFrom } from "@/lib/rate-limit";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const quote = await getQuoteByPublicToken(token);

  if (!quote) return { title: "Quote · QuotePace" };

  return {
    title: `${quote.title} · ${quote.businessName}`,
    description: `Your quote from ${quote.businessName}.`,
    // A quote link is private to whoever holds it; keep it out of search.
    robots: { index: false, follow: false },
  };
}

/**
 * The customer's quote.
 *
 * This route owns two things the document itself must never do: fetching, and
 * recording the view. The owner's preview and the print route render the same
 * <QuoteDocument> without either, which is what keeps quote_events honest —
 * only a real customer open writes one.
 */
export default async function PublicQuotePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const quote = await getQuoteByPublicToken(token);

  if (!quote) notFound();

  const requestHeaders = await headers();

  /*
   * The view event is the moat (golden rule 9), but the customer shouldn't wait
   * for a database write to see their quote. after() runs it once the response
   * has been sent.
   */
  after(async () => {
    try {
      await recordQuoteViewed(quote.id, {
        ip: clientIpFrom(requestHeaders),
        userAgent: requestHeaders.get("user-agent") ?? "",
        viewedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Recording quote view failed", {
        quoteId: quote.id,
        error,
      });
    }
  });

  const currency = quote.currency as Currency;
  const expired = isExpired(quote.validUntil);
  const accepted = quote.status === "accepted";
  const acceptable = canAccept(quote.status, quote.validUntil);

  return (
    <QuoteDocument
      quote={quote}
      action={
        accepted ? (
          <div className="rounded-lg bg-status-accepted-bg p-6 text-center">
            <h2 className="text-xl font-semibold text-status-accepted">
              You accepted this quote
            </h2>
            <p className="mt-2 text-sm text-ink-60">
              {quote.businessName} has been notified and will be in touch.
            </p>
          </div>
        ) : expired ? (
          <div className="rounded-lg bg-status-declined-bg p-6 text-center">
            <h2 className="text-xl font-semibold text-status-declined">
              This quote has expired
            </h2>
            <p className="mt-2 text-sm text-ink-60">
              Contact {quote.businessName} for an up-to-date price.
            </p>
          </div>
        ) : acceptable ? (
          <AcceptPanel
            token={token}
            options={quote.options}
            total={quote.total}
            currency={currency}
            businessName={quote.businessName}
          />
        ) : (
          <div className="rounded-lg border border-hairline bg-surface p-6 text-center">
            <h2 className="font-semibold">This quote isn&apos;t ready yet</h2>
            <p className="mt-2 text-sm text-ink-60">
              {quote.businessName} is still preparing it.
            </p>
          </div>
        )
      }
      footer={
        // The growth loop (SPEC §16) — Business plans remove it.
        quote.ownerPlan !== "business" ? (
          <footer className="mt-10 text-center text-sm text-ink-60">
            Made with{" "}
            <a
              href="https://quotepace.app"
              className="font-medium text-ink-60 underline-offset-4 hover:underline"
            >
              QuotePace
            </a>
          </footer>
        ) : null
      }
    />
  );
}
