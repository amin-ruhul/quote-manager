"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { quotes } from "@/db/schema";
import { requireBusiness } from "@/lib/auth";
import { DEFAULT_QUOTE_VALID_DAYS } from "@/lib/constants";
import { db } from "@/lib/db";
import { toFieldErrors } from "@/lib/form-state";
import {
  generatePublicToken,
  nextQuoteNumber,
  recalculateQuote,
  requireOwnedQuote,
} from "@/lib/quotes";
import { quoteDetailsSchema } from "@/lib/schemas/quote";

export type QuoteFormState = {
  error: string | null;
  fieldErrors: Record<string, string>;
  savedAt: number | null;
};

/**
 * Creates an empty draft and returns its id for the caller to navigate to.
 *
 * Deliberately does NOT call redirect(): redirect() works by throwing, so a
 * caller that wraps this in try/catch swallows the navigation and reports a
 * failure for a quote that was in fact created. Returning the id keeps the
 * success and failure paths ordinary values.
 */
export async function createQuote(): Promise<
  { quoteId: string; error: null } | { quoteId: null; error: string }
> {
  const { business } = await requireBusiness();

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
        error: "We couldn't start a new quote. Try again.",
      };
    }

    revalidatePath("/quotes");
    return { quoteId, error: null };
  } catch (error) {
    console.error("Creating quote failed", { businessId: business.id, error });
    return {
      quoteId: null,
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

export async function saveQuoteDetails(
  _prevState: QuoteFormState,
  formData: FormData,
): Promise<QuoteFormState> {
  const owned = await requireOwnedQuote(String(formData.get("quoteId") ?? ""));
  if (!owned) {
    return {
      error: "That quote no longer exists.",
      fieldErrors: {},
      savedAt: null,
    };
  }

  const parsed = quoteDetailsSchema.safeParse({
    title: formData.get("title") ?? "",
    scopeOfWork: formData.get("scopeOfWork") ?? "",
    terms: formData.get("terms") ?? "",
    customerId: formData.get("customerId") ?? "",
    discount: formData.get("discount") ?? "",
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
