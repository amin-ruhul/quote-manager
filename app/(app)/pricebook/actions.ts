"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { pricebookItems } from "@/db/schema";
import { requireBusiness } from "@/lib/auth";
import { db } from "@/lib/db";
import { toFieldErrors } from "@/lib/form-state";
import { pricebookItemSchema } from "@/lib/schemas/pricebook";
import { idSchema } from "@/lib/schemas/shared";

export type PricebookFormState = {
  error: string | null;
  fieldErrors: Record<string, string>;
  savedAt: number | null;
};

/*
 * Only async functions may be exported from a "use server" file — Next wraps
 * every export as a callable server reference, so an exported object arrives on
 * the client as a function. Initial state therefore lives in the component.
 */

function parseItem(formData: FormData) {
  return pricebookItemSchema.safeParse({
    name: formData.get("name") ?? "",
    description: formData.get("description") ?? "",
    category: formData.get("category") ?? "",
    unit: formData.get("unit") ?? "each",
    price: formData.get("price") ?? "",
  });
}

export async function savePricebookItem(
  _prevState: PricebookFormState,
  formData: FormData,
): Promise<PricebookFormState> {
  // Ownership always comes from the session, never from the form.
  const { business } = await requireBusiness();

  const parsed = parseItem(formData);
  if (!parsed.success) {
    return {
      error: null,
      fieldErrors: toFieldErrors(parsed.error.issues),
      savedAt: null,
    };
  }

  const rawId = formData.get("id");
  const id = typeof rawId === "string" && rawId !== "" ? rawId : null;

  try {
    if (id) {
      const parsedId = idSchema.safeParse(id);
      if (!parsedId.success) {
        return {
          error: parsedId.error.issues[0]?.message ?? "Something went wrong.",
          fieldErrors: {},
          savedAt: null,
        };
      }

      // The business_id predicate is what stops one owner editing another's item.
      const updated = await db
        .update(pricebookItems)
        .set({ ...parsed.data, updatedAt: new Date() })
        .where(
          and(
            eq(pricebookItems.id, parsedId.data),
            eq(pricebookItems.businessId, business.id),
          ),
        )
        .returning({ id: pricebookItems.id });

      if (updated.length === 0) {
        return {
          error: "That item no longer exists.",
          fieldErrors: {},
          savedAt: null,
        };
      }
    } else {
      await db
        .insert(pricebookItems)
        .values({ ...parsed.data, businessId: business.id });
    }
  } catch (error) {
    console.error("Saving pricebook item failed", {
      businessId: business.id,
      itemId: id,
      error,
    });
    return {
      error: "We couldn't save that item. Try again.",
      fieldErrors: {},
      savedAt: null,
    };
  }

  revalidatePath("/pricebook");
  return { error: null, fieldErrors: {}, savedAt: Date.now() };
}

export async function deletePricebookItem(
  id: string,
): Promise<{ error: string | null }> {
  const { business } = await requireBusiness();

  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) {
    return {
      error: parsedId.error.issues[0]?.message ?? "Something went wrong.",
    };
  }

  try {
    // The business_id predicate is what stops one owner deleting another's item.
    const deleted = await db
      .delete(pricebookItems)
      .where(
        and(
          eq(pricebookItems.id, parsedId.data),
          eq(pricebookItems.businessId, business.id),
        ),
      )
      .returning({ id: pricebookItems.id });

    if (deleted.length === 0) {
      return { error: "That item no longer exists." };
    }
  } catch (error) {
    console.error("Deleting pricebook item failed", {
      businessId: business.id,
      itemId: id,
      error,
    });
    return { error: "We couldn't delete that item. Try again." };
  }

  revalidatePath("/pricebook");
  return { error: null };
}
