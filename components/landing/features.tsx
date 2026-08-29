import { SectionHeading } from "@/components/landing/section-heading";

/*
 * Outcomes, not features: each card names the thing that stops happening.
 * Colour lives in the card backgrounds here (DESIGN.md), which is also what
 * makes the grid read as a wall of notes rather than a spec sheet.
 */
const OUTCOMES = [
  {
    tone: "bg-marigold",
    title: "Never chase a customer again",
    body: "If a quote goes quiet, QuotePilot sends one friendly nudge for you. It stops the moment they accept.",
  },
  {
    tone: "bg-sky",
    title: "Know the second they open it",
    body: "You get an email when the quote is opened and when it's accepted. No more wondering whether it landed.",
  },
  {
    tone: "bg-surface",
    title: "Your prices, not ours",
    body: "Your pricebook is the only source of prices. If we can't match a line, we leave it blank for you to fill in — we never guess a number.",
  },
  {
    tone: "bg-surface",
    title: "Offer three options, win the middle",
    body: "Good, better, best on one page. Customers pick a level instead of deciding yes or no.",
  },
  {
    tone: "bg-surface",
    title: "Photos that justify the price",
    body: "Attach shots of the old panel or the crawlspace. A price with a picture next to it stops feeling expensive.",
  },
  {
    tone: "bg-coral",
    title: "See what's actually working",
    body: "Sent, accepted, acceptance rate, money won this month. One screen, no spreadsheet.",
  },
];

export function Features() {
  return (
    <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-24">
      <SectionHeading
        eyebrow="What you get"
        title="The admin, done before you get home."
      />

      <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {OUTCOMES.map((outcome) => {
          const isAccent = outcome.tone !== "bg-surface";

          return (
            <li
              key={outcome.title}
              className={`rounded-lg p-5 ${outcome.tone} ${
                isAccent ? "" : "border border-hairline"
              }`}
            >
              <h3 className="font-semibold">{outcome.title}</h3>
              <p
                className={`mt-2 text-sm ${isAccent ? "text-ink-90" : "text-ink-60"}`}
              >
                {outcome.body}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
