"use client";

import { ChevronRight, Mail, Phone, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { CustomerForm } from "@/app/(app)/customers/customer-form";
import { Panel } from "@/components/panel";
import { Button } from "@/components/ui/button";
import type { Customer } from "@/db/schema";
import { customerName } from "@/lib/customers";

export function CustomerList({ customers }: { customers: Customer[] }) {
  const [isAdding, setIsAdding] = useState(false);

  if (isAdding) {
    return <CustomerForm customer={null} onClose={() => setIsAdding(false)} />;
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
              <li key={customer.id}>
                <Link
                  href={`/customers/${customer.id}`}
                  className="flex items-center gap-3 p-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{customerName(customer)}</p>
                    {customer.company ? (
                      <p className="mt-0.5 text-sm text-ink-60">
                        {customer.company}
                      </p>
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
                  </div>
                  <ChevronRight
                    className="size-4 shrink-0 text-ink-40"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}
