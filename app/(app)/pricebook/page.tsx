import { asc, eq } from "drizzle-orm";

import { PricebookList } from "@/app/(app)/pricebook/pricebook-list";
import { pricebookItems } from "@/db/schema";
import { requireBusiness } from "@/lib/auth";
import type { Currency } from "@/lib/constants";
import { db } from "@/lib/db";

export const metadata = { title: "Pricebook · QuotePilot" };

export default async function PricebookPage() {
  const { business } = await requireBusiness();

  // Scoped by business_id from the session — never from the request.
  const items = await db
    .select()
    .from(pricebookItems)
    .where(eq(pricebookItems.businessId, business.id))
    .orderBy(asc(pricebookItems.category), asc(pricebookItems.name));

  return (
    /*
     * A list of short names against right-aligned prices, so it keeps its own
     * measure rather than taking the shell's full 1200px — at that width the
     * middle of every row was empty and the eye had to travel to connect a name
     * to its price. Same call the quote builder makes for the same reason.
     */
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold sm:text-3xl">Pricebook</h1>
        <p className="mt-1 text-body">
          <span className="tabular">{items.length}</span>{" "}
          {items.length === 1 ? "item" : "items"}
        </p>
      </header>

      <PricebookList items={items} currency={business.currency as Currency} />
    </div>
  );
}
