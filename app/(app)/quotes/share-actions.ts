"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { quoteEvents, quotes } from "@/db/schema";
import { db } from "@/lib/db";
import { requireOwnedQuote } from "@/lib/quotes";

/**
 * Marks a draft as sent and returns its public link.
 *
 * Emailing the link is Phase 5. Until then this is how a quote leaves draft:
 * the owner copies the link and gives it to the customer themselves, which is
 * still a send, so it records a `sent` event (golden rule 9).
 */
export async function shareQuote(
  quoteId: string,
): Promise<{ url: string; error: null } | { url: null; error: string }> {
  const owned = await requireOwnedQuote(quoteId);
  if (!owned) return { url: null, error: "That quote no longer exists." };

  try {
    const [quote] = await db
      .select({ status: quotes.status, publicToken: quotes.publicToken })
      .from(quotes)
      .where(eq(quotes.id, owned.quoteId))
      .limit(1);

    if (!quote) return { url: null, error: "That quote no longer exists." };

    // Only the first share is a send; re-copying a link later isn't a new one.
    if (quote.status === "draft") {
      await db.transaction(async (tx) => {
        await tx
          .update(quotes)
          .set({ status: "sent", updatedAt: new Date() })
          .where(eq(quotes.id, owned.quoteId));

        await tx.insert(quoteEvents).values({
          quoteId: owned.quoteId,
          type: "sent",
          meta: { via: "link", sentAt: new Date().toISOString() },
        });
      });

      revalidatePath(`/quotes/${owned.quoteId}`);
      revalidatePath("/quotes");
    }

    const base = process.env.NEXT_PUBLIC_APP_URL ?? "";
    return { url: `${base}/q/${quote.publicToken}`, error: null };
  } catch (error) {
    console.error("Sharing quote failed", { quoteId: owned.quoteId, error });
    return { url: null, error: "We couldn't prepare the link. Try again." };
  }
}
