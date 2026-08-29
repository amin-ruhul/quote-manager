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
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">Pricebook</h1>
        <p className="mt-2 text-body">
          Your prices, your source of truth. {business.name} ·{" "}
          <span className="tabular">{items.length}</span>{" "}
          {items.length === 1 ? "item" : "items"}
        </p>
      </header>

      <PricebookList items={items} currency={business.currency as Currency} />
    </div>
  );
}
