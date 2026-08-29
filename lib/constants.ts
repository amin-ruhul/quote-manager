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
