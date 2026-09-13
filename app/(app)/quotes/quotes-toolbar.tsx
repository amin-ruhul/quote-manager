"use client";

import { Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DEFAULT_QUOTE_FILTER,
  DEFAULT_QUOTE_SORT,
  MAX_QUOTE_SEARCH_LENGTH,
  QUOTE_FILTER_LABELS,
  QUOTE_FILTERS,
  type QuoteFilter,
  type QuoteListParams,
  QUOTE_SORT_LABELS,
  QUOTE_SORTS,
  type QuoteSort,
} from "@/lib/quote-filters";

/** How long to wait after the last keystroke before asking the server. */
const SEARCH_DEBOUNCE_MS = 300;

/**
 * What the list is showing: status tabs, a search box, and a sort.
 *
 * The state lives in the URL, not in React. A filtered list is then something
 * the owner can bookmark, share or come back to with the back button — and the
 * tabs stay ordinary links, so they work under a long-press "open in new tab"
 * and don't wait on JavaScript.
 */
export function QuotesToolbar({
  params,
  counts,
}: {
  params: QuoteListParams;
  /** Quotes per status, ignoring the search box, so the tab numbers hold still
      while the owner types. */
  counts: Record<QuoteFilter, number>;
}) {
  const router = useRouter();
  const pathname = usePathname();

  function hrefFor(next: Partial<QuoteListParams>) {
    return `${pathname}${queryString({ ...params, ...next })}`;
  }

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      {/* Bleeds to the screen edges on a phone so the last tab can be scrolled
          to without a cramped gutter. */}
      <div className="-mx-4 [scrollbar-width:none] overflow-x-auto px-4 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
        <div
          role="tablist"
          aria-label="Filter quotes by status"
          className="inline-flex w-max gap-0.5 rounded-pill bg-surface-2 p-1"
        >
          {QUOTE_FILTERS.filter(
            // A status nobody has reached yet is noise; "All" always shows.
            (filter) =>
              filter === DEFAULT_QUOTE_FILTER ||
              counts[filter] > 0 ||
              params.status === filter,
          ).map((filter) => {
            const active = params.status === filter;

            return (
              <Link
                key={filter}
                href={hrefFor({ status: filter })}
                role="tab"
                aria-selected={active}
                scroll={false}
                className={`inline-flex h-9 items-center gap-1.5 rounded-pill px-3.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-surface text-ink-90 shadow-nav"
                    : "text-ink-60 hover:text-ink-90"
                }`}
              >
                {QUOTE_FILTER_LABELS[filter]}
                <span className="tabular text-xs text-ink-60">
                  {counts[filter]}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <QuoteSearch
          value={params.q}
          onSearch={(value) => router.replace(hrefFor({ q: value }))}
        />

        <Select
          value={params.sort}
          onValueChange={(value) =>
            router.replace(hrefFor({ sort: value as QuoteSort }))
          }
        >
          <SelectTrigger
            aria-label="Sort quotes"
            className="w-auto shrink-0 max-sm:px-3"
          >
            {/* The trigger is tight on a phone, so it shows only the chosen
                order, not the word "Sort". */}
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {QUOTE_SORTS.map((sort) => (
              <SelectItem key={sort} value={sort}>
                {QUOTE_SORT_LABELS[sort]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

/**
 * The search box. Typed state is local and echoed to the URL on a debounce, so
 * the input never stutters while a server round trip is in flight.
 */
function QuoteSearch({
  value: urlValue,
  onSearch,
}: {
  /** What the URL currently searches for. */
  value: string;
  onSearch: (value: string) => void;
}) {
  const [typed, setTyped] = useState(urlValue);
  const input = useRef<HTMLInputElement>(null);
  /* Held in a ref so a new callback identity can't restart the debounce. */
  const latest = useRef(onSearch);
  useEffect(() => {
    latest.current = onSearch;
  });

  /*
   * The last value the box and the URL agreed on. Without it the two would
   * fight: the box would push its text back whenever something else cleared
   * the search (the empty state's "Clear filters"), and clearing would undo
   * itself.
   */
  const synced = useRef(urlValue);

  useEffect(() => {
    if (urlValue === synced.current) return;
    synced.current = urlValue;
    setTyped(urlValue);
  }, [urlValue]);

  useEffect(() => {
    const search = typed.trim();
    if (search === synced.current) return;

    const timer = setTimeout(() => {
      synced.current = search;
      latest.current(search);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [typed]);

  return (
    <div className="relative min-w-0 flex-1 lg:w-64 lg:flex-none">
      <Search
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-60"
      />
      <input
        ref={input}
        type="search"
        // A phone keyboard's blue "Go" is the wrong promise here: results are
        // already live. Submitting the wrapping form would be a no-op anyway.
        enterKeyHint="search"
        value={typed}
        maxLength={MAX_QUOTE_SEARCH_LENGTH}
        onChange={(event) => setTyped(event.target.value)}
        aria-label="Search quotes"
        placeholder="Search quotes…"
        className="h-11 w-full rounded-md border border-input bg-surface-2 pr-9 pl-9 text-base transition-colors outline-none placeholder:text-ink-60 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm [&::-webkit-search-cancel-button]:hidden"
      />
      {typed ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Clear search"
          onClick={() => {
            setTyped("");
            input.current?.focus();
          }}
          className="absolute top-1/2 right-1 -translate-y-1/2 text-ink-60"
        >
          <X />
        </Button>
      ) : null}
    </div>
  );
}

/** Only non-default values ride in the URL, so a plain list stays `/quotes`. */
function queryString(params: QuoteListParams): string {
  const query = new URLSearchParams();
  if (params.status !== DEFAULT_QUOTE_FILTER)
    query.set("status", params.status);
  if (params.sort !== DEFAULT_QUOTE_SORT) query.set("sort", params.sort);
  if (params.q) query.set("q", params.q);

  const value = query.toString();
  return value ? `?${value}` : "";
}
