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
      "“Made with QuotePace” on quotes",
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
 * trusts the rest of it less. So the section stays and the prices wait: the
 * card below says free, and says we will tell you before that changes.
 */
export function Pricing() {
  return BILLING_ENABLED ? <PricedPlans /> : <BetaAccess />;
}

/*
 * What the free plan covers today, and what has to be asked for.
 *
 * No quote count. The heading, the card title and the button all say free
 * already, so a "N quotes a month" line only draws the eye to a ceiling
 * nobody has hit yet. Note what is NOT claimed here either: there is still a
 * monthly cap in lib/quota.ts, so this must never say "unlimited".
 */
const BETA_INCLUDED = [
  "Your pricebook, your logo, your terms",
  "A customer page they can accept on their phone",
  "Sent, opened and accepted — all tracked",
  "Photos, and good / better / best options",
];

/*
 * There used to be a second card here listing the invite-only features. It
 * came off because it sold the visitor a locked door: five things they cannot
 * have, read before they have seen the product do anything. Those features are
 * offered in the app at the moment someone reaches for them, which is when the
 * offer means something.
 *
 * The heading no longer mentions them either — a body promising "a few
 * features are invite-only" while nothing on the page says which ones is worse
 * than not raising it. The price promise stays: it is the reassurance a
 * cautious owner is actually looking for in a pricing section.
 */
function BetaAccess() {
  return (
    <section
      id="pricing"
      className="mx-auto max-w-5xl scroll-mt-24 px-5 py-16 sm:px-8 sm:py-24"
    >
      <SectionHeading
        eyebrow="Beta"
        title="Free while we're in beta."
        body="No card, no trial countdown. Quote your jobs, send them, win them — while we work out what this should cost."
        align="center"
      />

      {/* One card now, so it is held to a readable measure and centred rather
          than stretched across the full five-column width. */}
      <div className="mx-auto mt-10 max-w-md">
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
