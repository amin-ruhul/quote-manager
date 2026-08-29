import Link from "next/link";

import { Panel } from "@/components/panel";
import { QuoteStatusPill } from "@/components/quote-status-pill";
import { Button } from "@/components/ui/button";
import { requireBusiness } from "@/lib/auth";
import type { Currency, QuoteStatus } from "@/lib/constants";
import {
  getMonthStats,
  getRecentQuotes,
  startOfThisMonth,
} from "@/lib/dashboard";
import { basisPointsToPercent, formatCents } from "@/lib/money";

export const metadata = { title: "Dashboard · QuotePilot" };

export default async function DashboardPage() {
  const { business } = await requireBusiness();
  const since = startOfThisMonth();

  const [stats, recent] = await Promise.all([
    getMonthStats(business.id, since),
    getRecentQuotes(business.id),
  ]);

  const currency = business.currency as Currency;
  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
  }).format(since);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">{business.name}</h1>
        <p className="mt-2 text-body">How {monthLabel} is going.</p>
      </header>

      {/* Won is the number that matters, so it gets the accent card. */}
      <div className="rounded-lg bg-marigold p-6">
        <p className="text-sm font-medium">Won this month</p>
        <p className="tabular mt-1 text-4xl font-semibold">
          {formatCents(stats.wonCents, currency)}
        </p>
        <p className="mt-1 text-sm">
          {stats.accepted} of {stats.sent} quotes accepted
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Stat label="Quotes sent" value={String(stats.sent)} />
        <Stat label="Accepted" value={String(stats.accepted)} />
        <Stat
          label="Acceptance rate"
          value={`${basisPointsToPercent(stats.acceptanceRateBasisPoints)}%`}
        />
        <Stat label="Quoted" value={formatCents(stats.quotedCents, currency)} />
      </div>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Recent quotes</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/quotes">See all</Link>
          </Button>
        </div>

        {recent.length === 0 ? (
          <Panel className="text-sm text-ink-60">
            No quotes yet. Start one and send it before you leave the driveway.
          </Panel>
        ) : (
          <Panel asChild className="p-0">
            <ul className="divide-y divide-hairline">
              {recent.map((quote) => {
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
                          <QuoteStatusPill
                            status={quote.status as QuoteStatus}
                          />
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
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Panel className="p-4 sm:p-4">
      <p className="text-sm text-ink-60">{label}</p>
      <p className="tabular mt-1 text-xl font-semibold">{value}</p>
    </Panel>
  );
}
