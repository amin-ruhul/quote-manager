import { desc, eq } from "drizzle-orm";
import Link from "next/link";

import { NewQuoteButton } from "@/components/new-quote-button";
import { Panel } from "@/components/panel";
import { QuoteStatusPill } from "@/components/quote-status-pill";
import { customers, quotes } from "@/db/schema";
import { requireBusiness } from "@/lib/auth";
import type { Currency, QuoteStatus } from "@/lib/constants";
import { db } from "@/lib/db";
import { formatCents } from "@/lib/money";

export const metadata = { title: "Quotes · QuotePilot" };

/** Shared by the header row and every quote row, so the columns line up. */
const QUOTE_COLUMNS =
  "lg:grid-cols-[6.5rem_minmax(0,1fr)_11rem_7rem_5.5rem_7rem]";

const updatedLabel = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
});

export default async function QuotesPage() {
  const { business } = await requireBusiness();

  // Scoped by business_id from the session — never from the request.
  const rows = await db
    .select({
      id: quotes.id,
      quoteNumber: quotes.quoteNumber,
      title: quotes.title,
      status: quotes.status,
      total: quotes.total,
      updatedAt: quotes.updatedAt,
      customerFirstName: customers.firstName,
      customerLastName: customers.lastName,
    })
    .from(quotes)
    .leftJoin(customers, eq(quotes.customerId, customers.id))
    .where(eq(quotes.businessId, business.id))
    .orderBy(desc(quotes.updatedAt));

  const currency = business.currency as Currency;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold sm:text-3xl">Quotes</h1>
        <p className="mt-1 text-body">
          <span className="tabular">{rows.length}</span>{" "}
          {rows.length === 1 ? "quote" : "quotes"}
        </p>
      </header>

      {/* The sidebar owns this action from lg up; on a phone there is no
          rail, so the page carries it. */}
      <div className="lg:hidden">
        <NewQuoteButton />
      </div>

      {rows.length === 0 ? (
        <div className="rounded-lg bg-marigold p-6">
          <h2 className="font-semibold">No quotes yet</h2>
          <p className="mt-2 text-sm">
            Start one from your pricebook and send it before you leave the
            driveway.
          </p>
        </div>
      ) : (
        <Panel className="p-0">
          {/*
           * One row markup, two layouts. Below lg it is the stacked card a
           * phone wants; from lg the inner wrapper becomes `display: contents`
           * so its children promote into real table columns. Duplicating the
           * row for each breakpoint would mean two places to keep correct.
           */}
          <div
            aria-hidden
            className={`hidden border-b border-hairline px-5 py-2 text-xs text-ink-40 lg:grid ${QUOTE_COLUMNS}`}
          >
            <span>Quote</span>
            <span>Job</span>
            <span>Customer</span>
            <span>Status</span>
            <span>Updated</span>
            <span className="text-right">Total</span>
          </div>

          <ul className="divide-y divide-hairline">
            {rows.map((quote) => {
              const customerName = [
                quote.customerFirstName,
                quote.customerLastName,
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <li key={quote.id}>
                  <Link
                    href={`/quotes/${quote.id}`}
                    className={`grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 p-4 hover:bg-surface-2 lg:items-center lg:gap-4 lg:px-5 lg:py-3 ${QUOTE_COLUMNS}`}
                  >
                    <div className="min-w-0 lg:contents">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="tabular text-sm text-ink-40">
                          {quote.quoteNumber}
                        </span>
                        {/* The pill rides beside the number on a phone and has
                            its own column on a wide screen. */}
                        <span className="lg:hidden">
                          <QuoteStatusPill
                            status={quote.status as QuoteStatus}
                          />
                        </span>
                      </div>

                      <p className="mt-1 truncate font-medium lg:mt-0">
                        {quote.title}
                      </p>

                      <p className="mt-0.5 truncate text-sm text-ink-60 lg:mt-0">
                        {customerName || "No customer yet"}
                      </p>

                      <span className="hidden lg:block">
                        <QuoteStatusPill status={quote.status as QuoteStatus} />
                      </span>

                      <span className="tabular hidden text-sm text-ink-60 lg:block">
                        {updatedLabel.format(quote.updatedAt)}
                      </span>
                    </div>

                    <span className="tabular shrink-0 font-medium lg:text-right">
                      {formatCents(quote.total, currency)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Panel>
      )}
    </div>
  );
}
