import { Clock, Phone, Globe, Mail } from "lucide-react";
import Image from "next/image";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { after } from "next/server";

import { AcceptPanel } from "@/app/q/[token]/accept-panel";
import { LineTable, TotalsBlock } from "@/app/q/[token]/quote-lines";
import type { Currency } from "@/lib/constants";
import { formatCents } from "@/lib/money";
import {
  canAccept,
  getQuoteByPublicToken,
  isExpired,
  recordQuoteViewed,
} from "@/lib/public-quote";
import { clientIpFrom } from "@/lib/rate-limit";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const quote = await getQuoteByPublicToken(token);

  if (!quote) return { title: "Quote · QuotePilot" };

  return {
    title: `${quote.title} · ${quote.businessName}`,
    description: `Your quote from ${quote.businessName}.`,
    // A quote link is private to whoever holds it; keep it out of search.
    robots: { index: false, follow: false },
  };
}

function formatDate(value: Date | null): string {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

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
  const customerName = [quote.customerFirstName, quote.customerLastName]
    .filter(Boolean)
    .join(" ");

  const sharedLines = quote.items.filter((item) => item.optionId === null);
  const hasOptions = quote.options.length > 0;

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Business identity — the first thing that has to look legitimate. */}
      <header className="flex items-center gap-4">
        {quote.businessLogoUrl ? (
          <Image
            src={quote.businessLogoUrl}
            alt={quote.businessName}
            width={56}
            height={56}
            unoptimized
            className="size-14 rounded-md border border-hairline bg-surface object-contain"
          />
        ) : null}
        <div className="min-w-0">
          <p className="text-lg font-semibold">{quote.businessName}</p>
          {quote.businessLicense ? (
            <p className="text-sm text-ink-60">
              License {quote.businessLicense}
            </p>
          ) : null}
        </div>
      </header>

      {/*
        The floating quote card — one of only two places DESIGN.md allows a
        shadow, so the money document lifts off the page.
      */}
      <article className="mt-6 rounded-lg border border-hairline bg-surface p-5 shadow-quote sm:p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="tabular text-sm text-ink-60">
            {quote.quoteNumber}
          </span>
          {quote.validUntil ? (
            <span
              className={`inline-flex items-center gap-1.5 text-sm ${
                expired ? "text-status-declined" : "text-ink-60"
              }`}
            >
              <Clock className="size-3.5" aria-hidden />
              {expired ? "Expired" : "Valid until"}{" "}
              {formatDate(quote.validUntil)}
            </span>
          ) : null}
        </div>

        <h1 className="mt-3 text-3xl font-semibold text-balance">
          {quote.title}
        </h1>

        {customerName ? (
          <p className="mt-2 text-body">Prepared for {customerName}</p>
        ) : null}

        {quote.scopeOfWork ? (
          <section className="mt-6">
            <h2 className="text-sm font-medium text-ink-60">Scope of work</h2>
            <p className="mt-2 whitespace-pre-line text-body">
              {quote.scopeOfWork}
            </p>
          </section>
        ) : null}

        {/* Pricing: a single price, or one block per option. */}
        <section className="mt-8">
          <h2 className="text-sm font-medium text-ink-60">
            {hasOptions ? "What's included in every option" : "Your quote"}
          </h2>

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
                <div key={option.id} className="mt-6">
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
                  <p className="tabular mt-2 flex items-baseline justify-between border-t border-hairline pt-3 font-semibold">
                    <span>{option.name} total</span>
                    <span>{formatCents(option.total, currency)}</span>
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
              total={quote.total}
              currency={currency}
            />
          )}
        </section>

        {quote.photos.length > 0 ? (
          <section className="mt-8">
            <h2 className="text-sm font-medium text-ink-60">Photos</h2>
            <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
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
            <h2 className="text-sm font-medium text-ink-60">
              Terms &amp; warranty
            </h2>
            <p className="mt-2 text-sm whitespace-pre-line text-ink-60">
              {quote.terms}
            </p>
          </section>
        ) : null}
      </article>

      {/* The decision. */}
      <section className="mt-6">
        {accepted ? (
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
        )}
      </section>

      {/* How to reach the business. */}
      <section className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-ink-60">
        {quote.businessPhone ? (
          <a
            href={`tel:${quote.businessPhone}`}
            className="inline-flex items-center gap-1.5"
          >
            <Phone className="size-3.5" aria-hidden />
            {quote.businessPhone}
          </a>
        ) : null}
        {quote.businessEmail ? (
          <a
            href={`mailto:${quote.businessEmail}`}
            className="inline-flex items-center gap-1.5"
          >
            <Mail className="size-3.5" aria-hidden />
            {quote.businessEmail}
          </a>
        ) : null}
        {quote.businessWebsite ? (
          <span className="inline-flex items-center gap-1.5">
            <Globe className="size-3.5" aria-hidden />
            {quote.businessWebsite}
          </span>
        ) : null}
      </section>

      {/* The growth loop (SPEC §16) — Business plans remove it. */}
      {quote.ownerPlan !== "business" ? (
        <footer className="mt-10 text-center text-sm text-ink-60">
          Made with{" "}
          <a
            href="https://quotepilot.app"
            className="font-medium text-ink-60 underline-offset-4 hover:underline"
          >
            QuotePilot
          </a>
        </footer>
      ) : null}
    </main>
  );
}
