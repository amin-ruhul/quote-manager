"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { customers } from "@/db/schema";
import { requireBusiness } from "@/lib/auth";
import { db } from "@/lib/db";
import { toFieldErrors } from "@/lib/form-state";
import { customerSchema } from "@/lib/schemas/customer";
import { idSchema } from "@/lib/schemas/shared";

export type CustomerFormState = {
  error: string | null;
  fieldErrors: Record<string, string>;
  savedAt: number | null;
  savedId: string | null;
};

function readCustomer(formData: FormData) {
  return customerSchema.safeParse({
    firstName: formData.get("firstName") ?? "",
    lastName: formData.get("lastName") ?? "",
    company: formData.get("company") ?? "",
    phone: formData.get("phone") ?? "",
    email: formData.get("email") ?? "",
    address: formData.get("address") ?? "",
    notes: formData.get("notes") ?? "",
  });
}

export async function saveCustomer(
  _prevState: CustomerFormState,
  formData: FormData,
): Promise<CustomerFormState> {
  const { business } = await requireBusiness();

  const parsed = readCustomer(formData);
  if (!parsed.success) {
    return {
      error: null,
      fieldErrors: toFieldErrors(parsed.error.issues),
      savedAt: null,
      savedId: null,
    };
  }

  const rawId = formData.get("id");
  const id = typeof rawId === "string" && rawId !== "" ? rawId : null;

  try {
    if (id) {
      const parsedId = idSchema.safeParse(id);
      if (!parsedId.success) {
        return {
          error: "Something went wrong. Refresh and try again.",
          fieldErrors: {},
          savedAt: null,
          savedId: null,
        };
      }

      const updated = await db
        .update(customers)
        .set({ ...parsed.data, updatedAt: new Date() })
        .where(
          and(
            eq(customers.id, parsedId.data),
            eq(customers.businessId, business.id),
          ),
        )
        .returning({ id: customers.id });

      if (updated.length === 0) {
        return {
          error: "That customer no longer exists.",
          fieldErrors: {},
          savedAt: null,
          savedId: null,
        };
      }

      revalidatePath("/customers");
      return {
        error: null,
        fieldErrors: {},
        savedAt: Date.now(),
        savedId: parsedId.data,
      };
    }

    const [created] = await db
      .insert(customers)
      .values({ ...parsed.data, businessId: business.id })
      .returning({ id: customers.id });

    revalidatePath("/customers");
    revalidatePath("/quotes");
    return {
      error: null,
      fieldErrors: {},
      savedAt: Date.now(),
      savedId: created?.id ?? null,
    };
  } catch (error) {
    console.error("Saving customer failed", {
      businessId: business.id,
      customerId: id,
      error,
    });
    return {
      error: "We couldn't save that customer. Try again.",
      fieldErrors: {},
      savedAt: null,
      savedId: null,
    };
  }
}

export async function deleteCustomer(
  id: string,
): Promise<{ error: string | null }> {
  const { business } = await requireBusiness();

  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return { error: "Something went wrong." };

  try {
    // Quotes keep their history: quotes.customer_id is ON DELETE SET NULL.
    const deleted = await db
      .delete(customers)
      .where(
        and(
          eq(customers.id, parsedId.data),
          eq(customers.businessId, business.id),
        ),
      )
      .returning({ id: customers.id });

    if (deleted.length === 0)
      return { error: "That customer no longer exists." };
  } catch (error) {
    console.error("Deleting customer failed", {
      businessId: business.id,
      customerId: id,
      error,
    });
    return { error: "We couldn't delete that customer. Try again." };
  }

  revalidatePath("/customers");
  return { error: null };
}
