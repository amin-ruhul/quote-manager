"use client";

import { Check, Lock, Sparkles } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import { requestUpgrade } from "@/app/(app)/plan/actions";
import { Panel } from "@/components/panel";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DEFAULT_UPGRADE_REQUEST_SOURCE,
  FREE_QUOTES_PER_MONTH,
  MAX_UPGRADE_NOTE_LENGTH,
  PLAN_LABELS,
  UPGRADE_REQUEST_PROMPTS,
  type UpgradeRequestSource,
} from "@/lib/constants";
import type { PlanStatus } from "@/lib/plan";

/*
 * Plan & usage, market-test edition.
 *
 * There are no prices on this screen and no way to pay, because there is
 * nothing to pay for yet: the paid features are switched off until enough
 * people ask for them. That is the honest version of this page right now, and
 * an honest "not yet, here's how to ask" converts better than a checkout that
 * charges for something half-built.
 *
 * The price cards live on in `billing-view.tsx` for the day the switch flips.
 */

/* What quoting is, on any plan. The monthly cap is kept separate because a
   granted account has no cap, and listing one next to "unlimited" is a lie. */
const CORE_FEATURES = [
  "Your pricebook, your logo, your terms",
  "Customers, photos and good/better/best options",
  "A customer quote page they can accept on their phone",
  "Open and accept tracking on every quote",
];

const FREE_FEATURES = [
  `${FREE_QUOTES_PER_MONTH} quotes a month`,
  ...CORE_FEATURES,
];

/** The same ticked list on both sides of the granted/not-granted split. */
function FeatureList({ features }: { features: string[] }) {
  return (
    <ul className="space-y-2">
      {features.map((feature) => (
        <li key={feature} className="flex gap-2 text-sm">
          <Check className="mt-0.5 size-4 shrink-0 text-status-accepted" />
          {feature}
        </li>
      ))}
    </ul>
  );
}

const PREMIUM_FEATURES = [
  "Unlimited quotes — no monthly cap",
  "AI drafting — a job description becomes line items",
  "Emailing the quote straight to your customer",
  "Automatic follow-up when nobody replies",
  "Download any quote as a PDF",
];

export function PlanView({
  status,
  source,
}: {
  status: PlanStatus;
  /** Which lock sent them here, so the request records the right door. */
  source: UpgradeRequestSource;
}) {
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);
  const [isSending, startSending] = useTransition();
  const request = useRef<HTMLDivElement>(null);

  /*
   * Someone who arrived from a lock came for the form, so put them in front of
   * it. The link carries #request as well, but the App Router's own hash
   * scrolling doesn't reliably survive the client render — and arriving at the
   * top of a page of feature lists, having just tapped "Request access", reads
   * as though the tap did nothing.
   */
  useEffect(() => {
    if (source === DEFAULT_UPGRADE_REQUEST_SOURCE) return;
    request.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [source]);

  const requested = sent || status.hasPendingRequest;
  const isFree = status.limit !== null;
  const remaining =
    status.limit === null ? null : Math.max(status.limit - status.used, 0);

  return (
    <div className="max-w-2xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold sm:text-3xl">Plan &amp; usage</h1>
        <p className="mt-1 text-body">
          Everything you need to quote is free while we&apos;re in beta.
        </p>
      </header>

      <Panel className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-ink-60">Your plan</p>
            <p className="mt-0.5 text-lg font-semibold">
              {PLAN_LABELS[status.plan]}
            </p>
          </div>

          {isFree ? (
            <div className="text-right">
              <p className="text-sm text-ink-60">This month</p>
              <p className="tabular mt-0.5 text-lg font-semibold">
                {status.used} / {status.limit}
              </p>
            </div>
          ) : null}
        </div>

        {isFree && status.limit !== null ? (
          <>
            {/* One segment per quote, same shape as the header chip, so the
                two never look like different numbers. */}
            <div className="flex items-center gap-1" aria-hidden>
              {Array.from({ length: status.limit }, (_, index) => (
                <span
                  key={index}
                  className={`h-2 flex-1 rounded-sm ${
                    index < status.used
                      ? status.nearLimit
                        ? "bg-status-declined"
                        : "bg-brand"
                      : "bg-hairline-strong"
                  }`}
                />
              ))}
            </div>

            <p className="text-sm text-ink-60">
              {status.atLimit
                ? "You've used every quote in this month's allowance. It resets on the first."
                : `${remaining} ${remaining === 1 ? "quote" : "quotes"} left this month. Your allowance resets on the first.`}
            </p>
          </>
        ) : (
          <p className="text-sm text-ink-60">
            You have unlimited quotes and every beta feature switched on.
          </p>
        )}
      </Panel>

      {/* A granted account has both lists, so showing one of them under
          "Invite-only" would be telling them they can't have what they have. */}
      {isFree ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Panel className="space-y-3">
            <h2 className="font-semibold">Free, right now</h2>
            <FeatureList features={FREE_FEATURES} />
          </Panel>

          <Panel className="space-y-3">
            <h2 className="flex items-center gap-2 font-semibold">
              <Lock className="size-4 text-ink-60" />
              Invite-only
            </h2>
            <ul className="space-y-2">
              {PREMIUM_FEATURES.map((feature) => (
                <li key={feature} className="flex gap-2 text-sm text-ink-60">
                  <Sparkles className="mt-0.5 size-4 shrink-0 text-ink-60" />
                  {feature}
                </li>
              ))}
            </ul>
            <p className="text-xs text-ink-60">
              These cost us money every time they run, so they&apos;re open to a
              handful of businesses while we test.
            </p>
          </Panel>
        </div>
      ) : (
        <Panel className="space-y-3">
          <h2 className="font-semibold">Switched on for you</h2>
          <FeatureList features={[...PREMIUM_FEATURES, ...CORE_FEATURES]} />
          <p className="text-xs text-ink-60">
            Thanks for testing this with us. If something isn&apos;t working the
            way you need it to, tell us — that&apos;s the whole point of the
            beta.
          </p>
        </Panel>
      )}

      {status.plan === "free" ? (
        // scroll-mt clears the sticky app bar when a lock links to #request.
        <Panel
          id="request"
          ref={request}
          className="scroll-mt-24 space-y-4 bg-midnight text-white"
        >
          <div>
            <h2 className="text-lg font-semibold">Want the locked features?</h2>
            <p className="mt-1 text-sm text-white/70">
              {UPGRADE_REQUEST_PROMPTS[source]
                ? `${UPGRADE_REQUEST_PROMPTS[source]} `
                : ""}
              Tell us and we&apos;ll switch them on for you by hand. No card, no
              price — we&apos;re still working out what this should cost.
            </p>
          </div>

          {requested ? (
            <p className="flex items-center gap-2 rounded-md bg-white/10 px-3 py-2.5 text-sm">
              <Check className="size-4 shrink-0" />
              Request sent. We&apos;ll email you when your account is opened up.
            </p>
          ) : (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="note" className="text-white/70">
                  Anything we should know? (optional)
                </Label>
                <Textarea
                  id="note"
                  rows={3}
                  value={note}
                  maxLength={MAX_UPGRADE_NOTE_LENGTH}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="How many quotes do you send a week? What would you use AI for?"
                  className="border-white/20 bg-white/10 text-white placeholder:text-white/40"
                />
              </div>

              <Button
                size="lg"
                className="w-full bg-white text-midnight hover:bg-white/90 sm:w-auto"
                loading={isSending}
                onClick={() =>
                  startSending(async () => {
                    const { error } = await requestUpgrade({ source, note });
                    if (error) {
                      toast.error(error);
                      return;
                    }
                    setSent(true);
                    toast.success("Thanks — we'll be in touch.");
                  })
                }
              >
                {isSending ? null : <Sparkles />}
                Request premium access
              </Button>
            </div>
          )}
        </Panel>
      ) : null}
    </div>
  );
}
