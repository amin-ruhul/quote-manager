"use client";

import { Download, FileText, Lock, Monitor } from "lucide-react";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";

import { useQuoteDraft } from "@/app/(app)/quotes/[id]/quote-draft-context";
import { QuoteDocument } from "@/components/quote/quote-document";
import { Button } from "@/components/ui/button";
import { PLAN_PAGE_PATH } from "@/lib/constants";
import type { PublicQuote } from "@/lib/public-quote";
import { quoteTotals } from "@/lib/quote-math";

type View = "web" | "pdf";

/*
 * What the customer gets, in the two forms they might get it.
 *
 * "Web" renders <QuoteDocument> live from the server data with any unsaved
 * edits layered on top, so a change shows up as it is typed rather than after a
 * save. Totals are recomputed with the same quoteTotals() the server uses —
 * it is pure, so the browser and the server cannot disagree.
 *
 * "PDF" is an iframe of the print route: the plain, image-free version, and
 * literally the document the printer receives. It shows saved data only, which
 * is honest — an unsaved change is not in the file you would download.
 */
export function QuotePreview({
  quote,
  printUrl,
  canDownloadPdf,
}: {
  quote: NonNullable<PublicQuote>;
  printUrl: string;
  /** Saving the file is invite-only during the beta; looking at it is not. */
  canDownloadPdf: boolean;
}) {
  const [view, setView] = useState<View>("web");
  const frame = useRef<HTMLIFrameElement>(null);
  const { draft } = useQuoteDraft();

  const live = useMemo(() => {
    const discount = draft.discount ?? quote.discount;
    const taxRate = draft.taxRate ?? quote.taxRate;
    const taxExempt = draft.taxExempt ?? quote.customerTaxExempt ?? false;

    /*
     * Only the single-price case is recomputed. With options the headline
     * follows the recommended option and each option carries its own stored
     * total, which the server owns — recreating that here would be a second
     * implementation of the rule in lib/quotes.ts.
     */
    const totals =
      quote.options.length === 0
        ? quoteTotals({
            lines: quote.items,
            discount,
            taxRateBasisPoints: taxRate,
            taxExempt,
          })
        : {
            subtotal: quote.subtotal,
            discount: quote.discount,
            tax: quote.tax,
            total: quote.total,
          };

    return {
      ...quote,
      title: draft.title?.trim() || quote.title,
      scopeOfWork: draft.scopeOfWork ?? quote.scopeOfWork,
      terms: draft.terms ?? quote.terms,
      taxRate,
      customerTaxExempt: taxExempt,
      customerFirstName:
        draft.customerName !== undefined
          ? draft.customerName
          : quote.customerFirstName,
      customerLastName:
        draft.customerName !== undefined ? null : quote.customerLastName,
      ...totals,
    };
  }, [quote, draft]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between gap-2 pb-3">
        <div
          role="tablist"
          aria-label="Preview format"
          className="inline-flex rounded-md bg-surface-2 p-0.5"
        >
          <ViewTab
            active={view === "web"}
            onClick={() => setView("web")}
            icon={<Monitor />}
            label="Web"
          />
          <ViewTab
            active={view === "pdf"}
            onClick={() => setView("pdf")}
            icon={<FileText />}
            label="PDF"
          />
        </div>

        {/*
         * The preview itself stays open to everyone — seeing what your customer
         * will see is the product. Taking the file away is the invite-only
         * part, so the lock sits on this button and nowhere else.
         */}
        {view === "pdf" ? (
          canDownloadPdf ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => frame.current?.contentWindow?.print()}
            >
              <Download />
              Download
            </Button>
          ) : (
            <Button asChild variant="ghost" size="sm" className="text-ink-60">
              <Link href={`${PLAN_PAGE_PATH}?from=pdf#request`}>
                <Lock />
                Download
              </Link>
            </Button>
          )
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-hidden rounded-lg border border-hairline bg-canvas">
        {view === "web" ? (
          <div className="h-full overflow-y-auto">
            <QuoteDocument quote={live} />
          </div>
        ) : (
          <iframe
            ref={frame}
            src={printUrl}
            title="PDF preview"
            className="h-full w-full bg-white"
          />
        )}
      </div>

      <p className="pt-2 text-xs text-ink-60">
        {view === "pdf"
          ? "The printed version — plain, no photos. Shows saved changes only."
          : "Updates as you type. Line items save on their own."}
      </p>
    </div>
  );
}

function ViewTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-[min(var(--radius-md),8px)] px-3 py-1.5 text-sm font-medium transition-colors ${
        active ? "bg-surface text-ink-90 shadow-nav" : "text-ink-60"
      } [&_svg]:size-3.5`}
    >
      {icon}
      {label}
    </button>
  );
}
