"use client";

import { createContext, useContext, useMemo, useState } from "react";

/*
 * Unsaved edits, shared between the form and the preview.
 *
 * The preview used to render server data, so nothing appeared in it until the
 * owner pressed Save — which meant the one thing the preview is for, seeing the
 * effect of a change, was the one thing it could not show.
 *
 * Only the fields the details form owns live here. Line items, options and
 * photos each save through their own action and revalidate, so the server data
 * is already current for those; layering them in too would mean two sources of
 * truth for the same rows.
 */

export type QuoteDraft = {
  title?: string;
  scopeOfWork?: string | null;
  terms?: string | null;
  /** Integer cents. */
  discount?: number;
  /** Integer basis points. */
  taxRate?: number;
  customerName?: string | null;
  taxExempt?: boolean;
};

type Store = {
  draft: QuoteDraft;
  setDraft: (draft: QuoteDraft) => void;
};

const QuoteDraftContext = createContext<Store>({
  draft: {},
  setDraft: () => {},
});

export function QuoteDraftProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [draft, setDraft] = useState<QuoteDraft>({});
  const value = useMemo(() => ({ draft, setDraft }), [draft]);

  return (
    <QuoteDraftContext.Provider value={value}>
      {children}
    </QuoteDraftContext.Provider>
  );
}

export function useQuoteDraft(): Store {
  return useContext(QuoteDraftContext);
}
