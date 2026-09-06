"use client";

import { Loader2, Mail, MapPin, Phone, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { deleteCustomer } from "@/app/(app)/customers/actions";
import { CustomerForm } from "@/app/(app)/customers/customer-form";
import { Panel } from "@/components/panel";
import { QuoteStatusPill } from "@/components/quote-status-pill";
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
import type { Customer } from "@/db/schema";
import type { Currency, QuoteStatus } from "@/lib/constants";
import { customerName } from "@/lib/customers";
import { formatCents } from "@/lib/money";

type QuoteRow = {
  id: string;
  quoteNumber: string;
  title: string;
  status: string;
  total: number;
  updatedAt: Date;
};

export function CustomerDetail({
  customer,
  quotes,
  quotedCents,
  wonCents,
  currency,
}: {
  customer: Customer;
  quotes: QuoteRow[];
  quotedCents: number;
  wonCents: number;
  currency: Currency;
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, startDeleting] = useTransition();

  if (isEditing) {
    return (
      <CustomerForm
        customer={customer}
        onClose={() => setIsEditing(false)}
        onSaved={() => router.refresh()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">{customerName(customer)}</h1>
        {customer.company ? (
          <p className="mt-1 text-body">{customer.company}</p>
        ) : null}
      </header>

      <Panel className="space-y-3">
        {customer.phone ? (
          <ContactRow icon={<Phone className="size-4" aria-hidden />}>
            <a href={`tel:${customer.phone}`} className="text-brand">
              {customer.phone}
            </a>
          </ContactRow>
        ) : null}
        {customer.email ? (
          <ContactRow icon={<Mail className="size-4" aria-hidden />}>
            <a href={`mailto:${customer.email}`} className="text-brand">
              {customer.email}
            </a>
          </ContactRow>
        ) : null}
        {customer.address ? (
          <ContactRow icon={<MapPin className="size-4" aria-hidden />}>
            <span className="whitespace-pre-line">{customer.address}</span>
          </ContactRow>
        ) : null}
        {!customer.phone && !customer.email && !customer.address ? (
          <p className="text-sm text-ink-60">
            No contact details yet. Add a phone or email so quotes can reach
            them.
          </p>
        ) : null}

        {customer.notes ? (
          <p className="mt-2 border-t border-hairline pt-3 text-sm whitespace-pre-line text-ink-60">
            {customer.notes}
          </p>
        ) : null}

        <div className="flex flex-col gap-2 pt-2 sm:flex-row">
          <Button
            variant="ghost"
            size="lg"
            className="w-full sm:w-auto"
            onClick={() => setIsEditing(true)}
          >
            Edit details
          </Button>
        </div>
      </Panel>

      <div className="grid grid-cols-2 gap-2">
        <Stat label="Quoted" value={formatCents(quotedCents, currency)} />
        <Stat label="Won" value={formatCents(wonCents, currency)} accent />
      </div>

      <section className="space-y-2">
        <h2 className="font-semibold">Quote history</h2>

        {quotes.length === 0 ? (
          <Panel className="text-sm text-ink-60">
            No quotes for this customer yet. Start one from the Quotes tab and
            pick them as the customer.
          </Panel>
        ) : (
          <Panel asChild className="p-0">
            <ul className="divide-y divide-hairline">
              {quotes.map((quote) => (
                <li key={quote.id}>
                  <Link
                    href={`/quotes/${quote.id}`}
                    className="flex items-start gap-3 p-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="tabular text-sm text-ink-60">
                          {quote.quoteNumber}
                        </span>
                        <QuoteStatusPill status={quote.status as QuoteStatus} />
                      </div>
                      <p className="mt-1 font-medium">{quote.title}</p>
                    </div>
                    <span className="tabular shrink-0 font-medium">
                      {formatCents(quote.total, currency)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
        )}
      </section>

      <div className="flex flex-col gap-2 border-t border-hairline pt-6 sm:flex-row-reverse sm:justify-start">
        <Button asChild variant="ghost" size="lg" className="w-full sm:w-auto">
          <Link href="/customers">Back to customers</Link>
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="lg"
              className="w-full text-destructive sm:w-auto"
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
              Delete customer
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogTitle>Delete this customer?</AlertDialogTitle>
            <AlertDialogDescription>
              {customerName(customer)} will be removed from your customer list.
              Their {quotes.length === 1 ? "quote" : "quotes"} are kept, but no
              longer linked to anyone.
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogAction asChild>
                <Button
                  variant="destructive"
                  size="lg"
                  className="w-full sm:w-auto"
                  onClick={() =>
                    startDeleting(async () => {
                      const { error } = await deleteCustomer(customer.id);
                      if (error) toast.error(error);
                      else router.push("/customers");
                    })
                  }
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
      </div>
    </div>
  );
}

function ContactRow({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5 text-sm text-ink-60">
      <span className="mt-0.5 shrink-0 text-ink-60">{icon}</span>
      {children}
    </div>
  );
}

/** Accent card for the "won" figure — DESIGN.md puts colour in card backgrounds. */
function Stat({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={
        accent
          ? "rounded-lg bg-marigold p-4"
          : "rounded-lg border border-hairline bg-surface p-4"
      }
    >
      <p className={accent ? "text-sm" : "text-sm text-ink-60"}>{label}</p>
      <p className="tabular mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}
