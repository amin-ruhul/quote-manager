import { and, asc, desc, eq, ilike, or, type SQL, sql } from "drizzle-orm";
import Link from "next/link";

import { QuoteRowMenu } from "@/app/(app)/quotes/quote-row-menu";
import { QuotesToolbar } from "@/app/(app)/quotes/quotes-toolbar";
import { NewQuoteButton } from "@/components/new-quote-button";
import { Panel } from "@/components/panel";
import { QuoteStatusPill } from "@/components/quote-status-pill";
import { RequestAccessButton } from "@/components/upgrade/request-access-button";
import { customers, quotes } from "@/db/schema";
import { requireBusiness } from "@/lib/auth";
import {
  type Currency,
  isPaidPlan,
  PLAN_PAGE_PATH,
  QUOTE_STATUSES,
  type QuoteStatus,
} from "@/lib/constants";
import { db } from "@/lib/db";
import { formatCents } from "@/lib/money";
import { getPlanStatus } from "@/lib/plan";
import {
  isFiltered,
  QUOTE_FILTERS,
  type QuoteFilter,
  quoteListParamsSchema,
  type QuoteSort,
} from "@/lib/quote-filters";

export const metadata = { title: "Quotes · QuotePace" };

/** Shared by the header row and every quote row, so the columns line up. */
const QUOTE_COLUMNS =
  "lg:grid-cols-[6.5rem_minmax(0,1fr)_11rem_7rem_5.5rem_7rem_2.25rem]";

const updatedLabel = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
});

/** Money sorts fall back to recency, so equal totals keep a stable order. */
const ORDER_BY: Record<QuoteSort, SQL[]> = {
  newest: [desc(quotes.updatedAt)],
  oldest: [asc(quotes.updatedAt)],
  highest: [desc(quotes.total), desc(quotes.updatedAt)],
  lowest: [asc(quotes.total), desc(quotes.updatedAt)],
};

function isQuoteStatus(value: string): value is QuoteStatus {
  return (QUOTE_STATUSES as readonly string[]).includes(value);
}

export default async function QuotesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { user, business } = await requireBusiness();
  const params = quoteListParamsSchema.parse(await searchParams);

  // Cached per request, and the layout above has already asked for it.
  const planStatus = await getPlanStatus(user.id);

  const ownedByBusiness = eq(quotes.businessId, business.id);

  /*
   * `%` and `_` are wildcards to LIKE, so a search for "50%" would otherwise
   * match everything. Backslash is Postgres' default LIKE escape character.
   */
  const pattern = params.q ? `%${params.q.replace(/[\\%_]/g, "\\$&")}%` : null;

  const matchesSearch = pattern
    ? or(
        ilike(quotes.quoteNumber, pattern),
        ilike(quotes.title, pattern),
        // One field, so "jane s" matches across first and last name.
        sql`concat_ws(' ', ${customers.firstName}, ${customers.lastName}) ilike ${pattern}`,
      )
    : undefined;

  // Scoped by business_id from the session — never from the request.
  const [rows, statusCounts] = await Promise.all([
    db
      .select({
        id: quotes.id,
        quoteNumber: quotes.quoteNumber,
        title: quotes.title,
        status: quotes.status,
        total: quotes.total,
        publicToken: quotes.publicToken,
        updatedAt: quotes.updatedAt,
        customerFirstName: customers.firstName,
        customerLastName: customers.lastName,
      })
      .from(quotes)
      .leftJoin(customers, eq(quotes.customerId, customers.id))
      .where(
        and(
          ownedByBusiness,
          params.status === "all"
            ? undefined
            : eq(quotes.status, params.status),
          matchesSearch,
        ),
      )
      .orderBy(...ORDER_BY[params.sort]),

    /*
     * Tab counts deliberately ignore the search box: numbers that changed on
     * every keystroke would be unreadable, and the header already says how
     * many of them the search matched.
     */
    db
      .select({ status: quotes.status, count: sql<number>`count(*)::int` })
      .from(quotes)
      .where(ownedByBusiness)
      .groupBy(quotes.status),
  ]);

  const counts = Object.fromEntries(
    QUOTE_FILTERS.map((filter) => [filter, 0]),
  ) as Record<QuoteFilter, number>;

  for (const row of statusCounts) {
    if (isQuoteStatus(row.status)) counts[row.status] += row.count;
    counts.all += row.count;
  }

  const currency = business.currency as Currency;
  const narrowed = isFiltered(params);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold sm:text-3xl">Quotes</h1>
        <p className="mt-1 text-body">
          {narrowed ? (
            <>
              <span className="tabular">{rows.length}</span> of{" "}
              <span className="tabular">{counts.all}</span>{" "}
              {counts.all === 1 ? "quote" : "quotes"}
            </>
          ) : (
            <>
              <span className="tabular">{counts.all}</span>{" "}
              {counts.all === 1 ? "quote" : "quotes"}
            </>
          )}
        </p>
      </header>

      {/* The sidebar owns this action from lg up; on a phone there is no
          rail, so the page carries it. */}
      <div className="lg:hidden">
        <NewQuoteButton />
      </div>

      {/*
       * The wall, stated once, where the owner is standing when they hit it.
       * A toast says the same thing but disappears; this stays until the month
       * turns or we open the account up, and it carries the only thing they
       * can do about it.
       */}
      {planStatus.atLimit ? (
        <div className="rounded-lg bg-marigold p-5">
          <h2 className="font-semibold">
            That&apos;s all {planStatus.limit} quotes for this month
          </h2>
          <p className="mt-1 max-w-prose text-sm">
            Everything you&apos;ve already sent stays live and your customers
            can still accept it. Your free allowance resets on the first — or
            tell us you need more and we&apos;ll open your account up by hand.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <RequestAccessButton
              source="quota"
              requested={planStatus.hasPendingRequest}
              label="Request more quotes"
              variant="default"
            />
            <Link
              href={PLAN_PAGE_PATH}
              className="inline-flex h-11 items-center rounded-md px-3 text-sm font-medium underline underline-offset-4"
            >
              See your usage
            </Link>
          </div>
        </div>
      ) : null}

      {counts.all === 0 ? (
        <div className="rounded-lg bg-marigold p-6">
          <h2 className="font-semibold">No quotes yet</h2>
          <p className="mt-2 text-sm">
            Start one from your pricebook and send it before you leave the
            driveway.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <QuotesToolbar params={params} counts={counts} />

          {rows.length === 0 ? (
            <Panel className="text-center">
              <h2 className="font-semibold">No quotes match</h2>
              <p className="mt-2 text-sm text-ink-60">
                {params.q
                  ? `Nothing here for “${params.q}”.`
                  : "Nothing in this status yet."}
              </p>
              <Link
                href="/quotes"
                className="mt-4 inline-flex h-9 items-center rounded-md bg-brand-wash px-3 text-sm font-medium text-brand"
              >
                Clear filters
              </Link>
            </Panel>
          ) : (
            <Panel className="p-0">
              {/*
               * One row markup, two layouts. Below lg it is the stacked card a
               * phone wants; from lg the inner wrapper becomes `display:
               * contents` so its children promote into real table columns.
               * Duplicating the row for each breakpoint would mean two places
               * to keep correct.
               */}
              <div
                aria-hidden
                className={`hidden border-b border-hairline px-5 py-2 text-xs text-ink-60 lg:grid ${QUOTE_COLUMNS}`}
              >
                <span>Quote</span>
                <span>Job</span>
                <span>Customer</span>
                <span>Status</span>
                <span>Updated</span>
                <span className="text-right">Total</span>
                <span />
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
                    <li
                      key={quote.id}
                      className={`relative grid grid-cols-[minmax(0,1fr)_auto_auto] items-start gap-x-3 p-4 hover:bg-surface-2 lg:items-center lg:gap-4 lg:px-5 lg:py-3 ${QUOTE_COLUMNS}`}
                    >
                      {/*
                       * The row's link is an overlay rather than a wrapper: the
                       * actions menu is a button, and a button inside an anchor
                       * is invalid markup that swallows its own clicks.
                       */}
                      <Link
                        href={`/quotes/${quote.id}`}
                        aria-label={`${quote.quoteNumber} — ${quote.title}`}
                        className="absolute inset-0 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                      />

                      <div className="min-w-0 lg:contents">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="tabular text-sm text-ink-60">
                            {quote.quoteNumber}
                          </span>
                          {/* The pill rides beside the number on a phone and
                              has its own column on a wide screen. */}
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
                          <QuoteStatusPill
                            status={quote.status as QuoteStatus}
                          />
                        </span>

                        <span className="tabular hidden text-sm text-ink-60 lg:block">
                          {updatedLabel.format(quote.updatedAt)}
                        </span>
                      </div>

                      <span className="tabular shrink-0 font-medium lg:text-right">
                        {formatCents(quote.total, currency)}
                      </span>

                      <QuoteRowMenu
                        quoteId={quote.id}
                        quoteNumber={quote.quoteNumber}
                        status={quote.status as QuoteStatus}
                        publicToken={quote.publicToken}
                        premium={isPaidPlan(planStatus.plan)}
                        className="relative z-10 -my-1 shrink-0 text-ink-60"
                      />
                    </li>
                  );
                })}
              </ul>
            </Panel>
          )}
        </div>
      )}
    </div>
  );
}
