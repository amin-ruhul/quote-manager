"use client";

import {
  Check,
  Copy,
  Download,
  Link2,
  Lock,
  MoreHorizontal,
  Pencil,
  Send,
  Trash2,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  deleteQuote,
  duplicateQuote,
  setQuoteStatus,
} from "@/app/(app)/quotes/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PLAN_PAGE_PATH, type QuoteStatus } from "@/lib/constants";

/**
 * Everything you can do to a quote without opening it.
 *
 * The list is where an owner triages — between jobs, one-handed — so the common
 * moves (send the link, mark it won, copy last month's job) shouldn't cost a
 * page load each.
 *
 * Delete is confirmed in a dialog rendered outside the menu: a dialog mounted
 * inside a menu item unmounts with the menu the instant it is chosen.
 */
export function QuoteRowMenu({
  quoteId,
  quoteNumber,
  status,
  publicToken,
  premium,
  className,
}: {
  quoteId: string;
  quoteNumber: string;
  status: QuoteStatus;
  publicToken: string;
  /** A granted account: the PDF item downloads instead of asking. */
  premium: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isBusy, startAction] = useTransition();

  async function copyLink() {
    // The token exists from the moment the quote does, so even a draft has a
    // link. Built from the live origin, so it is always for the host in use.
    const url = `${window.location.origin}/q/${publicToken}`;

    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied.");
    } catch {
      // Clipboard access is refused on insecure origins and in some in-app
      // browsers; a link that went nowhere must not look like it worked.
      toast.error("Couldn't copy. Open the quote and use the Share panel.");
    }
  }

  function markAs(next: "sent" | "accepted" | "declined", label: string) {
    startAction(async () => {
      const { error } = await setQuoteStatus(quoteId, next);
      if (error) toast.error(error);
      else toast.success(`${quoteNumber} marked as ${label}.`);
    });
  }

  function downloadPdf() {
    /*
     * The print route, not the customer's page: it records no view, and it is
     * the same document the PDF tab in the builder shows. Opened in a tab of
     * its own so the list stays where it was.
     */
    const printed = window.open(`/q/${publicToken}/print`, "_blank");
    if (!printed) {
      toast.error("Your browser blocked the tab. Allow pop-ups to download.");
      return;
    }
    printed.addEventListener("load", () => printed.print(), { once: true });
  }

  function duplicate() {
    startAction(async () => {
      const result = await duplicateQuote(quoteId);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(`Copied to ${result.quoteNumber}.`);
      router.push(`/quotes/${result.quoteId}`);
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Actions for ${quoteNumber}`}
            loading={isBusy}
            className={className}
          >
            {isBusy ? null : <MoreHorizontal />}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => router.push(`/quotes/${quoteId}`)}>
            <Pencil />
            Edit quote
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={copyLink}>
            <Link2 />
            Copy customer link
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={duplicate}>
            <Copy />
            Duplicate
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Not every quote is answered in the app: plenty are read out over
              the phone and accepted in a driveway. */}
          {status !== "sent" ? (
            <DropdownMenuItem onSelect={() => markAs("sent", "sent")}>
              <Send />
              Mark as sent
            </DropdownMenuItem>
          ) : null}
          {status !== "accepted" ? (
            <DropdownMenuItem
              onSelect={() => markAs("accepted", "accepted")}
              className="text-status-accepted [&_svg]:text-status-accepted"
            >
              <Check />
              Mark as accepted
            </DropdownMenuItem>
          ) : null}
          {status !== "declined" ? (
            <DropdownMenuItem onSelect={() => markAs("declined", "declined")}>
              <XCircle />
              Mark as declined
            </DropdownMenuItem>
          ) : null}

          <DropdownMenuSeparator />

          {/*
           * Shown rather than hidden, same as the quote's own action bar: an
           * owner who never sees a feature never asks for it. Locked, it is a
           * way to ask; granted, it opens the print view — the plain,
           * image-free document the PDF is made from — and raises the print
           * dialog, which is where "download" actually happens in a browser.
           */}
          {premium ? (
            <DropdownMenuItem onSelect={downloadPdf}>
              <Download />
              Download PDF
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onSelect={() => router.push(`${PLAN_PAGE_PATH}?from=pdf#request`)}
            >
              <Lock />
              Download PDF
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            // Chosen without preventing the default close: the dialog is a
            // sibling of the menu, so it outlives it and the menu shouldn't
            // sit open behind the confirmation.
            onSelect={() => setConfirmingDelete(true)}
            className="text-destructive [&_svg]:text-destructive"
          >
            <Trash2 />
            Delete quote
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmingDelete} onOpenChange={setConfirmingDelete}>
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
                  startAction(async () => {
                    const { error } = await deleteQuote(quoteId);
                    if (error) toast.error(error);
                    else toast.success(`${quoteNumber} deleted.`);
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
    </>
  );
}
