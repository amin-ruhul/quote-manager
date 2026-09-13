"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { quoteAttachments } from "@/db/schema";
import {
  ALLOWED_QUOTE_PHOTO_TYPES,
  MAX_QUOTE_PHOTO_BYTES,
  MAX_QUOTE_PHOTOS,
  QUOTE_PHOTO_BUCKET,
} from "@/lib/constants";
import { db } from "@/lib/db";
import { requireEditableQuote } from "@/lib/quotes";
import { createClient } from "@/lib/supabase/server";
import { idSchema } from "@/lib/schemas/shared";

export async function uploadQuotePhoto(
  formData: FormData,
): Promise<{ error: string | null }> {
  const editable = await requireEditableQuote(
    String(formData.get("quoteId") ?? ""),
  );
  if (!editable.ok) return { error: editable.error };
  const owned = editable;

  const photo = formData.get("photo");
  if (!(photo instanceof File) || photo.size === 0) {
    return { error: "Choose a photo to upload." };
  }
  if (photo.size > MAX_QUOTE_PHOTO_BYTES) {
    return { error: "That photo is over 8 MB. Try a smaller image." };
  }
  if (
    !ALLOWED_QUOTE_PHOTO_TYPES.includes(
      photo.type as (typeof ALLOWED_QUOTE_PHOTO_TYPES)[number],
    )
  ) {
    return { error: "Use a PNG, JPG, or WebP image." };
  }

  const [countRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(quoteAttachments)
    .where(eq(quoteAttachments.quoteId, owned.quoteId));

  const existing = countRow?.count ?? 0;
  if (existing >= MAX_QUOTE_PHOTOS) {
    return { error: `You can attach up to ${MAX_QUOTE_PHOTOS} photos.` };
  }

  // Folder is the user id, which is what the storage RLS policy checks.
  const extension = photo.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${owned.user.id}/${owned.quoteId}/${Date.now()}.${extension}`;

  const supabase = await createClient();
  const { error: uploadError } = await supabase.storage
    .from(QUOTE_PHOTO_BUCKET)
    .upload(path, photo, { contentType: photo.type });

  if (uploadError) {
    console.error("Quote photo upload failed", {
      quoteId: owned.quoteId,
      message: uploadError.message,
    });
    return { error: "We couldn't upload that photo. Try again." };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(QUOTE_PHOTO_BUCKET).getPublicUrl(path);

  await db.insert(quoteAttachments).values({
    quoteId: owned.quoteId,
    url: publicUrl,
    storagePath: path,
    position: existing,
  });

  revalidatePath(`/quotes/${owned.quoteId}`);
  return { error: null };
}

export async function deleteQuotePhoto(
  quoteId: string,
  attachmentId: string,
): Promise<{ error: string | null }> {
  const editable = await requireEditableQuote(quoteId);
  if (!editable.ok) return { error: editable.error };
  const owned = editable;

  const parsedId = idSchema.safeParse(attachmentId);
  if (!parsedId.success) return { error: "Something went wrong." };

  try {
    const [removed] = await db
      .delete(quoteAttachments)
      .where(
        and(
          eq(quoteAttachments.id, parsedId.data),
          eq(quoteAttachments.quoteId, owned.quoteId),
        ),
      )
      .returning({ storagePath: quoteAttachments.storagePath });

    if (!removed) return { error: "That photo no longer exists." };

    // Remove the stored object too, so deleted photos don't linger in the bucket.
    if (removed.storagePath) {
      const supabase = await createClient();
      const { error: storageError } = await supabase.storage
        .from(QUOTE_PHOTO_BUCKET)
        .remove([removed.storagePath]);

      if (storageError) {
        // The row is already gone, so the photo is off the quote. Log and move on.
        console.error("Quote photo file removal failed", {
          quoteId: owned.quoteId,
          message: storageError.message,
        });
      }
    }
  } catch (error) {
    console.error("Deleting quote photo failed", {
      quoteId: owned.quoteId,
      error,
    });
    return { error: "We couldn't remove that photo. Try again." };
  }

  revalidatePath(`/quotes/${owned.quoteId}`);
  return { error: null };
}
