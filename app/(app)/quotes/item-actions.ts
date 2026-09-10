"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { pricebookItems, quoteItems, quoteOptions } from "@/db/schema";
import { QUANTITY_SCALE } from "@/lib/constants";
import { db } from "@/lib/db";
import { toFieldErrors } from "@/lib/form-state";
import { lineTotal } from "@/lib/quote-math";
import { recalculateQuote, requireOwnedQuote } from "@/lib/quotes";
import { quoteItemSchema, quoteOptionSchema } from "@/lib/schemas/quote";
import { idSchema } from "@/lib/schemas/shared";
import type { QuoteFormState } from "@/app/(app)/quotes/actions";

/** Next position for a child row, so new lines land at the bottom. */
async function nextPosition(
  table: typeof quoteItems | typeof quoteOptions,
  quoteId: string,
): Promise<number> {
  const [row] = await db
    .select({ next: sql<number>`coalesce(max(${table.position}), -1) + 1` })
    .from(table)
    .where(eq(table.quoteId, quoteId));

  return row?.next ?? 0;
}

/** Adds one pricebook item to the quote, copying its price at this moment. */
export async function addPricebookItemToQuote(
  quoteId: string,
  pricebookItemId: string,
  optionId: string | null,
): Promise<{ error: string | null }> {
  const owned = await requireOwnedQuote(quoteId);
  if (!owned) return { error: "That quote no longer exists." };

  const parsedItemId = idSchema.safeParse(pricebookItemId);
  if (!parsedItemId.success) return { error: "Pick an item to add." };

  try {
    // Scoped by business_id so another owner's pricebook can't be pulled in.
    const [item] = await db
      .select()
      .from(pricebookItems)
      .where(
        and(
          eq(pricebookItems.id, parsedItemId.data),
          eq(pricebookItems.businessId, owned.business.id),
        ),
      )
      .limit(1);

    if (!item) return { error: "That pricebook item no longer exists." };

    await db.insert(quoteItems).values({
      quoteId: owned.quoteId,
      optionId,
      name: item.name,
      description: item.description,
      quantity: QUANTITY_SCALE, // 1
      unit: item.unit,
      unitPrice: item.price,
      total: item.price,
      type: "qty",
      position: await nextPosition(quoteItems, owned.quoteId),
    });

    await recalculateQuote(owned.quoteId);
  } catch (error) {
    console.error("Adding pricebook item failed", {
      quoteId: owned.quoteId,
      error,
    });
    return { error: "We couldn't add that item. Try again." };
  }

  revalidatePath(`/quotes/${owned.quoteId}`);
  return { error: null };
}

export async function saveQuoteItem(
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

  const parsed = quoteItemSchema.safeParse({
    name: formData.get("name") ?? "",
    description: formData.get("description") ?? "",
    quantity: formData.get("quantity") ?? "",
    unit: formData.get("unit") ?? "each",
    unitPrice: formData.get("unitPrice") ?? "",
    type: formData.get("type") ?? "qty",
    optionId: formData.get("optionId") ?? "",
  });

  if (!parsed.success) {
    return {
      error: null,
      fieldErrors: toFieldErrors(parsed.error.issues),
      savedAt: null,
    };
  }

  // The line total is computed here, never accepted from the form.
  const total = lineTotal(parsed.data);

  const rawId = formData.get("itemId");
  const itemId = typeof rawId === "string" && rawId !== "" ? rawId : null;

  try {
    if (itemId) {
      const parsedItemId = idSchema.safeParse(itemId);
      if (!parsedItemId.success) {
        return {
          error: "Something went wrong.",
          fieldErrors: {},
          savedAt: null,
        };
      }

      const updated = await db
        .update(quoteItems)
        .set({ ...parsed.data, total })
        .where(
          and(
            eq(quoteItems.id, parsedItemId.data),
            eq(quoteItems.quoteId, owned.quoteId),
          ),
        )
        .returning({ id: quoteItems.id });

      if (updated.length === 0) {
        return {
          error: "That line no longer exists.",
          fieldErrors: {},
          savedAt: null,
        };
      }
    } else {
      await db.insert(quoteItems).values({
        ...parsed.data,
        quoteId: owned.quoteId,
        total,
        position: await nextPosition(quoteItems, owned.quoteId),
      });
    }

    await recalculateQuote(owned.quoteId);
  } catch (error) {
    console.error("Saving quote item failed", {
      quoteId: owned.quoteId,
      error,
    });
    return {
      error: "We couldn't save that line. Try again.",
      fieldErrors: {},
      savedAt: null,
    };
  }

  revalidatePath(`/quotes/${owned.quoteId}`);
  return { error: null, fieldErrors: {}, savedAt: Date.now() };
}

export async function deleteQuoteItem(
  quoteId: string,
  itemId: string,
): Promise<{ error: string | null }> {
  const owned = await requireOwnedQuote(quoteId);
  if (!owned) return { error: "That quote no longer exists." };

  const parsedItemId = idSchema.safeParse(itemId);
  if (!parsedItemId.success) return { error: "Something went wrong." };

  try {
    await db
      .delete(quoteItems)
      .where(
        and(
          eq(quoteItems.id, parsedItemId.data),
          eq(quoteItems.quoteId, owned.quoteId),
        ),
      );
    await recalculateQuote(owned.quoteId);
  } catch (error) {
    console.error("Deleting quote item failed", {
      quoteId: owned.quoteId,
      error,
    });
    return { error: "We couldn't remove that line. Try again." };
  }

  revalidatePath(`/quotes/${owned.quoteId}`);
  return { error: null };
}

export async function addQuoteOption(
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

  const parsed = quoteOptionSchema.safeParse({
    name: formData.get("name") ?? "",
    description: formData.get("description") ?? "",
  });

  if (!parsed.success) {
    return {
      error: null,
      fieldErrors: toFieldErrors(parsed.error.issues),
      savedAt: null,
    };
  }

  try {
    await db.insert(quoteOptions).values({
      ...parsed.data,
      quoteId: owned.quoteId,
      position: await nextPosition(quoteOptions, owned.quoteId),
    });
    await recalculateQuote(owned.quoteId);
  } catch (error) {
    console.error("Adding quote option failed", {
      quoteId: owned.quoteId,
      error,
    });
    return {
      error: "We couldn't add that option. Try again.",
      fieldErrors: {},
      savedAt: null,
    };
  }

  revalidatePath(`/quotes/${owned.quoteId}`);
  return { error: null, fieldErrors: {}, savedAt: Date.now() };
}

export async function deleteQuoteOption(
  quoteId: string,
  optionId: string,
): Promise<{ error: string | null }> {
  const owned = await requireOwnedQuote(quoteId);
  if (!owned) return { error: "That quote no longer exists." };

  const parsedOptionId = idSchema.safeParse(optionId);
  if (!parsedOptionId.success) return { error: "Something went wrong." };

  try {
    // Lines assigned to this option cascade away with it.
    await db
      .delete(quoteOptions)
      .where(
        and(
          eq(quoteOptions.id, parsedOptionId.data),
          eq(quoteOptions.quoteId, owned.quoteId),
        ),
      );
    await recalculateQuote(owned.quoteId);
  } catch (error) {
    console.error("Deleting quote option failed", {
      quoteId: owned.quoteId,
      error,
    });
    return { error: "We couldn't remove that option. Try again." };
  }

  revalidatePath(`/quotes/${owned.quoteId}`);
  return { error: null };
}

/** Exactly one option can be the recommended one. */
export async function setRecommendedOption(
  quoteId: string,
  optionId: string,
): Promise<{ error: string | null }> {
  const owned = await requireOwnedQuote(quoteId);
  if (!owned) return { error: "That quote no longer exists." };

  const parsedOptionId = idSchema.safeParse(optionId);
  if (!parsedOptionId.success) return { error: "Something went wrong." };

  try {
    await db.transaction(async (tx) => {
      await tx
        .update(quoteOptions)
        .set({ isRecommended: false })
        .where(eq(quoteOptions.quoteId, owned.quoteId));
      await tx
        .update(quoteOptions)
        .set({ isRecommended: true })
        .where(
          and(
            eq(quoteOptions.id, parsedOptionId.data),
            eq(quoteOptions.quoteId, owned.quoteId),
          ),
        );
    });
    // The headline total follows the recommended option.
    await recalculateQuote(owned.quoteId);
  } catch (error) {
    console.error("Setting recommended option failed", {
      quoteId: owned.quoteId,
      error,
    });
    return { error: "We couldn't update that. Try again." };
  }

  revalidatePath(`/quotes/${owned.quoteId}`);
  return { error: null };
}
