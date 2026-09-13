"use client";

import { FolderInput, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  addPricebookItemToQuote,
  deleteQuoteItem,
  moveQuoteItemToOption,
} from "@/app/(app)/quotes/item-actions";
import { QuoteLineForm } from "@/app/(app)/quotes/[id]/quote-line-form";
import { Panel } from "@/components/panel";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { PricebookItem, QuoteItem, QuoteOption } from "@/db/schema";
import type { Currency } from "@/lib/constants";
import { formatCents } from "@/lib/money";
import { formatQuantity } from "@/lib/quote-math";

function LineRow({
  quoteId,
  item,
  options,
  currency,
  onEdit,
}: {
  quoteId: string;
  item: QuoteItem;
  /** Every option on the quote, so a line can be moved between them. */
  options: QuoteOption[];
  currency: Currency;
  onEdit: () => void;
}) {
  const [isDeleting, startDeleting] = useTransition();
  const [isMoving, startMoving] = useTransition();

  function moveTo(optionId: string | null) {
    startMoving(async () => {
      const { error } = await moveQuoteItemToOption(quoteId, item.id, optionId);
      if (error) toast.error(error);
    });
  }

  if (isDeleting) {
    return (
      <li className="flex items-center gap-3 p-4" aria-busy="true">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Loader2 className="size-4 animate-spin text-ink-60" />
        <span className="sr-only">Removing {item.name}</span>
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
        <p className="tabular mt-1 text-sm text-ink-60">
          {formatQuantity(item.quantity)} {item.unit} ×{" "}
          {formatCents(item.unitPrice, currency)}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <span className="tabular mr-1 font-medium">
          {formatCents(item.total, currency)}
        </span>

        {/*
          Only worth showing once there is somewhere to move to. Good/Better/
          Best usually starts as a base quote you then upgrade, so moving an
          existing line into one option is the common edit — burying it in the
          line form's "Applies to" select is what left options identical.
        */}
        {options.length > 0 ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Move ${item.name} to an option`}
                loading={isMoving}
              >
                {isMoving ? null : <FolderInput />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Move this line to</DropdownMenuLabel>
              <DropdownMenuItem
                disabled={item.optionId === null}
                onSelect={() => moveTo(null)}
              >
                Every option
              </DropdownMenuItem>
              {options.map((option) => (
                <DropdownMenuItem
                  key={option.id}
                  disabled={item.optionId === option.id}
                  onSelect={() => moveTo(option.id)}
                >
                  Only {option.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}

        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Edit ${item.name}`}
          onClick={onEdit}
        >
          <Pencil />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Remove ${item.name}`}
          className="text-destructive"
          onClick={() =>
            startDeleting(async () => {
              const { error } = await deleteQuoteItem(quoteId, item.id);
              if (error) toast.error(error);
            })
          }
        >
          <Trash2 />
        </Button>
      </div>
    </li>
  );
}

/** One group of lines: either the shared lines or the lines for one option. */
export function QuoteLines({
  quoteId,
  heading,
  items,
  options,
  pricebook,
  currency,
  optionId,
}: {
  quoteId: string;
  /** Null when the section above already names this group. */
  heading: string | null;
  items: QuoteItem[];
  options: QuoteOption[];
  pricebook: PricebookItem[];
  currency: Currency;
  optionId: string | null;
}) {
  const [editing, setEditing] = useState<QuoteItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isPicking, startPicking] = useTransition();

  if (isAdding || editing) {
    return (
      <QuoteLineForm
        quoteId={quoteId}
        item={editing}
        options={options}
        // The owner's own units, taken from the pricebook this page already has.
        units={[...new Set(pricebook.map((entry) => entry.unit))].sort()}
        defaultOptionId={optionId}
        onClose={() => {
          setEditing(null);
          setIsAdding(false);
        }}
      />
    );
  }

  return (
    <section className="space-y-2">
      {heading ? (
        <h3 className="text-sm font-medium text-ink-60">{heading}</h3>
      ) : null}

      {items.length === 0 ? (
        <Panel className="text-sm text-ink-60">
          Nothing here yet. Add a line from your pricebook below.
        </Panel>
      ) : (
        <Panel asChild className="p-0">
          <ul className="divide-y divide-hairline">
            {items.map((item) => (
              <LineRow
                key={item.id}
                quoteId={quoteId}
                item={item}
                options={options}
                currency={currency}
                onEdit={() => setEditing(item)}
              />
            ))}
          </ul>
        </Panel>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Select
          disabled={isPicking || pricebook.length === 0}
          onValueChange={(pricebookItemId) =>
            startPicking(async () => {
              const { error } = await addPricebookItemToQuote(
                quoteId,
                pricebookItemId,
                optionId,
              );
              if (error) toast.error(error);
            })
          }
        >
          <SelectTrigger className="w-full" aria-label="Add from pricebook">
            <SelectValue
              placeholder={
                isPicking
                  ? "Adding…"
                  : pricebook.length === 0
                    ? "Your pricebook is empty"
                    : "Add from pricebook"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {pricebook.map((entry) => (
              <SelectItem key={entry.id} value={entry.id}>
                {entry.name} — {formatCents(entry.price, currency)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          size="lg"
          className="w-full sm:w-auto"
          onClick={() => setIsAdding(true)}
        >
          <Plus />
          Manual line
        </Button>
      </div>
    </section>
  );
}
