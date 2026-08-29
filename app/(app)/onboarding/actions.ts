"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { businesses, industryConfig, pricebookItems } from "@/db/schema";
import type { DefaultPricebookItem } from "@/db/seed-data/electrician";
import { requireUser } from "@/lib/auth";
import {
  ALLOWED_LOGO_TYPES,
  DEFAULT_INDUSTRY,
  LOGO_BUCKET,
  MAX_LOGO_BYTES,
} from "@/lib/constants";
import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { businessProfileSchema } from "@/lib/validation";

export type BusinessFormState = {
  error: string | null;
  fieldErrors: Record<string, string>;
};

export const emptyBusinessFormState: BusinessFormState = {
  error: null,
  fieldErrors: {},
};

function toFieldErrors(issues: { path: PropertyKey[]; message: string }[]) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

/**
 * Uploads the logo into a folder named after the user id, which is what the
 * storage RLS policy checks. Returns null when no new file was chosen.
 */
async function uploadLogo(
  userId: string,
  file: File,
): Promise<{ url: string } | { error: string }> {
  if (file.size > MAX_LOGO_BYTES) {
    return { error: "That logo is over 2 MB. Try a smaller image." };
  }
  if (
    !ALLOWED_LOGO_TYPES.includes(
      file.type as (typeof ALLOWED_LOGO_TYPES)[number],
    )
  ) {
    return { error: "Use a PNG, JPG, or WebP image." };
  }

  const supabase = await createClient();
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "png";
  const path = `${userId}/logo-${Date.now()}.${extension}`;

  const { error } = await supabase.storage
    .from(LOGO_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) {
    console.error("Logo upload failed", { userId, message: error.message });
    return { error: "We couldn't upload that logo. Try again." };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(LOGO_BUCKET).getPublicUrl(path);

  return { url: publicUrl };
}

/** Copies the trade's default pricebook into the new business (SPEC §10). */
async function seedPricebook(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  businessId: string,
  industry: string,
) {
  const [config] = await tx
    .select({ defaultPricebook: industryConfig.defaultPricebook })
    .from(industryConfig)
    .where(eq(industryConfig.industry, industry))
    .limit(1);

  const defaults = (config?.defaultPricebook ?? []) as DefaultPricebookItem[];
  if (defaults.length === 0) return;

  await tx.insert(pricebookItems).values(
    defaults.map((item) => ({
      businessId,
      name: item.name,
      description: item.description,
      category: item.category,
      unit: item.unit,
      price: item.price,
    })),
  );
}

export async function saveBusinessProfile(
  _prevState: BusinessFormState,
  formData: FormData,
): Promise<BusinessFormState> {
  const user = await requireUser();

  const parsed = businessProfileSchema.safeParse({
    name: formData.get("name") ?? "",
    phone: formData.get("phone") ?? "",
    email: formData.get("email") ?? "",
    website: formData.get("website") ?? "",
    address: formData.get("address") ?? "",
    licenseNumber: formData.get("licenseNumber") ?? "",
    currency: formData.get("currency") ?? "USD",
    defaultTaxRate: formData.get("defaultTaxRate") ?? "",
  });

  if (!parsed.success) {
    return {
      error: "Check the highlighted fields.",
      fieldErrors: toFieldErrors(parsed.error.issues),
    };
  }

  let logoUrl: string | null = null;
  const logo = formData.get("logo");
  if (logo instanceof File && logo.size > 0) {
    const result = await uploadLogo(user.id, logo);
    if ("error" in result) {
      return { error: result.error, fieldErrors: {} };
    }
    logoUrl = result.url;
  }

  // business_id is never taken from the client; ownership comes from the session.
  const [existing] = await db
    .select({ id: businesses.id })
    .from(businesses)
    .where(eq(businesses.ownerId, user.id))
    .limit(1);

  try {
    if (existing) {
      await db
        .update(businesses)
        .set({ ...parsed.data, ...(logoUrl ? { logoUrl } : {}) })
        .where(eq(businesses.ownerId, user.id));
    } else {
      await db.transaction(async (tx) => {
        const [created] = await tx
          .insert(businesses)
          .values({
            ...parsed.data,
            ownerId: user.id,
            industry: DEFAULT_INDUSTRY,
            ...(logoUrl ? { logoUrl } : {}),
          })
          .returning({ id: businesses.id });

        if (created) {
          await seedPricebook(tx, created.id, DEFAULT_INDUSTRY);
        }
      });
    }
  } catch (error) {
    console.error("Saving business profile failed", {
      ownerId: user.id,
      error,
    });
    return {
      error: "We couldn't save your business. Try again.",
      fieldErrors: {},
    };
  }

  revalidatePath("/onboarding");
  revalidatePath("/pricebook");

  if (!existing) redirect("/pricebook");
  return emptyBusinessFormState;
}
