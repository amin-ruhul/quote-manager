"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { PricebookItemDialog } from "@/app/(app)/pricebook/pricebook-item-dialog";
import { PricebookRow } from "@/app/(app)/pricebook/pricebook-row";
import { Panel } from "@/components/panel";
import { Button } from "@/components/ui/button";
import type { PricebookItem } from "@/db/schema";
import type { Currency } from "@/lib/constants";

/** Groups items by category so a long pricebook stays scannable on a phone. */
function groupByCategory(items: PricebookItem[]) {
  const groups = new Map<string, PricebookItem[]>();
  for (const item of items) {
    const key = item.category ?? "Uncategorized";
    const group = groups.get(key);
    if (group) group.push(item);
    else groups.set(key, [item]);
  }
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
}

export function PricebookList({
  items,
  currency,
}: {
  items: PricebookItem[];
  currency: Currency;
}) {
  const [editing, setEditing] = useState<PricebookItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const categories = [
    ...new Set(items.map((item) => item.category).filter((c) => c !== null)),
  ].sort();

  if (isAdding || editing) {
    return (
      <PricebookItemDialog
        item={editing}
        categories={categories}
        onClose={() => {
          setEditing(null);
          setIsAdding(false);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Button size="lg" className="w-full" onClick={() => setIsAdding(true)}>
        <Plus />
        Add item
      </Button>

      {items.length === 0 ? (
        <div className="rounded-lg bg-marigold p-6">
          <h2 className="font-semibold">Your pricebook is empty</h2>
          <p className="mt-2 text-sm">
            Add the jobs you quote most often. Once your prices live here, every
            quote takes seconds.
          </p>
        </div>
      ) : (
        groupByCategory(items).map(([category, groupItems]) => (
          <section key={category} className="space-y-2">
            <h2 className="text-sm font-medium text-ink-60">{category}</h2>
            <Panel asChild className="p-0">
              <ul className="divide-y divide-hairline">
                {groupItems.map((item) => (
                  <PricebookRow
                    key={item.id}
                    item={item}
                    currency={currency}
                    onEdit={() => setEditing(item)}
                  />
                ))}
              </ul>
            </Panel>
          </section>
        ))
      )}
    </div>
  );
}
