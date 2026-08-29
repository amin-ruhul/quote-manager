"use server";

import { asc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  industryConfig,
  pricebookItems,
  quoteItems,
  quotes,
} from "@/db/schema";
import {
  type DraftLineItem,
  type QuoteDraft,
  draftQuote,
  toScaledQuantity,
} from "@/lib/ai";
import { MAX_DESCRIPTION_LENGTH } from "@/lib/constants";
import { db } from "@/lib/db";
import { lineTotal } from "@/lib/quote-math";
import { recalculateQuote, requireOwnedQuote } from "@/lib/quotes";
import { rateLimit } from "@/lib/rate-limit";

export type DraftState = {
  error: string | null;
  draft: QuoteDraft | null;
};

const jobDescriptionSchema = z
  .string()
  .trim()
  .min(10, "Describe the job in a sentence or two.")
  .max(4000, "That description is too long.");

/**
 * Generates a draft for the owner to review. Nothing is written to the quote
 * here — golden rule 8 says the owner reviews every draft before it becomes
 * line items.
 */
export async function generateDraft(
  _prevState: DraftState,
  formData: FormData,
): Promise<DraftState> {
  const owned = await requireOwnedQuote(String(formData.get("quoteId") ?? ""));
  if (!owned) return { error: "That quote no longer exists.", draft: null };

  const parsed = jobDescriptionSchema.safeParse(
    formData.get("jobDescription") ?? "",
  );
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? null, draft: null };
  }

  // AI calls cost money on every request, so they are capped per business.
  const { allowed, retryAfterSeconds } = rateLimit({
    key: `ai:${owned.business.id}`,
    limit: 20,
    windowMs: 60 * 60_000,
  });
  if (!allowed) {
    return {
      error: `You've hit the drafting limit for now. Try again in ${Math.ceil(
        retryAfterSeconds / 60,
      )} minutes.`,
      draft: null,
    };
  }

  const [pricebook, [config]] = await Promise.all([
    db
      .select({
        id: pricebookItems.id,
        name: pricebookItems.name,
        description: pricebookItems.description,
        category: pricebookItems.category,
        unit: pricebookItems.unit,
        price: pricebookItems.price,
      })
      .from(pricebookItems)
      .where(eq(pricebookItems.businessId, owned.business.id))
      .orderBy(asc(pricebookItems.name)),
    db
      .select({ aiInstructions: industryConfig.aiInstructions })
      .from(industryConfig)
      .where(eq(industryConfig.industry, owned.business.industry))
      .limit(1),
  ]);

  if (pricebook.length === 0) {
    return {
      error: "Add some pricebook items first — they're the only prices we use.",
      draft: null,
    };
  }

  try {
    const draft = await draftQuote({
      jobDescription: parsed.data,
      pricebook,
      industryInstructions: config?.aiInstructions ?? "",
    });
    return { error: null, draft };
  } catch (error) {
    console.error("Drafting quote failed", {
      businessId: owned.business.id,
      error,
    });
    return {
      error: "We couldn't draft this one. Try rewording the description.",
      draft: null,
    };
  }
}

const importSchema = z.object({
  quoteId: z.uuid(),
  scopeOfWork: z.string().max(4000).nullable(),
  items: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(200),
        description: z.string().trim().max(MAX_DESCRIPTION_LENGTH),
        quantity: z.number().positive().max(100_000),
        unit: z.string(),
        type: z.string(),
        pricebookItemId: z.uuid().nullable(),
      }),
    )
    .min(1, "Pick at least one line to add.")
    .max(50),
});

/**
 * Adds the lines the owner ticked. Prices are re-read from the pricebook here
 * too: the browser only ever sends which pricebook item was chosen, never an
 * amount, so a tampered payload still cannot set a price.
 */
export async function importDraftItems(input: {
  quoteId: string;
  scopeOfWork: string | null;
  items: Pick<
    DraftLineItem,
    "name" | "description" | "quantity" | "unit" | "type" | "pricebookItemId"
  >[];
}): Promise<{ error: string | null }> {
  const parsed = importSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Something went wrong.",
    };
  }

  const owned = await requireOwnedQuote(parsed.data.quoteId);
  if (!owned) return { error: "That quote no longer exists." };

  try {
    const referencedIds = parsed.data.items
      .map((item) => item.pricebookItemId)
      .filter((id): id is string => id !== null);

    // Scoped by business_id, so another owner's prices can't be pulled in.
    const priced =
      referencedIds.length > 0
        ? await db
            .select({ id: pricebookItems.id, price: pricebookItems.price })
            .from(pricebookItems)
            .where(eq(pricebookItems.businessId, owned.business.id))
        : [];
    const priceById = new Map(priced.map((row) => [row.id, row.price]));

    // New lines land after whatever is already on the quote.
    const [positionRow] = await db
      .select({
        next: sql<number>`coalesce(max(${quoteItems.position}), -1) + 1`,
      })
      .from(quoteItems)
      .where(eq(quoteItems.quoteId, owned.quoteId));

    const startPosition = positionRow?.next ?? 0;

    const rows = parsed.data.items.map((item, index) => {
      const unitPrice = item.pricebookItemId
        ? (priceById.get(item.pricebookItemId) ?? 0)
        : 0;
      const quantity = toScaledQuantity(item.quantity);

      return {
        quoteId: owned.quoteId,
        name: item.name,
        description: item.description || null,
        quantity,
        unit: item.unit,
        unitPrice,
        total: lineTotal({ quantity, unitPrice, type: item.type }),
        type: item.type,
        position: startPosition + index,
      };
    });

    await db.transaction(async (tx) => {
      await tx.insert(quoteItems).values(rows);

      if (parsed.data.scopeOfWork) {
        await tx
          .update(quotes)
          .set({ scopeOfWork: parsed.data.scopeOfWork, updatedAt: new Date() })
          .where(eq(quotes.id, owned.quoteId));
      }
    });

    await recalculateQuote(owned.quoteId);
  } catch (error) {
    console.error("Importing draft items failed", {
      quoteId: owned.quoteId,
      error,
    });
    return { error: "We couldn't add those lines. Try again." };
  }

  revalidatePath(`/quotes/${owned.quoteId}`);
  return { error: null };
}
