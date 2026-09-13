"use client";

import { Eye, Pencil, Sparkles } from "lucide-react";
import { useState } from "react";

import { QuoteActionBar } from "@/app/(app)/quotes/[id]/quote-action-bar";

/*
 * Editor and preview, laid out by what the screen can actually hold.
 *
 * From lg they sit side by side at 50/50 with the preview sticky. Equal columns
 * rather than a narrow preview rail: the document is the thing being made, so
 * it gets the same weight as the controls making it.
 *
 * Below lg there is no room for two columns — the keyboard alone takes roughly
 * half the viewport — so it is one at a time. The switch between them lives in
 * the floating bar, NOT above the preview: an earlier version put it inside the
 * preview column, which is hidden while editing, so the only control that could
 * reveal the preview was itself invisible until the preview was already open.
 *
 * The bar is rendered here rather than passed in, because it has to own that
 * switch, and the switch needs this component's state.
 */
export function QuoteWorkspace({
  editor,
  aiPanel,
  preview,
  quoteId,
  quoteNumber,
  publicToken,
  premium,
}: {
  editor: React.ReactNode;
  /** The "Create with AI" tab's contents. */
  aiPanel: React.ReactNode;
  preview: React.ReactNode;
  quoteId: string;
  quoteNumber: string;
  publicToken: string;
  /** Passed straight through to the bar, which locks what isn't granted. */
  premium: boolean;
}) {
  const [mode, setMode] = useState<"manual" | "ai">("manual");
  const [showPreview, setShowPreview] = useState(false);

  return (
    // pb-32 keeps the last section clear of the floating bar.
    <div className="pb-32">
      <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-10">
        <div className={showPreview ? "hidden lg:block" : ""}>
          {/*
           * Manual vs AI is how the quote gets built, so it sits above
           * everything and stays visible. Two equal halves, because neither is
           * the fallback for the other.
           */}
          <div
            role="tablist"
            aria-label="How to build this quote"
            className="mb-6 grid grid-cols-2 rounded-lg bg-surface-2 p-1"
          >
            <Tab
              active={mode === "manual"}
              onClick={() => setMode("manual")}
              icon={<Pencil />}
              label="Manual"
            />
            <Tab
              active={mode === "ai"}
              onClick={() => setMode("ai")}
              icon={<Sparkles />}
              label="Create with AI"
            />
          </div>

          {/* Both stay mounted: switching tabs must not discard a half-typed
              description or reset an open section. */}
          <div className={mode === "manual" ? "" : "hidden"}>{editor}</div>
          <div className={mode === "ai" ? "" : "hidden"}>{aiPanel}</div>
        </div>

        {/*
         * top-20 clears the sticky app bar. The pane is its own scroll
         * container so a long quote scrolls inside the preview rather than
         * dragging the editor along with it.
         */}
        {/*
         * A rule in the gutter, not just space. Two columns of white cards on
         * one canvas read as a single wandering list without an edge between
         * them — this is what says "these are the controls, that is the
         * document".
         */}
        <div
          className={`${showPreview ? "" : "hidden lg:block"} lg:sticky lg:top-20 lg:h-[calc(100dvh-8rem)] lg:border-l lg:border-hairline lg:pl-10`}
        >
          {preview}
        </div>
      </div>

      <QuoteActionBar
        quoteId={quoteId}
        quoteNumber={quoteNumber}
        publicToken={publicToken}
        premium={premium}
        previewToggle={
          // Phone only: from lg the preview is already on screen beside this.
          <button
            type="button"
            onClick={() => setShowPreview((open) => !open)}
            aria-pressed={showPreview}
            aria-label={showPreview ? "Back to editing" : "Preview the quote"}
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-pill px-3 text-sm font-medium text-ink-90 transition-colors hover:bg-surface-2 sm:px-4 lg:hidden [&_svg]:size-4"
          >
            {showPreview ? <Pencil /> : <Eye />}
            <span className="max-sm:hidden">
              {showPreview ? "Edit" : "Preview"}
            </span>
          </button>
        }
      />
    </div>
  );
}

function Tab({
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
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors ${
        active ? "bg-surface text-ink-90 shadow-nav" : "text-ink-60"
      } [&_svg]:size-4`}
    >
      {icon}
      {label}
    </button>
  );
}
