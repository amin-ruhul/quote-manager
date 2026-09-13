/*
 * One source of truth for statuses, plans, and limits (SPEC §16).
 * Nothing here should be duplicated as a string literal elsewhere.
 */

export const PLANS = ["free", "pro", "business"] as const;
export type Plan = (typeof PLANS)[number];
export const DEFAULT_PLAN: Plan = "free";

/** Display names for the plan chip and the billing page. */
export const PLAN_LABELS: Record<Plan, string> = {
  free: "Free",
  pro: "Pro",
  business: "Business",
};

/**
 * Everything above free is an account we granted by hand during the market
 * test. The features that cost real money per use — AI drafting, sending email
 * — are gated on this, never on a plan name spelled out at the call site.
 */
export function isPaidPlan(plan: Plan): boolean {
  return plan !== "free";
}

/** What a locked feature says when the server refuses it. */
export const PREMIUM_LOCKED_MESSAGE =
  "That one's invite-only while we're in beta. Ask for access from Plan & usage.";

/*
 * THE MARKET-TEST SWITCH.
 *
 * While this is false nothing is for sale: no prices, no checkout, no billing
 * links anywhere in the app or on the landing page. Premium is something an
 * owner *asks* for, and access is granted by hand (set `profiles.plan`).
 *
 * The point is to learn whether people want the paid features before paying to
 * build the paid plumbing — the number of upgrade requests is the experiment.
 * None of the Paddle-era billing code was deleted: flipping this to true brings
 * the price cards and the checkout buttons back.
 */
export const BILLING_ENABLED = false;

/**
 * Where "your plan" lives. Two screens, one link: the market-test page that
 * sells nothing, or the real billing page once there is something to buy.
 */
export const PLAN_PAGE_PATH = BILLING_ENABLED ? "/billing" : "/plan";

/**
 * How the marketing pages name the features we grant by hand. Kept here rather
 * than typed into each page, so flipping the switch above cannot leave the
 * landing page calling a paid feature "invite-only" — exactly the kind of
 * stale claim that makes the rest of a page harder to believe.
 */
export const INVITE_ONLY_NOTE = BILLING_ENABLED
  ? "On the paid plans"
  : "Invite-only in beta";

/**
 * The one address a customer, a regulator or a curious visitor can reach a
 * person at. Named here because it appears on the contact page, in the terms
 * and in the privacy policy, and those three disagreeing is how a support
 * address quietly becomes a dead one.
 */
export const SUPPORT_EMAIL = "hello@quotepilot.app";

/**
 * Where an owner was standing when they asked for access. Kept so the requests
 * table can answer "which locked feature actually drives the asking?" — the
 * whole reason for running the test.
 */
export const UPGRADE_REQUEST_SOURCES = [
  "quota",
  "ai",
  "email",
  "pdf",
  "plan",
] as const;
export type UpgradeRequestSource = (typeof UPGRADE_REQUEST_SOURCES)[number];

/** Asking from the plan page itself, rather than from a lock on the way there. */
export const DEFAULT_UPGRADE_REQUEST_SOURCE: UpgradeRequestSource = "plan";

/**
 * What the owner was trying to do when they hit the lock, in their words. Used
 * to open the request form with the right sentence rather than a generic one —
 * someone who came from the AI tab shouldn't have to re-explain why they're
 * there.
 */
export const UPGRADE_REQUEST_PROMPTS: Record<UpgradeRequestSource, string> = {
  quota: "You came from running out of quotes this month.",
  ai: "You came from AI drafting.",
  email: "You came from emailing a quote.",
  pdf: "You came from downloading a PDF.",
  plan: "",
};

/** How far a request has got. Moved by hand while the test runs. */
export const UPGRADE_REQUEST_STATUSES = [
  "new",
  "contacted",
  "granted",
] as const;
export type UpgradeRequestStatus = (typeof UPGRADE_REQUEST_STATUSES)[number];

/** Room for "I quote 20 jobs a week" without room for an essay. */
export const MAX_UPGRADE_NOTE_LENGTH = 500;

/**
 * The freemium cap (SPEC §16), enforced in `lib/quota.ts` — the only thing that
 * should ever block a create. Ten a month is deliberately generous for the
 * market test: enough that a real electrician can run their week on the free
 * plan, few enough that a busy one hits the wall and tells us so.
 */
export const FREE_QUOTES_PER_MONTH = 10;

/**
 * When the usage meter starts warning rather than just informing. Research on
 * freemium conversion is consistent that surfacing the running count *before*
 * the wall converts better than interrupting at it — the owner can plan the
 * upgrade instead of being stopped mid-quote.
 */
export const QUOTA_WARN_AT = 0.8;

/** The quote engine is generic; a trade is just an industry_config row (SPEC §8). */
export const INDUSTRIES = ["electrician"] as const;
export type Industry = (typeof INDUSTRIES)[number];
export const DEFAULT_INDUSTRY: Industry = "electrician";

/*
 * Units and categories are SUGGESTIONS, not closed sets. Both are stored as
 * plain text so an owner can add one we never thought of (a solar installer's
 * "panel", a rural sparky's "trip") without waiting on a release. The lists
 * below are the starting vocabulary the picker offers; `pricebookUnit` in
 * lib/schemas/shared.ts is what actually validates a stored value.
 *
 * Drawn from how residential flat-rate price books are actually organised:
 * per-device ("each"/"point"), per-assembly ("circuit"), per bundled task
 * ("job"), time-and-materials ("hour"/"day"), the trip fee ("visit"), and the
 * takeoff units wire and rewires are measured in ("ft"/"sq ft").
 */

/** Units we offer in the picker, commonest-first for a phone. */
export const SUGGESTED_PRICEBOOK_UNITS = [
  "each",
  "job",
  "hour",
  "visit",
  "day",
  "point",
  "circuit",
  "ft",
  "sq ft",
] as const;

/**
 * Stored as free text, deliberately. Narrowing this to the union above would
 * make every owner-added unit a type error for no safety gain — a unit is a
 * label printed next to a quantity, never something we compute with.
 */
export type PricebookUnit = string;
export const DEFAULT_PRICEBOOK_UNIT = "each";

/** Categories we offer in the picker. Same deal: a starting point, not a fence. */
export const SUGGESTED_PRICEBOOK_CATEGORIES = [
  "Service & Panels",
  "Outlets & Switches",
  "Lighting",
  "Ceiling Fans & Ventilation",
  "EV Charging",
  "Generators & Backup Power",
  "Appliance & HVAC Hookups",
  "Smart Home & Low Voltage",
  "Outdoor & Landscape",
  "Troubleshooting & Repair",
  "Rewiring & Remodels",
  "Safety & Compliance",
  "Labor & Fees",
] as const;

/** A unit is a short label ("sq ft"), never a sentence. */
export const MAX_UNIT_LENGTH = 24;

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

/** The longest address RFC 5321 allows, so a valid one is never rejected. */
export const MAX_EMAIL_LENGTH = 254;

/** Room for an international number with spaces, brackets and an extension. */
export const MAX_PHONE_LENGTH = 40;

/*
 * Phone numbers are counted by their digits, not their characters, so the same
 * number passes however it is punctuated: "(555) 123-4567", "555.123.4567" and
 * "+1 555 123 4567" are all the same ten digits.
 *
 * Seven is the shortest real subscriber number (a local US number without an
 * area code). Twenty is E.164's fifteen plus room for an extension — enough
 * that nothing legitimate is refused, short enough that a typed sentence is.
 */
export const MIN_PHONE_DIGITS = 7;
export const MAX_PHONE_DIGITS = 20;

/**
 * bcrypt hashes at most 72 bytes and silently ignores the rest, so a longer
 * password is not a stronger one — it just hides where the strength stops.
 */
export const MAX_PASSWORD_LENGTH = 72;

/** The post-sign-in redirect path. Long enough for any route this app has. */
export const MAX_REDIRECT_PATH_LENGTH = 512;

/** Auth tokens out of a confirmation link, and the public quote page's token. */
export const MAX_TOKEN_LENGTH = 512;

/**
 * Every money and quantity column is a Postgres `integer` — int4, ceiling
 * 2,147,483,647. This is a hard limit, not a preference: one over and the
 * INSERT fails with "integer out of range", which the owner sees as a generic
 * "we couldn't save that, try again" that retrying can never fix. The schemas
 * below catch it on the field instead, while it is still fixable.
 */
export const MAX_INT4 = 2_147_483_647;

/** $1,000,000.00 in cents — far above any residential job, far below int4. */
export const MAX_PRICE_CENTS = 100_000_000;

/** Whole units on one line. 10,000 ft of wire is already an unusual day. */
export const MAX_QUANTITY = 10_000;

/**
 * Caps on the raw typed string, before it is parsed. "$1,000,000.00" is 13
 * characters, so these only ever stop a paste no one meant to make.
 */
export const MAX_MONEY_INPUT_LENGTH = 20;
export const MAX_QUANTITY_INPUT_LENGTH = 12;
export const MAX_DATE_INPUT_LENGTH = 40;

/** Logo upload limits (Supabase Storage bucket `logos`). */
export const LOGO_BUCKET = "logos";
export const MAX_LOGO_BYTES = 2 * 1024 * 1024; // 2 MB
export const ALLOWED_LOGO_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;
