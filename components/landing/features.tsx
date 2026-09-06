import { BarChart3, BellRing, Camera, Layers, Tags, Timer } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { RevealGroup, RevealItem } from "@/components/landing/reveal";
import { SectionHeading } from "@/components/landing/section-heading";

/*
 * Outcomes, not features: each card names the thing that stops happening.
 * Colour lives in the card backgrounds here (DESIGN.md), which is also what
 * makes the grid read as a wall of notes rather than a spec sheet.
 *
 * The chips under each card are the concrete nouns behind the promise — the
 * card sells the outcome, the chips answer "yes, but what is it actually".
 */
type Outcome = {
  icon: LucideIcon;
  tone: string;
  /** Icon tile colours, tuned per card so they read on their own background. */
  iconTone: string;
  title: string;
  body: string;
  chips: string[];
  /** The two accent cards span two columns on desktop, breaking the grid up. */
  wide?: boolean;
};

const OUTCOMES: Outcome[] = [
  {
    icon: Timer,
    tone: "bg-marigold",
    iconTone: "bg-black/10 text-ink-90",
    title: "Never chase a customer again",
    body: "If a quote goes quiet, QuotePilot sends one friendly nudge for you. It stops the moment they accept.",
    chips: ["One nudge, not five", "Stops on accept", "Automatic"],
    wide: true,
  },
  {
    icon: BellRing,
    tone: "bg-sky",
    iconTone: "bg-black/10 text-ink-90",
    title: "Know the second they open it",
    body: "You get an email when the quote is opened and when it's accepted. No more wondering whether it landed.",
    chips: ["Opened", "Accepted", "Declined"],
  },
  {
    icon: Tags,
    tone: "bg-surface",
    iconTone: "bg-brand-wash text-brand",
    title: "Your prices, not ours",
    body: "Your pricebook is the only source of prices. If we can't match a line, we leave it blank for you to fill in — we never guess a number.",
    chips: ["Your pricebook", "No invented prices", "You approve every quote"],
  },
  {
    icon: Layers,
    tone: "bg-surface",
    iconTone: "bg-brand-wash text-brand",
    title: "Offer three options, win the middle",
    body: "Good, better, best on one page. Customers pick a level instead of deciding yes or no.",
    chips: ["Good / better / best", "One page"],
  },
  {
    icon: Camera,
    tone: "bg-surface",
    iconTone: "bg-brand-wash text-brand",
    title: "Photos that justify the price",
    body: "Attach shots of the old panel or the crawlspace. A price with a picture next to it stops feeling expensive.",
    chips: ["Job photos", "Shown to the customer"],
  },
  {
    icon: BarChart3,
    tone: "bg-coral",
    iconTone: "bg-black/10 text-ink-90",
    title: "See what's actually working",
    body: "Sent, accepted, acceptance rate, money won this month. One screen, no spreadsheet.",
    chips: ["Acceptance rate", "Won this month", "No spreadsheet"],
    wide: true,
  },
];

export function Features() {
  return (
    <section
      id="features"
      className="scroll-mt-24 border-y border-hairline bg-surface-2"
    >
      <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-24">
        <SectionHeading
          eyebrow="What you get"
          title="The admin, done before you get home."
          body="Everything here exists to shorten the gap between “I'll get you a price” and “yes, go ahead”."
          align="center"
        />

        <RevealGroup className="mt-12">
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {OUTCOMES.map((outcome) => (
              <FeatureCard key={outcome.title} {...outcome} />
            ))}
          </ul>
        </RevealGroup>
      </div>
    </section>
  );
}

function FeatureCard({
  icon: Icon,
  tone,
  iconTone,
  title,
  body,
  chips,
  wide,
}: Outcome) {
  const isAccent = tone !== "bg-surface";

  return (
    <RevealItem
      as="li"
      className={[
        "flex flex-col rounded-lg p-5 transition-colors duration-200",
        tone,
        isAccent ? "" : "border border-hairline hover:border-hairline-strong",
        wide ? "lg:col-span-2" : "",
      ].join(" ")}
    >
      <span
        className={`flex size-9 items-center justify-center rounded-md ${iconTone}`}
      >
        <Icon className="size-4.5" strokeWidth={2} aria-hidden />
      </span>

      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className={`mt-2 text-sm ${isAccent ? "text-ink-90" : "text-ink-60"}`}>
        {body}
      </p>

      {/* `mt-auto` pins the chips to the bottom edge. Cards in a row stretch to
          the tallest, and the wide accent cards have the least copy — without
          this they read as half-empty rectangles. */}
      <ul className="mt-auto flex flex-wrap gap-1.5 pt-4">
        {chips.map((chip) => (
          <li
            key={chip}
            className={`rounded-pill px-2 py-0.5 text-xs font-medium ${
              isAccent ? "bg-black/10 text-ink-90" : "bg-surface-2 text-ink-60"
            }`}
          >
            {chip}
          </li>
        ))}
      </ul>
    </RevealItem>
  );
}
