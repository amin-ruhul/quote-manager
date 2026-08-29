"use client";

import { Loader2, Pencil, Trash2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

import { deletePricebookItem } from "@/app/(app)/pricebook/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { PricebookItem } from "@/db/schema";
import type { Currency } from "@/lib/constants";
import { formatCents } from "@/lib/money";

export function PricebookRow({
  item,
  currency,
  onEdit,
}: {
  item: PricebookItem;
  currency: Currency;
  onEdit: () => void;
}) {
  const [isDeleting, startDeleting] = useTransition();

  function handleDelete() {
    startDeleting(async () => {
      const { error } = await deletePricebookItem(item.id);
      if (error) toast.error(error);
      else toast.success(`Deleted "${item.name}".`);
    });
  }

  /*
   * While the delete round-trips, the row it applies to becomes a skeleton, so
   * the feedback sits on the thing being removed rather than only on the button.
   */
  if (isDeleting) {
    return (
      <li className="flex items-center gap-3 p-4" aria-busy="true">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Loader2 className="size-4 animate-spin text-ink-40" />
        <span className="sr-only">Deleting {item.name}</span>
      </li>
    );
  }

  return (
    <li className="flex items-start gap-3 p-4">
      <div className="min-w-0 flex-1">
        <p className="font-medium">{item.name}</p>
        {item.description ? (
          <p className="mt-1 text-sm text-ink-60">{item.description}</p>
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
          onClick={onEdit}
        >
          <Pencil />
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Delete ${item.name}`}
              className="text-destructive"
            >
              <Trash2 />
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogTitle>Delete this item?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{item.name}&rdquo; will be removed from your pricebook.
              This can&apos;t be undone — quotes you already sent keep their
              prices.
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogAction asChild>
                <Button
                  variant="destructive"
                  size="lg"
                  className="w-full sm:w-auto"
                  onClick={handleDelete}
                >
                  Delete item
                </Button>
              </AlertDialogAction>
              <AlertDialogCancel asChild>
                <Button variant="ghost" size="lg" className="w-full sm:w-auto">
                  Keep it
                </Button>
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </li>
  );
}
