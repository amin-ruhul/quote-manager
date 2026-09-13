"use server";

import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { quoteEvents, quoteItems, quoteOptions, quotes } from "@/db/schema";
import { requireBusiness } from "@/lib/auth";
import { DEFAULT_QUOTE_VALID_DAYS } from "@/lib/constants";
import { db } from "@/lib/db";
import { toFieldErrors } from "@/lib/form-state";
import {
  generatePublicToken,
  getQuoteForBusiness,
  nextQuoteNumber,
  recalculateQuote,
  requireEditableQuote,
  requireOwnedQuote,
} from "@/lib/quotes";
import { consumeQuoteQuota } from "@/lib/quota";
import { quoteDetailsSchema } from "@/lib/schemas/quote";

export type QuoteFormState = {
  error: string | null;
  fieldErrors: Record<string, string>;
  savedAt: number | null;
};

/**
 * Why a create failed, not just that it did. `atLimit` is the one failure the
 * owner can act on — it sends them to the plan page instead of asking them to
 * try again, which would never work.
 */
export type CreateQuoteResult =
  | { quoteId: string; error: null; atLimit: false }
  | { quoteId: null; error: string; atLimit: boolean };

/**
 * Creates an empty draft and returns its id for the caller to navigate to.
 *
 * Deliberately does NOT call redirect(): redirect() works by throwing, so a
 * caller that wraps this in try/catch swallows the navigation and reports a
 * failure for a quote that was in fact created. Returning the id keeps the
 * success and failure paths ordinary values.
 */
export async function createQuote(): Promise<CreateQuoteResult> {
  const { user, business } = await requireBusiness();

  /*
   * The cap is claimed before anything is written. Doing it the other way
   * around means a failed create still burns a quote off someone's month.
   */
  const quota = await consumeQuoteQuota(user.id);
  if (!quota.allowed) {
    return {
      quoteId: null,
      atLimit: true,
      error: `That's all ${quota.limit} quotes for this month.`,
    };
  }

  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + DEFAULT_QUOTE_VALID_DAYS);

  try {
    const quoteId = await db.transaction(async (tx) => {
      const quoteNumber = await nextQuoteNumber(tx, business.id);

      const [created] = await tx
        .insert(quotes)
        .values({
          businessId: business.id,
          quoteNumber,
          title: "Untitled quote",
          // Snapshot the rate now, so editing business settings later doesn't
          // silently rewrite quotes already drafted.
          taxRate: business.defaultTaxRate,
          publicToken: generatePublicToken(),
          validUntil,
        })
        .returning({ id: quotes.id });

      return created?.id ?? null;
    });

    if (!quoteId) {
      return {
        quoteId: null,
        atLimit: false,
        error: "We couldn't start a new quote. Try again.",
      };
    }

    revalidatePath("/quotes");
    // The header's usage meter moved, and it is rendered by the layout.
    revalidatePath("/", "layout");
    return { quoteId, error: null, atLimit: false };
  } catch (error) {
    console.error("Creating quote failed", { businessId: business.id, error });
    return {
      quoteId: null,
      atLimit: false,
      error: "We couldn't start a new quote. Try again.",
    };
  }
}

export async function deleteQuote(
  quoteId: string,
): Promise<{ error: string | null }> {
  const owned = await requireOwnedQuote(quoteId);
  if (!owned) return { error: "That quote no longer exists." };

  try {
    // Items, options, attachments and events cascade with the quote.
    await db.delete(quotes).where(eq(quotes.id, owned.quoteId));
  } catch (error) {
    console.error("Deleting quote failed", { quoteId, error });
    return { error: "We couldn't delete that quote. Try again." };
  }

  revalidatePath("/quotes");
  return { error: null };
}

/**
 * Copies a quote — its lines, options, discount and tax rate — into a fresh
 * draft. The job an electrician quotes twice a week is the same job; retyping
 * it is the work this removes.
 *
 * What is deliberately NOT copied: the lifecycle (a copy starts as a draft with
 * its own public token and no events), and the photos. A copied attachment row
 * would point at the original's storage object, which is deleted with the
 * original — leaving the copy with broken images.
 */
export async function duplicateQuote(
  quoteId: string,
): Promise<
  | { quoteId: string; quoteNumber: string; error: null }
  | { quoteId: null; quoteNumber: null; error: string }
> {
  const failed = {
    quoteId: null,
    quoteNumber: null,
    error: "We couldn't copy that quote. Try again.",
  } as const;

  const owned = await requireOwnedQuote(quoteId);
  if (!owned) {
    return { ...failed, error: "That quote no longer exists." };
  }

  const source = await getQuoteForBusiness(owned.quoteId, owned.business.id);
  if (!source) {
    return { ...failed, error: "That quote no longer exists." };
  }

  // A copy is a quote. Letting duplicate skip the meter would make the cap
  // trivially avoidable, and the count meaningless.
  const quota = await consumeQuoteQuota(owned.user.id);
  if (!quota.allowed) {
    return {
      ...failed,
      error: `That's all ${quota.limit} quotes for this month. Open Plan & usage to ask for more.`,
    };
  }

  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + DEFAULT_QUOTE_VALID_DAYS);

  /*
   * New option ids are minted here rather than read back from RETURNING, so
   * each copied line can be pointed at its copied option without depending on
   * the order rows come back in.
   */
  const optionIds = new Map(
    source.options.map((option) => [option.id, randomUUID()]),
  );

  try {
    const created = await db.transaction(async (tx) => {
      const quoteNumber = await nextQuoteNumber(tx, owned.business.id);

      const [row] = await tx
        .insert(quotes)
        .values({
          businessId: owned.business.id,
          customerId: source.quote.customerId,
          quoteNumber,
          title: `${source.quote.title} (copy)`,
          scopeOfWork: source.quote.scopeOfWork,
          terms: source.quote.terms,
          discount: source.quote.discount,
          taxRate: source.quote.taxRate,
          publicToken: generatePublicToken(),
          validUntil,
        })
        .returning({ id: quotes.id, quoteNumber: quotes.quoteNumber });

      if (!row) return null;

      if (source.options.length > 0) {
        await tx.insert(quoteOptions).values(
          source.options.map((option) => ({
            id: optionIds.get(option.id),
            quoteId: row.id,
            name: option.name,
            description: option.description,
            isRecommended: option.isRecommended,
            position: option.position,
          })),
        );
      }

      if (source.items.length > 0) {
        await tx.insert(quoteItems).values(
          source.items.map((item) => ({
            quoteId: row.id,
            optionId: item.optionId
              ? (optionIds.get(item.optionId) ?? null)
              : null,
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
            total: item.total,
            type: item.type,
            taxable: item.taxable,
            position: item.position,
          })),
        );
      }

      return row;
    });

    if (!created) return failed;

    // Totals are never trusted from the source row — they are derived again.
    await recalculateQuote(created.id);

    revalidatePath("/quotes");
    return {
      quoteId: created.id,
      quoteNumber: created.quoteNumber,
      error: null,
    };
  } catch (error) {
    console.error("Duplicating quote failed", {
      quoteId: owned.quoteId,
      error,
    });
    return failed;
  }
}

/**
 * Statuses the owner may set by hand from the list. The customer-driven ones
 * (viewed, accepted from the public page) are written by the flows that observe
 * them, and `expired` is the follow-up job's — none of those are a menu item.
 *
 * Marking by hand matters because plenty of quotes are sent and answered off
 * the platform: read out over the phone, accepted in a driveway.
 */
const MANUAL_QUOTE_STATUSES = ["sent", "accepted", "declined"] as const;
const manualStatusSchema = z.enum(MANUAL_QUOTE_STATUSES);

export async function setQuoteStatus(
  quoteId: string,
  status: string,
): Promise<{ error: string | null }> {
  const parsed = manualStatusSchema.safeParse(status);
  if (!parsed.success) return { error: "That isn't a status you can set." };

  const owned = await requireOwnedQuote(quoteId);
  if (!owned) return { error: "That quote no longer exists." };

  try {
    await db.transaction(async (tx) => {
      await tx
        .update(quotes)
        .set({ status: parsed.data, updatedAt: new Date() })
        .where(eq(quotes.id, owned.quoteId));

      // Golden rule 9: the lifecycle is recorded, however it was reached.
      await tx.insert(quoteEvents).values({
        quoteId: owned.quoteId,
        type: parsed.data,
        meta: { via: "manual", at: new Date().toISOString() },
      });
    });
  } catch (error) {
    console.error("Setting quote status failed", {
      quoteId: owned.quoteId,
      status: parsed.data,
      error,
    });
    return { error: "We couldn't update that quote. Try again." };
  }

  revalidatePath(`/quotes/${owned.quoteId}`);
  revalidatePath("/quotes");
  return { error: null };
}

export async function saveQuoteDetails(
  _prevState: QuoteFormState,
  formData: FormData,
): Promise<QuoteFormState> {
  const editable = await requireEditableQuote(
    String(formData.get("quoteId") ?? ""),
  );
  if (!editable.ok) {
    return { error: editable.error, fieldErrors: {}, savedAt: null };
  }
  const owned = editable;

  const parsed = quoteDetailsSchema.safeParse({
    title: formData.get("title") ?? "",
    scopeOfWork: formData.get("scopeOfWork") ?? "",
    terms: formData.get("terms") ?? "",
    customerId: formData.get("customerId") ?? "",
    discount: formData.get("discount") ?? "",
    taxRate: formData.get("taxRate") ?? "",
    validUntil: formData.get("validUntil") ?? "",
  });

  if (!parsed.success) {
    return {
      error: null,
      fieldErrors: toFieldErrors(parsed.error.issues),
      savedAt: null,
    };
  }

  try {
    await db
      .update(quotes)
      .set({
        title: parsed.data.title,
        scopeOfWork: parsed.data.scopeOfWork,
        terms: parsed.data.terms,
        customerId: parsed.data.customerId,
        discount: parsed.data.discount,
        validUntil: parsed.data.validUntil
          ? new Date(parsed.data.validUntil)
          : null,
        updatedAt: new Date(),
      })
      .where(eq(quotes.id, owned.quoteId));

    // The discount changed, so the stored totals are stale.
    await recalculateQuote(owned.quoteId);
  } catch (error) {
    console.error("Saving quote details failed", {
      quoteId: owned.quoteId,
      error,
    });
    return {
      error: "We couldn't save this quote. Try again.",
      fieldErrors: {},
      savedAt: null,
    };
  }

  revalidatePath(`/quotes/${owned.quoteId}`);
  revalidatePath("/quotes");
  return { error: null, fieldErrors: {}, savedAt: Date.now() };
}
