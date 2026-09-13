"use client";

import { Check, Copy, Link2, Mail } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { sendQuoteEmail, shareQuote } from "@/app/(app)/quotes/share-actions";
import { Panel } from "@/components/panel";
import { PremiumLock } from "@/components/upgrade/premium-lock";
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
  canEmail,
  hasRequestedAccess,
}: {
  quoteId: string;
  isDraft: boolean;
  customerEmail: string | null;
  /** Every send costs us money, so it's invite-only during the beta. */
  canEmail: boolean;
  hasRequestedAccess: boolean;
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

      {/*
       * Sending by email is locked during the beta, but the link half below
       * is not — an owner on the free plan can still get the quote in front of
       * their customer today, which is the promise the product actually makes.
       */}
      {canEmail ? (
        <>
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
            loading={isSending}
            disabled={email.trim() === ""}
            onClick={() =>
              startSending(async () => {
                const result = await sendQuoteEmail(quoteId, email.trim());
                if (result.error) toast.error(result.error);
                else toast.success(`Quote emailed to ${result.sentTo}.`);
              })
            }
          >
            {isSending ? null : <Mail />}
            {isSending ? "Sending…" : "Email this quote"}
          </Button>
        </>
      ) : (
        <PremiumLock
          title="Email it for you"
          description="We send the quote from your business, then tell you the moment your customer opens it."
          source="email"
          requested={hasRequestedAccess}
        />
      )}

      <div className="space-y-3 border-t border-hairline pt-4">
        <p className="text-sm text-ink-60">
          {canEmail
            ? "Or send the link yourself, by text or in person."
            : "Send the link yourself — by text, WhatsApp or in person. It's tracked the same way."}
        </p>

        {url ? (
          <>
            <Input
              readOnly
              value={url}
              aria-label="Public quote link"
              onFocus={(event) => event.currentTarget.select()}
            />
            {/*
              No Preview button here. It opened /q/[token] — the customer's own
              page — which records a `viewed` event and, on a sent quote, flips
              the status and emails the owner that their customer opened it. The
              owner looking at their own quote was writing fake customer
              activity into quote_events (golden rule 9). The preview pane beside
              this editor shows the same document and records nothing.
            */}
            <Button
              variant="ghost"
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => copyToClipboard(url)}
            >
              {copied ? <Check /> : <Copy />}
              {copied ? "Copied" : "Copy link"}
            </Button>
          </>
        ) : (
          <Button
            variant="ghost"
            size="lg"
            className="w-full sm:w-auto"
            loading={isLinking}
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
