import Link from "next/link";
import { Check } from "lucide-react";

import { Panel } from "@/components/panel";
import { Button } from "@/components/ui/button";
import { FREE_QUOTES_PER_MONTH, PLAN_LABELS, type Plan } from "@/lib/constants";
import type { PlanStatus } from "@/lib/plan";

/*
 * Prices mirror SPEC §16 and the landing page. When Paddle lands (Phase 6)
 * these rows get a price id each and the buttons open checkout.
 */
const PAID_PLANS: {
  plan: Exclude<Plan, "free">;
  price: string;
  line: string;
  features: string[];
}[] = [
  {
    plan: "pro",
    price: "$29",
    line: "For the electrician quoting every week.",
    features: [
      "Unlimited quotes",
      "Your logo, your branding",
      "Your own pricebook",
      "Open and accept tracking",
      "Send by email",
    ],
  },
  {
    plan: "business",
    price: "$49",
    line: "For the ones chasing bigger work.",
    features: [
      "Everything in Pro",
      "AI drafting from a description",
      "Good / better / best options",
      "Automatic follow-up",
      "Acceptance analytics",
    ],
  },
];

/**
 * The billing screen itself. Split from the page so the data fetch and the
 * layout stay separable — same shape as the onboarding form next door.
 */
export function BillingView({ status }: { status: PlanStatus }) {
  return (
    <div className="space-y-6">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold">Plan &amp; billing</h1>
        <p className="mt-2 text-body">
          What you&apos;re on, what you&apos;ve used this month, and what
          changes if you move up.
        </p>
      </header>

      {/* Current plan and usage: the count, before the wall. */}
      <Panel>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-[0.08em] text-ink-60 uppercase">
              Current plan
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {PLAN_LABELS[status.plan]}
            </p>
          </div>

          {status.limit === null ? (
            <p className="text-sm text-ink-60">Unlimited quotes.</p>
          ) : (
            <div className="min-w-48">
              <p className="flex items-baseline justify-between gap-4 text-sm">
                <span className="text-ink-60">Quotes this month</span>
                <span className="tabular font-medium">
                  {status.used} / {status.limit}
                </span>
              </p>
              <div
                className="mt-2 h-1.5 overflow-hidden rounded-pill bg-surface-2"
                role="img"
                aria-label={`${status.used} of ${status.limit} quotes used this month`}
              >
                <div
                  className={`h-full rounded-pill ${
                    status.nearLimit ? "bg-status-declined" : "bg-brand"
                  }`}
                  style={{ width: `${(status.fraction ?? 0) * 100}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-ink-60">
                {status.atLimit
                  ? "You've used this month's quotes. Sent quotes stay live and your customers can still accept them."
                  : `${FREE_QUOTES_PER_MONTH} a month, free forever. Resets at the start of next month.`}
              </p>
            </div>
          )}
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        {PAID_PLANS.map((tier) => {
          const isCurrent = status.plan === tier.plan;

          return (
            <Panel key={tier.plan} className={isCurrent ? "border-brand" : ""}>
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-semibold">{PLAN_LABELS[tier.plan]}</h2>
                {isCurrent ? (
                  <span className="rounded-pill bg-brand-wash px-2 py-0.5 text-xs font-medium text-brand">
                    Your plan
                  </span>
                ) : null}
              </div>

              <p className="mt-3 flex items-baseline gap-1.5">
                <span className="tabular text-3xl font-semibold">
                  {tier.price}
                </span>
                <span className="text-sm text-ink-60">per month</span>
              </p>
              <p className="mt-2 text-sm text-ink-60">{tier.line}</p>

              <ul className="mt-5 space-y-2.5 text-sm">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check
                      className="mt-0.5 size-4 shrink-0 text-brand"
                      aria-hidden
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <p className="mt-6 text-sm text-ink-60">
                  You&apos;re on this plan.
                </p>
              ) : (
                <Button
                  asChild
                  size="lg"
                  variant="soft"
                  className="mt-6 w-full"
                >
                  <Link href="/contact">
                    Upgrade to {PLAN_LABELS[tier.plan]}
                  </Link>
                </Button>
              )}
            </Panel>
          );
        })}
      </div>

      {/*
        Honest about where this stands. Self-serve checkout is Phase 6 (SPEC
        §14) — Paddle is not wired up, so an "Upgrade" button that opened a
        broken flow would be worse than one that reaches a person. Replace this
        block, and the /contact links above, when checkout lands.
      */}
      <Panel className="bg-surface-2">
        <h2 className="font-semibold">Changing plan</h2>
        <p className="mt-2 max-w-xl text-sm text-ink-60">
          Self-serve checkout isn&apos;t switched on yet. Email us and
          we&apos;ll move your account over the same day — no card form, no
          waiting on a sales call. Cancelling works the same way, and your
          quotes and pricebook stay yours either way.
        </p>
        <Button asChild variant="soft" className="mt-4">
          <Link href="/contact">Email us to change plan</Link>
        </Button>
      </Panel>
    </div>
  );
}
