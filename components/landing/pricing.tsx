import Link from "next/link";

import { SectionHeading } from "@/components/landing/section-heading";
import { Button } from "@/components/ui/button";
import { BILLING_ENABLED, FREE_QUOTES_PER_MONTH } from "@/lib/constants";

/* Prices from SPEC §16. Shown openly — hiding them costs more trust than it saves. */
const PLANS = [
  {
    name: "Free",
    price: "$0",
    cadence: "forever",
    line: "Try it on your next job.",
    features: [
      `${FREE_QUOTES_PER_MONTH} quotes a month`,
      "Customer quote page",
      "Accept online",
      "“Made with QuotePilot” on quotes",
    ],
    cta: "Start free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$29",
    cadence: "per month",
    line: "For the electrician quoting every week.",
    features: [
      "Unlimited quotes",
      "Your logo, your branding",
      "Your own pricebook",
      "Open and accept tracking",
      "Send by email",
    ],
    cta: "Start free",
    highlighted: true,
  },
  {
    name: "Business",
    price: "$49",
    cadence: "per month",
    line: "For the ones chasing bigger work.",
    features: [
      "Everything in Pro",
      "AI drafting from a description",
      "Good / better / best options",
      "Automatic follow-up",
      "Acceptance analytics",
    ],
    cta: "Start free",
    highlighted: false,
  },
];

/**
 * What this costs — which, during the market test, is nothing.
 *
 * Quoting a price we don't charge would be the one dishonest thing on the
 * page, and a visitor who signs up expecting a $29 plan and finds no checkout
 * trusts the rest of it less. So the section stays, the prices wait: the card
 * below says free, says which features are invite-only, and says why.
 */
export function Pricing() {
  return BILLING_ENABLED ? <PricedPlans /> : <BetaAccess />;
}

/** What the free plan covers today, and what has to be asked for. */
const BETA_INCLUDED = [
  `${FREE_QUOTES_PER_MONTH} quotes a month`,
  "Your pricebook, your logo, your terms",
  "A customer page they can accept on their phone",
  "Sent, opened and accepted — all tracked",
  "Photos, and good / better / best options",
];

const BETA_INVITE_ONLY = [
  "Unlimited quotes",
  "AI drafting from a job description",
  "Emailing the quote for you",
  "Automatic follow-up when nobody replies",
  "Downloading a quote as a PDF",
];

function BetaAccess() {
  return (
    <section
      id="pricing"
      className="mx-auto max-w-5xl scroll-mt-24 px-5 py-16 sm:px-8 sm:py-24"
    >
      <SectionHeading
        eyebrow="Beta"
        title="Free while we're in beta."
        body="No card, no trial countdown. Quoting is free — the few features that cost us money every time they run are invite-only while we find out who wants them."
        align="center"
      />

      <div className="mt-10 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border-2 border-brand bg-surface p-6">
          <h3 className="font-semibold">Free, right now</h3>
          <p className="mt-2 text-sm text-ink-60">
            Everything it takes to quote a job and win it.
          </p>

          <ul className="mt-5 space-y-2.5 text-sm">
            {BETA_INCLUDED.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <Tick />
                {feature}
              </li>
            ))}
          </ul>

          <Button asChild size="lg" className="mt-6 w-full">
            <Link href="/register">Start free</Link>
          </Button>
        </div>

        <div className="rounded-lg border border-hairline bg-surface p-6">
          <h3 className="font-semibold">Invite-only, for now</h3>
          <p className="mt-2 text-sm text-ink-60">
            Ask from inside the app and we&apos;ll switch them on by hand.
          </p>

          <ul className="mt-5 space-y-2.5 text-sm text-ink-60">
            {BETA_INVITE_ONLY.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <span
                  aria-hidden
                  className="mt-1.5 size-1.5 shrink-0 rounded-pill bg-marigold"
                />
                {feature}
              </li>
            ))}
          </ul>

          <p className="mt-6 rounded-md bg-surface-2 p-3 text-sm text-ink-60">
            We haven&apos;t set a price yet. When we do, you&apos;ll hear it
            from us before anything changes.
          </p>
        </div>
      </div>
    </section>
  );
}

function Tick() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="mt-1 size-3.5 shrink-0 text-brand"
      aria-hidden
    >
      <path
        d="M3 8.5l3.2 3.2L13 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** The priced version, waiting for the day there is something to charge for. */
function PricedPlans() {
  return (
    <section
      id="pricing"
      className="mx-auto max-w-5xl scroll-mt-24 px-5 py-16 sm:px-8 sm:py-24"
    >
      <SectionHeading
        eyebrow="Pricing"
        title="One won job pays for the year."
        body="Start free. No card, no trial countdown. Upgrade when quoting is making you money."
        align="center"
      />

      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={
              plan.highlighted
                ? "relative rounded-lg border-2 border-brand bg-surface p-6"
                : "rounded-lg border border-hairline bg-surface p-6"
            }
          >
            {plan.highlighted ? (
              <span className="absolute -top-3 left-6 rounded-pill bg-brand px-2.5 py-1 text-xs font-medium text-white">
                Most electricians pick this
              </span>
            ) : null}

            <h3 className="font-semibold">{plan.name}</h3>
            <p className="mt-3 flex items-baseline gap-1.5">
              <span className="tabular text-4xl font-semibold">
                {plan.price}
              </span>
              <span className="text-sm text-ink-60">{plan.cadence}</span>
            </p>
            <p className="mt-2 text-sm text-ink-60">{plan.line}</p>

            <ul className="mt-5 space-y-2.5 text-sm">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <svg
                    viewBox="0 0 16 16"
                    className="mt-1 size-3.5 shrink-0 text-brand"
                    aria-hidden
                  >
                    <path
                      d="M3 8.5l3.2 3.2L13 5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            {/* Only the recommended plan gets the filled blue; the others are
                ghost, so no two chromatic buttons compete (DESIGN.md). */}
            <Button
              asChild
              size="lg"
              variant={plan.highlighted ? "default" : "soft"}
              className="mt-6 w-full"
            >
              <Link href="/register">{plan.cta}</Link>
            </Button>
          </div>
        ))}
      </div>

      <p className="mt-6 text-sm text-ink-60">
        Prices in USD. Cancel any time — your quotes and pricebook stay yours.
      </p>
    </section>
  );
}
