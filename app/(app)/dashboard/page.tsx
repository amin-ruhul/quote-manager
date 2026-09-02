import { Plus } from "lucide-react";
import Link from "next/link";

import { ActivityCard } from "@/components/dashboard/activity-card";
import { MonthlyColumns } from "@/components/dashboard/monthly-columns";
import { SectionCard } from "@/components/dashboard/section-card";
import { NewQuoteButton } from "@/components/new-quote-button";
import { Panel } from "@/components/panel";
import { InstallCard } from "@/components/pwa/install-card";
import { PushNudge } from "@/components/pwa/push-nudge";
import { QuoteStatusPill } from "@/components/quote-status-pill";
import { Button } from "@/components/ui/button";
import { requireBusiness } from "@/lib/auth";
import type { Currency, QuoteStatus } from "@/lib/constants";
import { customerName } from "@/lib/customers";
import {
  getMonthlyPerformance,
  getMonthStats,
  getPricebookHighlights,
  getRecentCustomers,
  getRecentQuotes,
  startOfThisMonth,
} from "@/lib/dashboard";
import { basisPointsToPercent, formatCents } from "@/lib/money";

export const metadata = { title: "Dashboard · QuotePilot" };

export default async function DashboardPage() {
  const { business } = await requireBusiness();
  const since = startOfThisMonth();

  const [stats, recent, recentCustomers, prices, months] = await Promise.all([
    getMonthStats(business.id, since),
    getRecentQuotes(business.id),
    getRecentCustomers(business.id),
    getPricebookHighlights(business.id),
    getMonthlyPerformance(business.id),
  ]);

  const currency = business.currency as Currency;
  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
  }).format(since);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold sm:text-3xl">{business.name}</h1>
        <p className="mt-1 text-body">How {monthLabel} is going.</p>
      </header>

      {/*
       * Twelve columns from lg up. The money and the month's numbers share the
       * top row; below it the quote list takes the wide column and the two
       * reference sections stack in the rail, because that is the order the
       * owner actually reads in.
       */}
      <div className="grid gap-4 lg:grid-cols-12">
        {/* Won is the number that matters, so it gets the accent card — and
            the six-month trend rides inside it, drawn in ink on the marigold
            so the chart costs the palette nothing. */}
        <div className="flex flex-col gap-4 rounded-lg bg-marigold p-6 lg:col-span-7">
          <div>
            <p className="text-sm font-medium">Won this month</p>
            <p className="tabular mt-1 text-4xl font-semibold">
              {formatCents(stats.wonCents, currency)}
            </p>
            <p className="mt-1 text-sm">
              {stats.accepted} of {stats.sent} quotes accepted
            </p>
          </div>

          <MonthlyColumns
            className="mt-auto"
            onAccent
            labels={months.map((month) => month.label)}
            series={[
              {
                id: "won",
                label: "Won",
                // One colour for every bar. Shading them by size would burn
                // the only free channel restating the height, and the ink
                // already reads on marigold without borrowing a hue.
                color: "rgba(0,0,0,0.85)",
                values: months.map((month) => month.wonCents),
              },
            ]}
            formatValue={(value) => formatCents(value, currency)}
            caption="Money won, by month"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 lg:col-span-5 lg:content-start">
          <Stat label="Quotes sent" value={String(stats.sent)} />
          <Stat label="Accepted" value={String(stats.accepted)} />
          <Stat
            label="Acceptance rate"
            value={`${basisPointsToPercent(stats.acceptanceRateBasisPoints)}%`}
          />
          <Stat
            label="Quoted"
            value={formatCents(stats.quotedCents, currency)}
          />
        </div>

        <PushNudge className="lg:col-span-12" />

        <ActivityCard months={months} className="lg:col-span-12" />

        <SectionCard
          className="lg:col-span-7"
          title="Recent quotes"
          seeAllHref="/quotes"
          isEmpty={recent.length === 0}
          emptyMessage="No quotes yet. Start one and send it before you leave the driveway."
          /*
           * Ghost, like the other two. Making this the screen's filled primary
           * was the obvious move and it was wrong: at the foot of the longest
           * card it sits below the fold, so the loudest thing on the page was
           * also the thing you had to scroll to find. The dashboard's primary
           * action is the rail's "New quote", which is visible the moment the
           * screen loads.
           */
          action={<NewQuoteButton size="default" variant="soft" />}
        >
          <ul className="divide-y divide-hairline">
            {recent.map((quote) => (
              <li key={quote.id}>
                <Link
                  href={`/quotes/${quote.id}`}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-surface-2 sm:px-5"
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
                      {/* Left join: a quote can outlive its customer row, so
                          neither name is guaranteed. */}
                      {[quote.customerFirstName, quote.customerLastName]
                        .filter(Boolean)
                        .join(" ") || "No customer yet"}
                    </p>
                  </div>
                  <span className="tabular shrink-0 font-medium">
                    {formatCents(quote.total, currency)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </SectionCard>

        <div className="grid gap-4 lg:col-span-5 lg:content-start">
          <SectionCard
            title="Recent customers"
            seeAllHref="/customers"
            isEmpty={recentCustomers.length === 0}
            emptyMessage="Nobody yet. Add the people you quote for."
            action={
              <Button asChild variant="soft" size="default" className="w-full">
                <Link href="/customers?new=1">
                  <Plus />
                  Add customer
                </Link>
              </Button>
            }
          >
            <ul className="divide-y divide-hairline">
              {recentCustomers.map((customer) => (
                <li key={customer.id}>
                  <Link
                    href={`/customers/${customer.id}`}
                    className="block px-4 py-3 hover:bg-surface-2 sm:px-5"
                  >
                    <p className="font-medium">{customerName(customer)}</p>
                    <p className="mt-0.5 truncate text-sm text-ink-60">
                      {customer.company ??
                        customer.email ??
                        customer.phone ??
                        "No contact details"}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard
            title="Pricebook"
            seeAllHref="/pricebook"
            isEmpty={prices.length === 0}
            emptyMessage="No prices yet. Add the jobs you quote most often."
            action={
              <Button asChild variant="soft" size="default" className="w-full">
                <Link href="/pricebook?new=1">
                  <Plus />
                  Add item
                </Link>
              </Button>
            }
          >
            <ul className="divide-y divide-hairline">
              {prices.map((item) => (
                <li
                  key={item.id}
                  className="flex items-baseline gap-3 px-4 py-3 sm:px-5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{item.name}</p>
                    <p className="mt-0.5 text-sm text-ink-60">
                      {item.category ?? "Uncategorized"} · per {item.unit}
                    </p>
                  </div>
                  <span className="tabular shrink-0 font-medium">
                    {formatCents(item.price, currency)}
                  </span>
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>
      </div>

      {/* Renders nothing unless the app can actually be installed. */}
      <InstallCard />
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
