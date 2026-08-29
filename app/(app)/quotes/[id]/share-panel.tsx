"use client";

import { Check, Copy, ExternalLink, Link2, Mail } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { sendQuoteEmail, shareQuote } from "@/app/(app)/quotes/share-actions";
import { Panel } from "@/components/panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Sending, two ways: email it, or take the link and pass it on yourself.
 * Either way the quote leaves draft and starts being tracked.
 */
export function SharePanel({
  quoteId,
  isDraft,
  customerEmail,
}: {
  quoteId: string;
  isDraft: boolean;
  customerEmail: string | null;
}) {
  const [email, setEmail] = useState(customerEmail ?? "");
  const [url, setUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSending, startSending] = useTransition();
  const [isLinking, startLinking] = useTransition();

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
    <Panel className="space-y-4">
      <div>
        <h2 className="font-semibold">Send to your customer</h2>
        <p className="mt-1 text-sm text-ink-60">
          {isDraft
            ? "Sending marks this quote as sent, so you can track when it's opened."
            : "Already sent. You can send it again or share the link."}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sendTo">Customer email</Label>
        <Input
          id="sendTo"
          type="email"
          inputMode="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="customer@example.com"
        />
      </div>

      <Button
        size="lg"
        className="w-full"
        disabled={isSending || email.trim() === ""}
        onClick={() =>
          startSending(async () => {
            const result = await sendQuoteEmail(quoteId, email.trim());
            if (result.error) toast.error(result.error);
            else toast.success(`Quote emailed to ${result.sentTo}.`);
          })
        }
      >
        <Mail />
        {isSending ? "Sending…" : "Email this quote"}
      </Button>

      <div className="space-y-3 border-t border-hairline pt-4">
        <p className="text-sm text-ink-60">
          Or send the link yourself, by text or in person.
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
            variant="ghost"
            size="lg"
            className="w-full sm:w-auto"
            disabled={isLinking}
            onClick={() =>
              startLinking(async () => {
                const result = await shareQuote(quoteId);
                // Discriminate on the null member: `string` isn't a literal
                // type, so truthiness doesn't narrow the union.
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
            {isLinking ? "Preparing…" : "Get customer link"}
          </Button>
        )}
      </div>
    </Panel>
  );
}
