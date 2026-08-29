"use client";

import { Check, Copy, ExternalLink, Link2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { shareQuote } from "@/app/(app)/quotes/share-actions";
import { Panel } from "@/components/panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Produces the customer link and marks the quote sent. Email delivery is
 * Phase 5; for now the owner hands the link over themselves.
 */
export function SharePanel({
  quoteId,
  isDraft,
}: {
  quoteId: string;
  isDraft: boolean;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isWorking, startWorking] = useTransition();

  async function copyToClipboard(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Link copied.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard is blocked on insecure origins and some in-app browsers.
      toast.error("Couldn't copy. Select the link and copy it manually.");
    }
  }

  return (
    <Panel className="space-y-3">
      <h2 className="font-semibold">Share with your customer</h2>
      <p className="text-sm text-ink-60">
        {isDraft
          ? "Getting the link marks this quote as sent, so you can track when it's opened."
          : "Anyone with this link can view and accept the quote."}
      </p>

      {url ? (
        <>
          <Input
            readOnly
            value={url}
            aria-label="Public quote link"
            onFocus={(event) => event.currentTarget.select()}
          />
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="ghost"
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => copyToClipboard(url)}
            >
              {copied ? <Check /> : <Copy />}
              {copied ? "Copied" : "Copy link"}
            </Button>
            <Button
              asChild
              variant="ghost"
              size="lg"
              className="w-full sm:w-auto"
            >
              <a href={url} target="_blank" rel="noreferrer">
                <ExternalLink />
                Preview
              </a>
            </Button>
          </div>
        </>
      ) : (
        <Button
          size="lg"
          className="w-full sm:w-auto"
          disabled={isWorking}
          onClick={() =>
            startWorking(async () => {
              const result = await shareQuote(quoteId);
              // Discriminate on the null member, not on truthiness: `string`
              // isn't a literal type, so `if (result.error)` doesn't narrow.
              if (result.error !== null) {
                toast.error(result.error);
                return;
              }
              setUrl(result.url);
              await copyToClipboard(result.url);
            })
          }
        >
          <Link2 />
          {isWorking ? "Preparing…" : "Get customer link"}
        </Button>
      )}
    </Panel>
  );
}
