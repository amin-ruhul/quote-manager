"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { businesses } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import {
  ALLOWED_LOGO_TYPES,
  DEFAULT_FOLLOW_UP_DAYS,
  DEFAULT_INDUSTRY,
  LOGO_BUCKET,
  MAX_LOGO_BYTES,
} from "@/lib/constants";
import { db } from "@/lib/db";
import { toFieldErrors } from "@/lib/form-state";
import { createClient } from "@/lib/supabase/server";
import { businessProfileSchema } from "@/lib/schemas/business";

export type BusinessFormState = {
  error: string | null;
  fieldErrors: Record<string, string>;
};

/*
 * Only async functions may be exported from a "use server" file — Next wraps
 * every export as a callable server reference, so an exported object arrives on
 * the client as a function. Initial state therefore lives in the component.
 */

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

/**
 * Recovers the storage path from a public logo URL, so removing a logo can also
 * delete the file rather than orphaning it in the bucket forever.
 *
 * Returns null if the URL isn't one of ours — an unparseable URL means we skip
 * the cleanup, never that we guess at a path and delete the wrong object.
 */
function logoStoragePath(publicUrl: string): string | null {
  const marker = `/${LOGO_BUCKET}/`;
  const index = publicUrl.indexOf(marker);
  if (index === -1) return null;

  const path = publicUrl.slice(index + marker.length).split("?")[0] ?? "";
  return path.length > 0 ? decodeURIComponent(path) : null;
}

/**
 * Best effort: the row is the source of truth, so a failed delete must not fail
 * the save. Worst case is a stray file the owner can no longer see.
 */
async function deleteLogo(publicUrl: string) {
  const path = logoStoragePath(publicUrl);
  if (!path) return;

  const supabase = await createClient();
  const { error } = await supabase.storage.from(LOGO_BUCKET).remove([path]);

  if (error) {
    console.error("Logo delete failed", { path, message: error.message });
  }
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
    followUpDays:
      formData.get("followUpDays") ?? String(DEFAULT_FOLLOW_UP_DAYS),
    defaultTaxRate: formData.get("defaultTaxRate") ?? "",
  });

  if (!parsed.success) {
    return {
      error: "Check the highlighted fields.",
      fieldErrors: toFieldErrors(parsed.error.issues),
    };
  }

  // followUpDays isn't a column: trade settings live in businesses.settings
  // so the core tables stay generic (SPEC §8).
  const { followUpDays, ...profile } = parsed.data;
  const settings = { followUpDays };

  // A new file always wins over the remove flag: if the owner picked a
  // replacement after hitting Remove, they meant the replacement.
  let logoUrl: string | null = null;
  const logo = formData.get("logo");
  if (logo instanceof File && logo.size > 0) {
    const result = await uploadLogo(user.id, logo);
    if ("error" in result) {
      return { error: result.error, fieldErrors: {} };
    }
    logoUrl = result.url;
  }
  const clearLogo = logoUrl === null && formData.get("removeLogo") === "1";

  // business_id is never taken from the client; ownership comes from the session.
  const [existing] = await db
    .select({ id: businesses.id, logoUrl: businesses.logoUrl })
    .from(businesses)
    .where(eq(businesses.ownerId, user.id))
    .limit(1);

  try {
    if (existing) {
      await db
        .update(businesses)
        .set({
          ...profile,
          settings,
          // Three cases, and the difference matters: a new logo, an explicit
          // removal, or leave the column alone.
          ...(logoUrl ? { logoUrl } : clearLogo ? { logoUrl: null } : {}),
        })
        .where(eq(businesses.ownerId, user.id));
    } else {
      /*
       * A new business starts with an empty pricebook, on purpose. We used to
       * copy a default electrician pricebook in here, and it was the wrong
       * favour: the prices were ours, not theirs, and an owner who trusts a
       * number we invented is quoting at a margin nobody chose. The pricebook
       * is the one thing in this product that must be the owner's own work.
       * app/(app)/pricebook has the empty state that asks for the first item.
       */
      await db.insert(businesses).values({
        ...profile,
        settings,
        ownerId: user.id,
        industry: DEFAULT_INDUSTRY,
        ...(logoUrl ? { logoUrl } : {}),
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

  // Only after the row is safely updated — if the write failed above we have
  // already returned, and the file is still the one the row points at.
  if (existing?.logoUrl && (clearLogo || logoUrl)) {
    await deleteLogo(existing.logoUrl);
  }

  revalidatePath("/onboarding");
  revalidatePath("/pricebook");

  if (!existing) redirect("/pricebook");
  return { error: null, fieldErrors: {} };
}
