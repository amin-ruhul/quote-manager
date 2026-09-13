"use client";

import { Check, Download, Link2, Mail, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { deleteQuote } from "@/app/(app)/quotes/actions";
import { QUOTE_DETAILS_FORM_ID } from "@/app/(app)/quotes/[id]/quote-details-form";
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
import { PLAN_PAGE_PATH, type UpgradeRequestSource } from "@/lib/constants";

/*
 * Everything that acts on the quote as a whole, floating over both columns.
 *
 * Pinned rather than parked at the bottom of the editor: these act on the
 * document, not on whichever section happens to be on screen, so they stay
 * reachable at any scroll position. Delete moved here from the foot of the page
 * for the same reason — it was the one whole-quote action you had to scroll to
 * find.
 *
 * Save submits the details form through the native `form` attribute. A button
 * outside a form can submit it by id; that is what the attribute is for, and it
 * keeps this component free of refs and imperative handles.
 */
export function QuoteActionBar({
  quoteId,
  quoteNumber,
  publicToken,
  premium,
  locked,
  previewToggle,
}: {
  quoteId: string;
  quoteNumber: string;
  publicToken: string;
  /** A granted account; the locked stand-ins below are for everyone else. */
  premium: boolean;
  /** Accepted: there is no details form to submit, so Save has nothing to do. */
  locked: boolean;
  /** Phone-only Edit/Preview switch. Lives here because this bar is the one
      thing always on screen, whichever pane is showing. */
  previewToggle?: React.ReactNode;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [isDeleting, startDeleting] = useTransition();

  async function copyLink() {
    /*
     * The token is minted when the quote is created, so there is nothing to
     * generate here — the link exists even for a draft. Built from the live
     * origin rather than a configured base URL, so the copied link is always
     * for the host the owner is actually on.
     */
    const url = `${window.location.origin}/q/${publicToken}`;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be refused; the link is no use if it is nowhere.
      toast.error("Couldn't copy. Use the link in the Share panel.");
    }
  }

  return (
    <div className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-40 flex justify-center px-4 lg:bottom-6">
      {/* Labels collapse to icons on a narrow phone, and the bar can scroll as
          a last resort so nothing is ever clipped out of reach. */}
      <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-pill border border-hairline bg-surface p-1.5 shadow-quote sm:gap-1.5">
        {previewToggle}

        {locked ? null : (
          <Button
            type="submit"
            form={QUOTE_DETAILS_FORM_ID}
            className="shrink-0 rounded-pill max-sm:aspect-square max-sm:px-0"
            aria-label="Save quote"
          >
            <Save />
            <span className="max-sm:hidden">Save</span>
          </Button>
        )}

        <Button
          variant="soft"
          className="shrink-0 rounded-pill max-sm:aspect-square max-sm:px-0"
          onClick={copyLink}
          aria-label={copied ? "Link copied" : "Copy customer link"}
        >
          {copied ? <Check /> : <Link2 />}
          <span className="max-sm:hidden">
            {copied ? "Copied" : "Copy link"}
          </span>
        </Button>

        {/* Both of these are real features for a granted account, and they
            live where they belong — email in the Share panel, PDF on the
            preview's PDF tab — so this bar only carries them while they're
            locked, as the way to go and ask. */}
        {premium ? null : (
          <>
            <LockedFeature label="Email" icon={<Mail />} source="email" />
            <LockedFeature label="PDF" icon={<Download />} source="pdf" />
          </>
        )}

        <span className="mx-0.5 hidden h-6 w-px shrink-0 bg-hairline sm:block" />

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              className="aspect-square shrink-0 rounded-pill px-0 text-ink-60 hover:text-destructive focus-visible:text-destructive"
              aria-label="Delete this quote"
              loading={isDeleting}
            >
              {isDeleting ? null : <Trash2 />}
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogTitle>Delete this quote?</AlertDialogTitle>
            <AlertDialogDescription>
              {quoteNumber} and everything on it — lines, options and photos —
              will be removed. This can&apos;t be undone.
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogAction asChild>
                <Button
                  variant="destructive"
                  size="lg"
                  className="w-full sm:w-auto"
                  onClick={() =>
                    startDeleting(async () => {
                      const { error } = await deleteQuote(quoteId);
                      if (error) toast.error(error);
                      else router.push("/quotes");
                    })
                  }
                >
                  Delete quote
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

/**
 * An action that exists but isn't yours yet.
 *
 * Shown rather than hidden: an owner who never sees a feature never asks for
 * it. And it is a link, not a dead disabled button — the tap does the one
 * thing it can usefully do, which is carry them to the form where they ask
 * for it.
 */
function LockedFeature({
  label,
  icon,
  source,
}: {
  label: string;
  icon: React.ReactNode;
  source: UpgradeRequestSource;
}) {
  return (
    <Button
      asChild
      variant="ghost"
      className="shrink-0 rounded-pill text-ink-60 max-sm:aspect-square max-sm:px-0"
    >
      <Link
        href={`${PLAN_PAGE_PATH}?from=${source}#request`}
        aria-label={`${label} — invite-only while we're in beta. Ask for access.`}
        title={`${label} — invite-only while we're in beta`}
      >
        {icon}
        <span className="max-sm:hidden">{label}</span>
      </Link>
    </Button>
  );
}
