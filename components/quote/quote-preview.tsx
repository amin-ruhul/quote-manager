"use client";

import { Download, FileText, Monitor } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";

type View = "web" | "pdf";

/*
 * What the customer gets, in the two forms they might get it.
 *
 * "Web" is the live <QuoteDocument> passed in as children — the same component
 * /q/[token] renders, so it cannot drift from the real thing.
 *
 * "PDF" is an iframe of the print route. Deliberately not a styled imitation of
 * a page: it is literally the document the printer and (later) the PDF renderer
 * consume, so what the owner checks is what the customer receives. Download
 * prints that same frame.
 */
export function QuotePreview({
  printUrl,
  children,
}: {
  printUrl: string;
  children: React.ReactNode;
}) {
  const [view, setView] = useState<View>("web");
  const frame = useRef<HTMLIFrameElement>(null);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between gap-2 pb-3">
        {/* One control, two states — a segmented switch, not two buttons, so
            it reads as "which view" rather than two separate actions. */}
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

        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            /*
             * Printing the iframe rather than the page prints the document
             * alone — no app chrome, no preview toolbar — and it is the print
             * route's own stylesheet that applies.
             */
            if (view !== "pdf") setView("pdf");
            const win = frame.current?.contentWindow;
            if (win) win.print();
            else window.open(printUrl, "_blank", "noopener");
          }}
        >
          <Download />
          Download PDF
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden rounded-lg border border-hairline bg-canvas">
        {view === "web" ? (
          <div className="h-full overflow-y-auto">{children}</div>
        ) : (
          <iframe
            ref={frame}
            src={printUrl}
            title="PDF preview"
            className="h-full w-full bg-white"
          />
        )}
      </div>

      {view === "pdf" ? (
        <p className="pt-2 text-xs text-ink-60">
          Page breaks may fall differently once printed.
        </p>
      ) : null}
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
