"use client";

import { Eye, Pencil } from "lucide-react";
import { useState } from "react";

/*
 * Editor and preview, laid out by what the screen can actually hold.
 *
 * From lg they sit side by side with the preview sticky — a quote is a document
 * you are building, and watching it change as you edit is the whole point. The
 * preview does NOT go below the editor at any width: at the bottom of a long
 * scroll it is never on screen at the moment it would tell you something.
 *
 * Below lg there is no room for two columns — the keyboard alone takes roughly
 * half the viewport — so it becomes one at a time, switched explicitly. Every
 * comparable tool (Jobber, Housecall Pro, QuickBooks, Square) resolves a phone
 * the same way: a distinct review step before sending, not a squeezed pane.
 */
export function QuoteWorkspace({
  editor,
  preview,
}: {
  editor: React.ReactNode;
  preview: React.ReactNode;
}) {
  const [showPreview, setShowPreview] = useState(false);

  return (
    // Below lg this is one column, so it keeps a form's reading measure. From
    // lg the grid takes over and each pane is sized by its track instead.
    <div className="mx-auto max-w-3xl lg:grid lg:max-w-none lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-start lg:gap-8">
      {/* The switch is phone-only; from lg both panes are on screen already. */}
      <div className="mb-4 lg:hidden">
        <div
          role="tablist"
          aria-label="Quote view"
          className="grid grid-cols-2 rounded-md bg-surface-2 p-0.5"
        >
          <ModeTab
            active={!showPreview}
            onClick={() => setShowPreview(false)}
            icon={<Pencil />}
            label="Edit"
          />
          <ModeTab
            active={showPreview}
            onClick={() => setShowPreview(true)}
            icon={<Eye />}
            label="Preview"
          />
        </div>
      </div>

      <div className={showPreview ? "hidden lg:block" : ""}>{editor}</div>

      {/*
       * top-20 clears the sticky app bar. The pane is its own scroll container
       * so a long quote scrolls inside the preview rather than dragging the
       * editor along with it.
       */}
      <div
        className={`${showPreview ? "" : "hidden lg:block"} lg:sticky lg:top-20 lg:h-[calc(100dvh-7rem)]`}
      >
        {preview}
      </div>
    </div>
  );
}

function ModeTab({
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
      className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-[min(var(--radius-md),8px)] text-sm font-medium transition-colors ${
        active ? "bg-surface text-ink-90 shadow-nav" : "text-ink-60"
      } [&_svg]:size-4`}
    >
      {icon}
      {label}
    </button>
  );
}
