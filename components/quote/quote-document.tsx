import Image from "next/image";

import { LineTable, TotalsBlock } from "@/components/quote/quote-line-table";
import type { Currency } from "@/lib/constants";
import { formatCents } from "@/lib/money";
// Type-only, so the `server-only` marker in that module is never pulled in —
// this component has to render inside the client-side builder preview too.
import type { PublicQuote } from "@/lib/public-quote";
import { isExpired } from "@/lib/quote-status";

/*
 * The quote as the customer sees it — and the ONLY definition of that.
 *
 * Three surfaces render this: the public page at /q/[token], the owner's
 * preview inside the builder, and the print route. They cannot drift, because a
 * preview that is not literally the same component is a preview that eventually
 * lies.
 *
 * Deliberately presentational: no data fetching, and no view recording. That
 * last part matters — recordQuoteViewed() lives on the public route alone, so
 * the owner opening their own preview never writes a "your customer opened it"
 * event (golden rule 9: quote_events is the moat, and a polluted moat is worse
 * than none).
 *
 * Laid out as a document rather than a stack of labelled paragraphs: an
 * identity band, a meta row pairing who it is for against when it expires, a
 * real line-item table, and totals aligned under the amounts. That shape is
 * what makes it read as a professional quote at a glance — the homeowner
 * deciding whether to trust the price has seen it before.
 *
 * The decision (Accept) and the growth-loop footer are slots, because the print
 * version has neither: a PDF cannot be clicked, and a link in ink is noise.
 */

function formatDate(value: Date | null): string {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function QuoteDocument({
  quote,
  action,
  footer,
  variant = "web",
}: {
  quote: NonNullable<PublicQuote>;
  /** The Accept panel or a status message. Omitted when printing. */
  action?: React.ReactNode;
  /** "Made with QuotePilot". Omitted when printing and in the owner's preview. */
  footer?: React.ReactNode;
  /**
   * "print" is the paper version: no job photos, no card shadow — a plain
   * typographic document.
   *
   * Not only taste. Images are what makes browser Save-as-PDF unreliable:
   * remote photos may not finish loading before the print dialog opens, and
   * background graphics are a checkbox the user controls. Take them out and the
   * browser's own print becomes dependable enough that no PDF engine is needed.
   */
  variant?: "web" | "print";
}) {
  const isPrint = variant === "print";
  const currency = quote.currency as Currency;
  const expired = isExpired(quote.validUntil);
  const customerName = [quote.customerFirstName, quote.customerLastName]
    .filter(Boolean)
    .join(" ");

  const sharedLines = quote.items.filter((item) => item.optionId === null);
  const hasOptions = quote.options.length > 0;

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <article
        className={`rounded-lg border border-hairline bg-surface p-6 sm:p-10 ${
          isPrint ? "" : "shadow-quote"
        }`}
      >
        {/*
         * Identity band: the business on the left, what this document IS on the
         * right. The first two questions anyone opening it asks, answered
         * before they read a word of the body.
         */}
        <header className="flex items-start justify-between gap-6">
          <div className="flex min-w-0 items-center gap-3">
            {quote.businessLogoUrl ? (
              <Image
                src={quote.businessLogoUrl}
                alt=""
                width={48}
                height={48}
                unoptimized
                className="size-12 shrink-0 rounded-md object-contain"
              />
            ) : null}
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold">
                {quote.businessName}
              </p>
              {quote.businessLicense ? (
                <p className="text-sm text-ink-60">
                  License {quote.businessLicense}
                </p>
              ) : null}
            </div>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-2xl font-semibold tracking-tight">Quote</p>
            <p className="tabular text-sm text-ink-60">{quote.quoteNumber}</p>
          </div>
        </header>

        <div className="mt-5 border-t-2 border-ink-90/20" />

        {/*
         * Who and when, paired. Two columns so the expiry sits opposite the
         * name rather than buried under it — it is the detail that decides how
         * quickly the customer has to act.
         */}
        <div className="mt-5 flex flex-wrap justify-between gap-x-8 gap-y-4 text-sm">
          {customerName ? (
            <div className="min-w-0">
              <Eyebrow>Prepared for</Eyebrow>
              <p className="mt-1 font-medium">{customerName}</p>
            </div>
          ) : null}

          {quote.validUntil ? (
            <div className="text-right">
              <Eyebrow>{expired ? "Expired" : "Valid until"}</Eyebrow>
              <p
                className={`mt-1 font-medium ${expired ? "text-status-declined" : ""}`}
              >
                {formatDate(quote.validUntil)}
              </p>
            </div>
          ) : null}
        </div>

        <h1 className="mt-6 text-2xl font-semibold text-balance sm:text-3xl">
          {quote.title}
        </h1>

        {quote.scopeOfWork ? (
          <section className="mt-5">
            <Eyebrow as="h2">Scope of work</Eyebrow>
            <p className="mt-2 whitespace-pre-line text-body">
              {quote.scopeOfWork}
            </p>
          </section>
        ) : null}

        {/* Pricing: a single price, or one block per option. */}
        <section className="mt-8">
          <Eyebrow as="h2">
            {hasOptions ? "Included in every option" : "Your quote"}
          </Eyebrow>

          {sharedLines.length > 0 ? (
            <LineTable lines={sharedLines} currency={currency} />
          ) : hasOptions ? null : (
            <p className="mt-2 text-sm text-ink-60">
              No line items on this quote yet.
            </p>
          )}

          {hasOptions ? (
            quote.options.map((option) => {
              const optionLines = quote.items.filter(
                (item) => item.optionId === option.id,
              );
              return (
                <div key={option.id} className="mt-8">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{option.name}</h3>
                    {option.isRecommended ? (
                      <span className="rounded-pill bg-marigold px-2 py-0.5 text-xs font-medium">
                        Recommended
                      </span>
                    ) : null}
                  </div>
                  {option.description ? (
                    <p className="mt-1 text-sm text-ink-60">
                      {option.description}
                    </p>
                  ) : null}
                  {optionLines.length > 0 ? (
                    <LineTable lines={optionLines} currency={currency} />
                  ) : null}
                  <p className="tabular mt-3 flex items-baseline justify-between border-t-2 border-ink-90/20 pt-3 font-semibold">
                    <span>{option.name} total</span>
                    <span className="text-xl">
                      {formatCents(option.total, currency)}
                    </span>
                  </p>
                </div>
              );
            })
          ) : (
            <TotalsBlock
              subtotal={quote.subtotal}
              discount={quote.discount}
              tax={quote.tax}
              taxRate={quote.taxRate}
              taxExempt={quote.customerTaxExempt ?? false}
              total={quote.total}
              currency={currency}
            />
          )}
        </section>

        {quote.photos.length > 0 && !isPrint ? (
          <section className="mt-8">
            <Eyebrow as="h2">Photos</Eyebrow>
            <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {quote.photos.map((photo) => (
                <li key={photo.id}>
                  <Image
                    src={photo.url}
                    alt={photo.caption ?? "Job photo"}
                    width={400}
                    height={400}
                    unoptimized
                    className="aspect-square w-full rounded-md border border-hairline bg-surface object-cover"
                  />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {quote.terms ? (
          <section className="mt-8">
            <Eyebrow as="h2">Terms &amp; warranty</Eyebrow>
            <p className="mt-2 text-sm whitespace-pre-line text-ink-60">
              {quote.terms}
            </p>
          </section>
        ) : null}

        {/*
         * Contact closes the document rather than floating under it. Detached,
         * it read as a stray line belonging to the page; here it is the
         * letterhead at the foot of the letter.
         */}
        <footer className="mt-8 flex flex-wrap gap-x-6 gap-y-1 border-t border-hairline pt-5 text-sm text-ink-60">
          {quote.businessPhone ? (
            <a href={`tel:${quote.businessPhone}`}>{quote.businessPhone}</a>
          ) : null}
          {quote.businessEmail ? (
            <a href={`mailto:${quote.businessEmail}`}>{quote.businessEmail}</a>
          ) : null}
          {quote.businessWebsite ? <span>{quote.businessWebsite}</span> : null}
        </footer>
      </article>

      {action ? <section className="mt-6">{action}</section> : null}

      {footer}
    </main>
  );
}

/**
 * The document's one structural device: a small uppercase label naming what
 * follows. Used for every section so the eye can skip between them, and nowhere
 * else — it means "a part of the quote starts here".
 */
function Eyebrow({
  as: Tag = "p",
  children,
}: {
  as?: "p" | "h2";
  children: React.ReactNode;
}) {
  return (
    <Tag className="text-xs font-medium tracking-wide text-ink-60 uppercase">
      {children}
    </Tag>
  );
}
