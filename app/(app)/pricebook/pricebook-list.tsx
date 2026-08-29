"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { deletePricebookItem } from "@/app/(app)/pricebook/actions";
import { PricebookItemDialog } from "@/app/(app)/pricebook/pricebook-item-dialog";
import { Button } from "@/components/ui/button";
import type { PricebookItem } from "@/db/schema";
import type { Currency } from "@/lib/constants";
import { formatCents } from "@/lib/money";

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
            <ul className="divide-y divide-hairline rounded-lg border border-hairline bg-surface">
              {groupItems.map((item) => (
                <li key={item.id} className="flex items-start gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{item.name}</p>
                    {item.description ? (
                      <p className="mt-1 text-sm text-ink-60">
                        {item.description}
                      </p>
                    ) : null}
                    <p className="tabular mt-2 font-medium">
                      {formatCents(item.price, currency)}
                      <span className="font-normal text-ink-40">
                        {" / "}
                        {item.unit}
                      </span>
                    </p>
                  </div>

                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Edit ${item.name}`}
                      onClick={() => setEditing(item)}
                    >
                      <Pencil />
                    </Button>
                    <form action={deletePricebookItem}>
                      <input type="hidden" name="id" value={item.id} />
                      <Button
                        type="submit"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Delete ${item.name}`}
                        className="text-destructive"
                      >
                        <Trash2 />
                      </Button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
