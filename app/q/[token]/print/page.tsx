import { notFound } from "next/navigation";

import { QuoteDocument } from "@/components/quote/quote-document";
import { getQuoteByPublicToken } from "@/lib/public-quote";

/*
 * The quote as paper.
 *
 * Same <QuoteDocument> the customer sees, with the two things ink cannot carry
 * removed: the Accept panel (a PDF cannot be clicked) and the "Made with
 * QuotePace" footer (a link nobody can follow).
 *
 * Deliberately does NOT call recordQuoteViewed(). This route exists so the
 * owner can look at their own quote, and the PDF generator can render it —
 * neither is a customer opening it. That distinction is why the recording lives
 * on /q/[token] and not inside the document.
 *
 * Reached with the same public token as the quote itself, so it exposes nothing
 * the quote link doesn't already.
 */

export const metadata = {
  title: "Quote",
  robots: { index: false, follow: false },
};

export default async function QuotePrintPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const quote = await getQuoteByPublicToken(token);

  if (!quote) notFound();

  return (
    <div className="print-document">
      <QuoteDocument quote={quote} variant="print" />
    </div>
  );
}
