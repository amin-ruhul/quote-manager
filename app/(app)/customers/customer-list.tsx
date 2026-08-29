"use client";

import { Loader2, Mail, Phone, Plus, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { deleteCustomer } from "@/app/(app)/customers/actions";
import { CustomerForm } from "@/app/(app)/customers/customer-form";
import { Panel } from "@/components/panel";
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
import type { Customer } from "@/db/schema";

export function customerName(customer: Customer): string {
  return [customer.firstName, customer.lastName].filter(Boolean).join(" ");
}

function CustomerRow({
  customer,
  onEdit,
}: {
  customer: Customer;
  onEdit: () => void;
}) {
  const [isDeleting, startDeleting] = useTransition();

  function handleDelete() {
    startDeleting(async () => {
      const { error } = await deleteCustomer(customer.id);
      if (error) toast.error(error);
      else toast.success(`Deleted ${customerName(customer)}.`);
    });
  }

  if (isDeleting) {
    return (
      <li className="flex items-center gap-3 p-4" aria-busy="true">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Loader2 className="size-4 animate-spin text-ink-40" />
        <span className="sr-only">Deleting {customerName(customer)}</span>
      </li>
    );
  }

  return (
    <li className="flex items-start gap-3 p-4">
      <button
        type="button"
        onClick={onEdit}
        className="min-w-0 flex-1 text-left"
      >
        <p className="font-medium">{customerName(customer)}</p>
        {customer.company ? (
          <p className="mt-0.5 text-sm text-ink-60">{customer.company}</p>
        ) : null}
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-60">
          {customer.phone ? (
            <span className="inline-flex items-center gap-1.5">
              <Phone className="size-3.5" aria-hidden />
              {customer.phone}
            </span>
          ) : null}
          {customer.email ? (
            <span className="inline-flex items-center gap-1.5">
              <Mail className="size-3.5" aria-hidden />
              {customer.email}
            </span>
          ) : null}
        </div>
      </button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Delete ${customerName(customer)}`}
            className="shrink-0 text-destructive"
          >
            <Trash2 />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Delete this customer?</AlertDialogTitle>
          <AlertDialogDescription>
            {customerName(customer)} will be removed from your customer list.
            Quotes you already made for them are kept.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogAction asChild>
              <Button
                variant="destructive"
                size="lg"
                className="w-full sm:w-auto"
                onClick={handleDelete}
              >
                Delete customer
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
    </li>
  );
}

export function CustomerList({ customers }: { customers: Customer[] }) {
  const [editing, setEditing] = useState<Customer | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  function close() {
    setEditing(null);
    setIsAdding(false);
  }

  if (isAdding || editing) {
    return <CustomerForm customer={editing} onClose={close} />;
  }

  return (
    <div className="space-y-6">
      <Button size="lg" className="w-full" onClick={() => setIsAdding(true)}>
        <Plus />
        Add customer
      </Button>

      {customers.length === 0 ? (
        <div className="rounded-lg bg-sky p-6">
          <h2 className="font-semibold">No customers yet</h2>
          <p className="mt-2 text-sm">
            Add the people you quote for. You can also add a customer while
            building a quote.
          </p>
        </div>
      ) : (
        <Panel asChild className="p-0">
          <ul className="divide-y divide-hairline">
            {customers.map((customer) => (
              <CustomerRow
                key={customer.id}
                customer={customer}
                onEdit={() => setEditing(customer)}
              />
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}
