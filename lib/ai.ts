import "server-only";

import OpenAI from "openai";

import {
  DEFAULT_PRICEBOOK_UNIT,
  PRICEBOOK_UNITS,
  QUANTITY_SCALE,
  type PricebookUnit,
  type QuoteItemType,
} from "@/lib/constants";

/*
 * The only module that talks to OpenAI (golden rule 4). The key is read here
 * and never leaves the server.
 *
 * SPEC §9. The single most important rule is golden rule 8: the AI never sets a
 * price. Structured Outputs guarantees the SHAPE of the reply, not its honesty,
 * so normalizeDraft() below re-derives every price from the business's own
 * pricebook and throws away whatever number the model produced.
 */

/** Line item types the model may choose. `discount` is deliberately excluded. */
const AI_ITEM_TYPES = [
  "fixed",
  "qty",
  "hourly",
  "material",
  "labor",
  "permit",
  "fee",
] as const;

export type DraftLineItem = {
  name: string;
  description: string;
  /** Whole units as the model sees them; scaled to QUANTITY_SCALE on import. */
  quantity: number;
  unit: PricebookUnit;
  type: QuoteItemType;
  pricebookItemId: string | null;
  /** Integer cents, taken from the pricebook. Null whenever unmatched. */
  unitPrice: number | null;
  needsPrice: boolean;
};

export type SuggestedAddition = { name: string; reason: string };

export type QuoteDraft = {
  scopeOfWork: string;
  lineItems: DraftLineItem[];
  suggestedAdditions: SuggestedAddition[];
};

export type PricebookEntry = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  unit: string;
  price: number;
};

const SYSTEM_PROMPT = `You are an estimating assistant for a residential contractor.
Turn a plain-language job description into structured quote line items.

STRICT RULES:
- Use ONLY prices from the provided pricebook JSON. NEVER invent a price.
- If a line item matches a pricebook item, return its id and unit_price.
- If there is no match, return the item with pricebook_item_id=null,
  unit_price=null, needs_price=true. The owner will set the price.
- Also list commonly-required items the description implies but didn't
  mention (permit, materials, labor) under suggested_additions — do NOT
  price these; the owner decides.
- Write a short, professional scope_of_work paragraph in plain English.
- Quantities are counts of the unit: "six recessed lights" is quantity 6.
- Return ONLY the structured tool output.`;

/** JSON Schema for Structured Outputs. Mirrors SPEC §9 exactly. */
const QUOTE_DRAFT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["scope_of_work", "line_items", "suggested_additions"],
  properties: {
    scope_of_work: { type: "string" },
    line_items: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "name",
          "description",
          "quantity",
          "unit",
          "type",
          "pricebook_item_id",
          "unit_price",
          "needs_price",
        ],
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          quantity: { type: "number" },
          unit: { type: "string", enum: [...PRICEBOOK_UNITS] },
          type: { type: "string", enum: [...AI_ITEM_TYPES] },
          pricebook_item_id: { type: ["string", "null"] },
          unit_price: { type: ["integer", "null"] },
          needs_price: { type: "boolean" },
        },
      },
    },
    suggested_additions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "reason"],
        properties: {
          name: { type: "string" },
          reason: { type: "string" },
        },
      },
    },
  },
} as const;

/* Shape of the raw reply, before we re-derive prices from the pricebook. */
type RawDraft = {
  scope_of_work: unknown;
  line_items: unknown;
  suggested_additions: unknown;
};

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

/**
 * Turns a raw model reply into a QuoteDraft, enforcing the pricing rules.
 *
 * Pure and exported so the rules are testable without calling OpenAI. Every
 * price is looked up from `pricebook` by id — the model's `unit_price` is never
 * trusted, because Structured Outputs constrains shape, not truthfulness.
 */
export function normalizeDraft(
  raw: unknown,
  pricebook: PricebookEntry[],
): QuoteDraft {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("Model reply was not an object");
  }

  const draft = raw as RawDraft;
  const byId = new Map(pricebook.map((entry) => [entry.id, entry]));

  const rawItems = Array.isArray(draft.line_items) ? draft.line_items : [];

  const lineItems: DraftLineItem[] = rawItems.map((entry) => {
    const item = (entry ?? {}) as Record<string, unknown>;

    // A hallucinated id is treated exactly like no match at all.
    const claimedId = asString(item.pricebook_item_id) || null;
    const matched = claimedId ? (byId.get(claimedId) ?? null) : null;

    const quantity =
      typeof item.quantity === "number" && Number.isFinite(item.quantity)
        ? Math.max(item.quantity, 0)
        : 1;

    const unit = PRICEBOOK_UNITS.includes(item.unit as PricebookUnit)
      ? (item.unit as PricebookUnit)
      : ((matched?.unit as PricebookUnit) ?? DEFAULT_PRICEBOOK_UNIT);

    const type = AI_ITEM_TYPES.includes(
      item.type as (typeof AI_ITEM_TYPES)[number],
    )
      ? (item.type as QuoteItemType)
      : "qty";

    return {
      name: asString(item.name, matched?.name ?? "Untitled item"),
      description: asString(item.description),
      quantity: quantity > 0 ? quantity : 1,
      unit,
      type,
      pricebookItemId: matched?.id ?? null,
      // The pricebook is the source of truth. Unmatched means no price, full stop.
      unitPrice: matched ? matched.price : null,
      needsPrice: matched === null,
    };
  });

  const rawAdditions = Array.isArray(draft.suggested_additions)
    ? draft.suggested_additions
    : [];

  const suggestedAdditions: SuggestedAddition[] = rawAdditions
    .map((entry) => {
      const addition = (entry ?? {}) as Record<string, unknown>;
      return {
        name: asString(addition.name),
        reason: asString(addition.reason),
      };
    })
    .filter((addition) => addition.name !== "");

  return {
    scopeOfWork: asString(draft.scope_of_work),
    lineItems,
    suggestedAdditions,
  };
}

/** Scaled integer quantity for quote_items, from the model's whole-unit number. */
export function toScaledQuantity(quantity: number): number {
  const scaled = Math.round(quantity * QUANTITY_SCALE);
  return scaled > 0 ? scaled : QUANTITY_SCALE;
}

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
  }
  /*
   * maxRetries: 0 is deliberate. The SDK retries twice by default, and
   * draftQuote() already retries once per SPEC §10 — stacked, one draft could
   * fire six requests and bill for all of them. Retry policy lives in one
   * place: draftQuote.
   *
   * The owner is waiting on this, so a hung request fails rather than hanging.
   */
  client ??= new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    maxRetries: 0,
    timeout: 30_000,
  });
  return client;
}

async function requestDraft(
  jobDescription: string,
  pricebook: PricebookEntry[],
  industryInstructions: string,
): Promise<unknown> {
  const response = await getClient().chat.completions.create({
    // Model id lives in the environment, never hardcoded (SPEC §6).
    model: process.env.OPENAI_MODEL || "gpt-5.4-mini",
    messages: [
      {
        role: "system",
        content: `${SYSTEM_PROMPT}\n\n${industryInstructions}`,
      },
      {
        role: "user",
        content: `PRICEBOOK (the only prices you may use):\n${JSON.stringify(
          pricebook.map((entry) => ({
            id: entry.id,
            name: entry.name,
            description: entry.description,
            category: entry.category,
            unit: entry.unit,
            price_cents: entry.price,
          })),
        )}\n\nJOB DESCRIPTION:\n${jobDescription}`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "quote_draft",
        strict: true,
        schema: QUOTE_DRAFT_SCHEMA,
      },
    },
  });

  // One line per billed call, so drafting cost is auditable in the server log.
  console.info("AI draft call", {
    model: response.model,
    promptTokens: response.usage?.prompt_tokens,
    completionTokens: response.usage?.completion_tokens,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Model returned no content");

  return JSON.parse(content);
}

/**
 * A bad key or a malformed request will fail identically on a second attempt,
 * so retrying only burns another billed call. SPEC §10's retry is for invalid
 * OUTPUT; transient failures are worth one more go.
 */
function isWorthRetrying(error: unknown): boolean {
  if (error instanceof OpenAI.APIError) {
    const status = error.status ?? 0;
    return status === 429 || status >= 500;
  }
  // Parse or validation failure — exactly the case SPEC asks us to retry.
  return true;
}

/**
 * Job description -> draft line items matched against the business's pricebook.
 *
 * Validates the reply and retries once before giving up (SPEC §10), so one bad
 * generation doesn't surface as an error to the owner. Never throws model
 * output at the caller unchecked.
 */
export async function draftQuote(input: {
  jobDescription: string;
  pricebook: PricebookEntry[];
  industryInstructions: string;
}): Promise<QuoteDraft> {
  let lastError: unknown;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const raw = await requestDraft(
        input.jobDescription,
        input.pricebook,
        input.industryInstructions,
      );
      return normalizeDraft(raw, input.pricebook);
    } catch (error) {
      lastError = error;
      console.error("AI draft attempt failed", { attempt, error });
      if (!isWorthRetrying(error)) break;
    }
  }

  throw new Error("AI draft failed", { cause: lastError });
}
