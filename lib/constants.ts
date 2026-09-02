/*
 * One source of truth for statuses, plans, and limits (SPEC §16).
 * Nothing here should be duplicated as a string literal elsewhere.
 */

export const PLANS = ["free", "pro", "business"] as const;
export type Plan = (typeof PLANS)[number];
export const DEFAULT_PLAN: Plan = "free";

/** The quote engine is generic; a trade is just an industry_config row (SPEC §8). */
export const INDUSTRIES = ["electrician"] as const;
export type Industry = (typeof INDUSTRIES)[number];
export const DEFAULT_INDUSTRY: Industry = "electrician";

/** Units a pricebook item can be sold in. */
export const PRICEBOOK_UNITS = ["each", "hour", "ft", "job"] as const;
export type PricebookUnit = (typeof PRICEBOOK_UNITS)[number];
export const DEFAULT_PRICEBOOK_UNIT: PricebookUnit = "each";

/** V1 is US-first (SPEC §2); the column is still generic. */
export const CURRENCIES = ["USD", "CAD", "GBP", "AUD"] as const;
export type Currency = (typeof CURRENCIES)[number];
export const DEFAULT_CURRENCY: Currency = "USD";

/**
 * Tax rates are stored as integer basis points, never floats — 8.25% is 825.
 * Same reasoning as money-as-cents: floats lose precision when multiplied.
 */
export const BASIS_POINTS_PER_PERCENT = 100;
export const MAX_TAX_RATE_BASIS_POINTS = 10_000; // 100%

/** Quote lifecycle (SPEC §5). Status colours live in DESIGN.md's status table. */
export const QUOTE_STATUSES = [
  "draft",
  "sent",
  "viewed",
  "accepted",
  "declined",
  "expired",
] as const;
export type QuoteStatus = (typeof QUOTE_STATUSES)[number];
export const DEFAULT_QUOTE_STATUS: QuoteStatus = "draft";

/** Line item kinds the generic engine supports (SPEC §8, §10). */
export const QUOTE_ITEM_TYPES = [
  "fixed",
  "qty",
  "hourly",
  "material",
  "labor",
  "permit",
  "fee",
  "discount",
] as const;
export type QuoteItemType = (typeof QUOTE_ITEM_TYPES)[number];
export const DEFAULT_QUOTE_ITEM_TYPE: QuoteItemType = "qty";

/**
 * Quantities are stored as integers scaled by 100, so "2.5 hours" is 250.
 * Same reasoning as money-as-cents: a float quantity multiplied by a cents
 * price reintroduces the rounding error we store integers to avoid.
 */
export const QUANTITY_SCALE = 100;

/** How long a new quote stays valid, unless the owner changes the date. */
export const DEFAULT_QUOTE_VALID_DAYS = 30;

/** Quote photo uploads (Supabase Storage bucket `quote-photos`). */
export const QUOTE_PHOTO_BUCKET = "quote-photos";
export const MAX_QUOTE_PHOTO_BYTES = 8 * 1024 * 1024; // 8 MB
export const MAX_QUOTE_PHOTOS = 12;
export const ALLOWED_QUOTE_PHOTO_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;

/**
 * Follow-up cadence (SPEC §12). 0 means the owner has turned nudges off.
 * Stored in businesses.settings.followUpDays.
 */
export const FOLLOW_UP_DAY_OPTIONS = [0, 2, 5] as const;
export type FollowUpDays = (typeof FOLLOW_UP_DAY_OPTIONS)[number];
export const DEFAULT_FOLLOW_UP_DAYS: FollowUpDays = 2;

/** One nudge per quote, so an unanswered quote never becomes harassment. */
export const MAX_FOLLOW_UPS_PER_QUOTE = 1;

/**
 * Reads the cadence out of businesses.settings, defaulting safely.
 * Lives here rather than lib/follow-ups.ts because the settings form is a
 * client component and cannot import a server-only module.
 */
export function followUpDaysFor(settings: unknown): FollowUpDays {
  const value = (settings as { followUpDays?: unknown } | null)?.followUpDays;
  return FOLLOW_UP_DAY_OPTIONS.includes(value as FollowUpDays)
    ? (value as FollowUpDays)
    : DEFAULT_FOLLOW_UP_DAYS;
}

/** Quote events, all of which are recorded forever (golden rule 9). */
export const QUOTE_EVENT_TYPES = [
  "sent",
  "viewed",
  "accepted",
  "declined",
  "follow_up_sent",
] as const;
export type QuoteEventType = (typeof QUOTE_EVENT_TYPES)[number];

/*
 * Web push (SPEC §15). Alerts go to the owner's devices when a customer views
 * or accepts a quote.
 */

/**
 * How long a push service should keep trying to deliver. A day: if the phone
 * was off, "you won the job" is still worth reading tomorrow morning.
 */
export const PUSH_TTL_SECONDS = 24 * 60 * 60;

/**
 * Devices kept per owner. Endpoints rotate, so without a cap an owner's row
 * count creeps up forever — and every stale row is one more doomed request per
 * alert. The oldest are dropped first.
 */
export const MAX_PUSH_SUBSCRIPTIONS_PER_OWNER = 10;

/**
 * Notification tags: a new alert about a quote replaces the older one on the
 * lock screen instead of stacking up.
 */
export function pushTagForQuote(quoteId: string): string {
  return `quote:${quoteId}`;
}

/** Guardrails on free-text fields, mirrored by the Zod schemas at the boundaries. */
export const MAX_NAME_LENGTH = 120;
export const MAX_DESCRIPTION_LENGTH = 500;

/** Logo upload limits (Supabase Storage bucket `logos`). */
export const LOGO_BUCKET = "logos";
export const MAX_LOGO_BYTES = 2 * 1024 * 1024; // 2 MB
export const ALLOWED_LOGO_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;
