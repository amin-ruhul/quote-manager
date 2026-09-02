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
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">Quotes</h1>
        <p className="mt-2 text-body">
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
        <Panel asChild className="p-0">
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
                    className="flex items-start gap-3 p-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="tabular text-sm text-ink-40">
                          {quote.quoteNumber}
                        </span>
                        <QuoteStatusPill status={quote.status as QuoteStatus} />
                      </div>
                      <p className="mt-1 font-medium">{quote.title}</p>
                      <p className="mt-0.5 text-sm text-ink-60">
                        {customerName || "No customer yet"}
                      </p>
                    </div>
                    <span className="tabular shrink-0 font-medium">
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
