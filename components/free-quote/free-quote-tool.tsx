"use client";

import { useRef, useState } from "react";

import { QuoteDocument } from "@/components/quote/quote-document";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BASIS_POINTS_PER_PERCENT } from "@/lib/constants";
import { parseDollarsToCents } from "@/lib/money";
import type { PublicQuote } from "@/lib/public-quote";
import { lineTotal, parseQuantity, quoteTotals } from "@/lib/quote-math";

type DraftLine = {
  id: string;
  description: string;
  qty: string;
  price: string;
};

function blankLine(id: string): DraftLine {
  return { id, description: "", qty: "1", price: "" };
}

/** "8.25" -> 825 basis points. Blank or unusable is 0. Capped at 100%. */
function taxBasisPoints(input: string): number {
  const cleaned = input.trim();
  if (cleaned === "" || !/^\d+(\.\d{1,2})?$/.test(cleaned)) return 0;
  const [whole = "0", fraction = ""] = cleaned.split(".");
  const points =
    Number(whole) * BASIS_POINTS_PER_PERCENT +
    Number(fraction.padEnd(2, "0"));
  return Math.min(points, BASIS_POINTS_PER_PERCENT * 100);
}

function toQuote(
  businessName: string,
  customerName: string,
  lines: DraftLine[],
  taxPercent: string,
  notes: string,
): NonNullable<PublicQuote> {
  const items = lines.flatMap((line) => {
    const name = line.description.trim();
    const quantity = parseQuantity(line.qty);
    const unitPrice = parseDollarsToCents(line.price);
    if (!name || quantity === null || unitPrice === null) return [];
    return [
      {
        id: line.id,
        optionId: null,
        name,
        description: null,
        quantity,
        unit: "each",
        unitPrice,
        total: lineTotal({ quantity, unitPrice, taxable: true }),
        type: "qty",
        taxable: true,
      },
    ];
  });

  const totals = quoteTotals({
    lines: items.map((item) => ({
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      taxable: true,
    })),
    taxRateBasisPoints: taxBasisPoints(taxPercent),
  });

  return {
    id: "template",
    quoteNumber: "Draft",
    title: "Electrical quote",
    scopeOfWork: null,
    status: "draft",
    subtotal: totals.subtotal,
    discount: totals.discount,
    tax: totals.tax,
    taxRate: taxBasisPoints(taxPercent),
    total: totals.total,
    validUntil: null,
    terms: notes.trim() || null,
    businessName: businessName.trim() || "Your company",
    businessLogoUrl: null,
    businessPhone: null,
    businessEmail: null,
    businessWebsite: null,
    businessLicense: null,
    currency: "USD",
    customerTaxExempt: false,
    customerFirstName: customerName.trim() || null,
    customerLastName: null,
    ownerPlan: "free",
    items,
    options: [],
    photos: [],
  } as NonNullable<PublicQuote>;
}

export function FreeQuoteTool() {
  const [businessName, setBusinessName] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [lines, setLines] = useState<DraftLine[]>([blankLine("1")]);
  const nextLineId = useRef(2);
  const [taxPercent, setTaxPercent] = useState("");
  const [notes, setNotes] = useState("");

  function updateLine(id: string, patch: Partial<DraftLine>) {
    setLines((current) =>
      current.map((line) => (line.id === id ? { ...line, ...patch } : line)),
    );
  }

  const quote = toQuote(businessName, customerName, lines, taxPercent, notes);

  return (
    <div className="mt-10 grid items-start gap-8 lg:grid-cols-2">
      <form
        className="no-print space-y-5"
        onSubmit={(event) => event.preventDefault()}
      >
        <Field label="Business name" htmlFor="business-name">
          <Input
            id="business-name"
            value={businessName}
            autoComplete="organization"
            placeholder="Bright Spark Electric"
            onChange={(event) => setBusinessName(event.target.value)}
          />
        </Field>

        <Field label="Customer name" htmlFor="customer-name">
          <Input
            id="customer-name"
            value={customerName}
            autoComplete="name"
            placeholder="Sarah Mitchell"
            onChange={(event) => setCustomerName(event.target.value)}
          />
        </Field>

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium">Line items</legend>
          {lines.map((line, index) => (
            <div
              key={line.id}
              className="space-y-2 rounded-lg border border-hairline bg-surface p-3"
            >
              <Field
                label={`Description ${index + 1}`}
                htmlFor={`desc-${line.id}`}
              >
                <Input
                  id={`desc-${line.id}`}
                  value={line.description}
                  placeholder="Recessed light"
                  onChange={(event) =>
                    updateLine(line.id, { description: event.target.value })
                  }
                />
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Qty" htmlFor={`qty-${line.id}`}>
                  <Input
                    id={`qty-${line.id}`}
                    inputMode="decimal"
                    value={line.qty}
                    onChange={(event) =>
                      updateLine(line.id, { qty: event.target.value })
                    }
                  />
                </Field>
                <Field label="Price ($)" htmlFor={`price-${line.id}`}>
                  <Input
                    id={`price-${line.id}`}
                    inputMode="decimal"
                    placeholder="185.00"
                    value={line.price}
                    onChange={(event) =>
                      updateLine(line.id, { price: event.target.value })
                    }
                  />
                </Field>
              </div>
              {lines.length > 1 ? (
                <button
                  type="button"
                  className="text-sm font-medium text-ink-60 underline-offset-2 hover:underline"
                  onClick={() =>
                    setLines((current) =>
                      current.filter((item) => item.id !== line.id),
                    )
                  }
                >
                  Remove line
                </button>
              ) : null}
            </div>
          ))}
          <Button
            type="button"
            variant="soft"
            className="w-full sm:w-auto"
            onClick={() => {
              const id = String(nextLineId.current);
              nextLineId.current += 1;
              setLines((current) => [...current, blankLine(id)]);
            }}
          >
            Add a line
          </Button>
        </fieldset>

        <Field label="Tax %" htmlFor="tax">
          <Input
            id="tax"
            inputMode="decimal"
            placeholder="0"
            value={taxPercent}
            onChange={(event) => setTaxPercent(event.target.value)}
          />
        </Field>

        <Field label="Notes" htmlFor="notes">
          <Textarea
            id="notes"
            rows={4}
            placeholder="Permit and inspection not included. Price good for 30 days."
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </Field>

        <Button
          type="button"
          size="lg"
          className="w-full sm:w-auto"
          onClick={() => window.print()}
        >
          Download PDF
        </Button>
        <p className="text-sm text-ink-60">
          Opens the print dialog. Choose Save as PDF.
        </p>
      </form>

      <div className="print-document lg:sticky lg:top-24">
        <QuoteDocument quote={quote} />
      </div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {children}
    </div>
  );
}
