/*
 * What the quotes list is showing: which statuses, in what order, matching what
 * search. Shared by the server page (which queries) and the toolbar (which
 * links), so the two can never disagree about a legal value.
 *
 * Deliberately not `server-only` — the toolbar is a client component and needs
 * the same labels and defaults.
 */

import { z } from "zod";

import { QUOTE_STATUSES } from "@/lib/constants";

/** The status tabs: every lifecycle state, plus "everything". */
export const QUOTE_FILTERS = ["all", ...QUOTE_STATUSES] as const;
export type QuoteFilter = (typeof QUOTE_FILTERS)[number];
export const DEFAULT_QUOTE_FILTER: QuoteFilter = "all";

export const QUOTE_FILTER_LABELS: Record<QuoteFilter, string> = {
  all: "All",
  draft: "Draft",
  sent: "Sent",
  viewed: "Viewed",
  accepted: "Accepted",
  declined: "Declined",
  expired: "Expired",
};

export const QUOTE_SORTS = ["newest", "oldest", "highest", "lowest"] as const;
export type QuoteSort = (typeof QUOTE_SORTS)[number];
export const DEFAULT_QUOTE_SORT: QuoteSort = "newest";

export const QUOTE_SORT_LABELS: Record<QuoteSort, string> = {
  newest: "Newest first",
  oldest: "Oldest first",
  highest: "Highest total",
  lowest: "Lowest total",
};

/** Long enough for a job title, short enough that the LIKE stays cheap. */
export const MAX_QUOTE_SEARCH_LENGTH = 80;

/**
 * The query string, made safe. Every field falls back to its default rather
 * than erroring: a hand-edited URL should show the list, not a crash.
 */
export const quoteListParamsSchema = z.object({
  status: z.enum(QUOTE_FILTERS).catch(DEFAULT_QUOTE_FILTER),
  sort: z.enum(QUOTE_SORTS).catch(DEFAULT_QUOTE_SORT),
  q: z
    .string()
    .catch("")
    .transform((value) => value.trim().slice(0, MAX_QUOTE_SEARCH_LENGTH)),
});

export type QuoteListParams = z.infer<typeof quoteListParamsSchema>;

/** True when the list is narrowed, so the page can say so and offer a reset. */
export function isFiltered(params: QuoteListParams): boolean {
  return params.status !== DEFAULT_QUOTE_FILTER || params.q !== "";
}
