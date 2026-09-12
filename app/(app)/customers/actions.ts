"use server";

import { and, eq, ne, or, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { customers } from "@/db/schema";
import { requireBusiness } from "@/lib/auth";
import { phoneDigits } from "@/lib/customers";
import { db } from "@/lib/db";
import { toFieldErrors } from "@/lib/form-state";
import { customerSchema } from "@/lib/schemas/customer";
import { idSchema } from "@/lib/schemas/shared";

export type CustomerFormState = {
  error: string | null;
  fieldErrors: Record<string, string>;
  savedAt: number | null;
  savedId: string | null;
  /**
   * The existing customer a save clashed with. The message under the field says
   * only that one exists; this is what lets the form offer a way to go and look
   * at them, which is the actually useful next step.
   */
  duplicate: { id: string; field: "email" | "phone" } | null;
};

/**
 * The customer this business already has on this email or phone, if any.
 *
 * Scoped by business_id like every other query here — one owner's contacts are
 * never compared against another's. `excludeId` is the row being edited, so
 * saving a customer over itself is not a clash with itself.
 *
 * Both sides are normalised in SQL rather than trusting how the value was
 * typed: `lower()` because email case is not identity, and digits-only because
 * "(555) 123-4567" and "555.123.4567" are one phone number. Doing it in the
 * query also catches rows stored before those rules existed.
 */
async function findDuplicate(
  businessId: string,
  input: { email: string; phone: string },
  excludeId: string | null,
) {
  const digits = phoneDigits(input.phone);

  const [match] = await db
    .select({
      id: customers.id,
      // Only what decides which field clashed — the name is deliberately not
      // read, because the message doesn't say it.
      email: customers.email,
    })
    .from(customers)
    .where(
      and(
        eq(customers.businessId, businessId),
        excludeId ? ne(customers.id, excludeId) : undefined,
        or(
          sql`lower(${customers.email}) = ${input.email.toLowerCase()}`,
          // Guarded: an empty digit string would match every blank phone.
          digits === ""
            ? sql`false`
            : sql`regexp_replace(coalesce(${customers.phone}, ''), '[^0-9]', '', 'g') = ${digits}`,
        ),
      ),
    )
    .limit(1);

  if (!match) return null;

  /*
   * Which field to blame. Email is checked first because it is the one the
   * quote is actually sent to — if both clash, that is the more useful thing
   * to say.
   */
  const field: "email" | "phone" =
    match.email?.toLowerCase() === input.email.toLowerCase()
      ? "email"
      : "phone";

  /*
   * The message states the fact and stops. Naming the customer here read as an
   * accusation rather than information, and the name alone doesn't help — what
   * the owner wants next is to go and look at that record, which is what the
   * id is carried back for.
   */
  return {
    id: match.id,
    field,
    message:
      field === "email"
        ? "A customer already exists with this email."
        : "A customer already exists with this phone number.",
  };
}

function readCustomer(formData: FormData) {
  return customerSchema.safeParse({
    firstName: formData.get("firstName") ?? "",
    lastName: formData.get("lastName") ?? "",
    company: formData.get("company") ?? "",
    phone: formData.get("phone") ?? "",
    email: formData.get("email") ?? "",
    address: formData.get("address") ?? "",
    notes: formData.get("notes") ?? "",
    taxExempt: formData.get("taxExempt") ?? undefined,
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
      duplicate: null,
    };
  }

  const rawId = formData.get("id");
  const id = typeof rawId === "string" && rawId !== "" ? rawId : null;

  /*
   * Validated up front, not inside the edit branch: it is fed to the duplicate
   * query below as the row to exclude, and an id that isn't a uuid would reach
   * Postgres as one.
   */
  const parsedId = id ? idSchema.safeParse(id) : null;
  if (parsedId && !parsedId.success) {
    return {
      error: "Something went wrong. Refresh and try again.",
      fieldErrors: {},
      savedAt: null,
      savedId: null,
      duplicate: null,
    };
  }
  const customerId = parsedId?.data ?? null;

  try {
    /*
     * Checked before either branch writes, so editing a customer into a clash
     * is caught as well as creating one. Not race-proof — two submits could
     * pass this at once — but there is no unique index behind it on purpose:
     * a couple sharing an email, or a landlord and tenant sharing a phone, are
     * real, and the owner should be told rather than blocked forever.
     */
    const duplicate = await findDuplicate(business.id, parsed.data, customerId);
    if (duplicate) {
      return {
        error: null,
        fieldErrors: { [duplicate.field]: duplicate.message },
        savedAt: null,
        savedId: null,
        duplicate: { id: duplicate.id, field: duplicate.field },
      };
    }

    if (customerId) {
      const updated = await db
        .update(customers)
        .set({ ...parsed.data, updatedAt: new Date() })
        .where(
          and(
            eq(customers.id, customerId),
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
          duplicate: null,
        };
      }

      revalidatePath("/customers");
      return {
        error: null,
        fieldErrors: {},
        savedAt: Date.now(),
        savedId: customerId,
        duplicate: null,
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
      duplicate: null,
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
      duplicate: null,
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
