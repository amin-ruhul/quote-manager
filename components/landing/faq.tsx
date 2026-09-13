import { SectionHeading } from "@/components/landing/section-heading";
import { BILLING_ENABLED, FREE_QUOTES_PER_MONTH } from "@/lib/constants";

/*
 * Native <details> — no JavaScript, keyboard-accessible for free, and it costs
 * the page nothing on a phone. The questions are the objections that stop
 * someone signing up, answered plainly.
 */
/** `betaOnly` questions disappear the day there is a paid plan to describe. */
type Question = { q: string; a: string; betaOnly?: boolean };

const QUESTIONS: Question[] = [
  {
    q: "Is it really free?",
    a: BILLING_ENABLED
      ? `Yes, to start. The free plan covers ${FREE_QUOTES_PER_MONTH} quotes a month with no card. Paid plans lift the limit when quoting is making you money.`
      : `Yes. We are in beta and there is nothing to buy — no card, no trial countdown. You get ${FREE_QUOTES_PER_MONTH} quotes a month, your pricebook, your branding, the customer quote page and the tracking. A few features that cost us money every time they run are switched on by hand for businesses who ask.`,
  },
  {
    q: "Does my customer need an app or an account?",
    a: "No. They get a link. It opens in whatever browser is already on their phone, and they tap Accept. Nothing to install, nothing to sign up for.",
  },
  {
    q: `What happens when I hit ${FREE_QUOTES_PER_MONTH} quotes in a month?`,
    a: BILLING_ENABLED
      ? "Nothing breaks. Your existing quotes stay live and your customers can still accept them. You just can't create a new one until next month or until you upgrade."
      : "Nothing breaks. Your existing quotes stay live and your customers can still accept them. You just can't start a new one until the month rolls over — or until you ask us for more, which is one tap inside the app and usually answered the same day.",
  },
  {
    q: "Which features are invite-only right now?",
    a: "AI drafting, emailing the quote to your customer from QuotePilot, automatic follow-up, and downloading a PDF. Each one costs us money every time it runs, so we open them to a handful of businesses while we work out what this should cost. Asking takes one tap from inside the app — there is no price and no card involved.",
    betaOnly: true,
  },
  {
    q: "Can I still send a quote without the email feature?",
    a: "Yes, and most people do. Copy the quote link and send it however you already talk to that customer — text, WhatsApp, or reading it out. It is tracked exactly the same way: you still get told the moment they open it and when they accept.",
    betaOnly: true,
  },
  {
    q: "What if the AI gets a price wrong?",
    a: "It can't set one. Prices come only from the pricebook you build. If a line doesn't match anything you sell, it comes back blank and marked “price not set” for you to fill in. You review every quote before it goes anywhere.",
  },
  {
    q: "Do I have to use the AI?",
    a: "No — and right now most accounts don't have it. Plenty of jobs are faster to build by hand from your pricebook, which is what the free plan is built around.",
  },
  {
    q: "Can I change the prices you start me with?",
    a: "All of them. We seed your pricebook with common electrical jobs so you're not staring at a blank screen, then you edit every one to your numbers.",
  },
  {
    q: "Is my pricebook private?",
    a: "Yes. Your prices and customers belong to your business and aren't shown to anyone else. Customers only ever see the one quote you send them, and your prices are isolated at the database level, not just in the app.",
  },
  {
    q: "Does it work with no signal at the job?",
    a: "You need a connection to send. Build the quote in the driveway, send it when you've got a bar — most jobs it's the same minute.",
  },
].filter((item) => !(item.betaOnly && BILLING_ENABLED));

export function Faq() {
  return (
    <section
      id="faq"
      className="mx-auto max-w-3xl scroll-mt-24 px-5 py-16 sm:px-8 sm:py-24"
    >
      <SectionHeading
        eyebrow="Questions"
        title="The things people ask first."
        align="center"
      />

      <div className="mt-8 divide-y divide-hairline border-t border-b border-hairline">
        {QUESTIONS.map((item) => (
          <details key={item.q} className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium [&::-webkit-details-marker]:hidden">
              {item.q}
              <svg
                viewBox="0 0 16 16"
                className="size-4 shrink-0 text-ink-60 transition-transform duration-200 group-open:rotate-45"
                aria-hidden
              >
                <path
                  d="M8 3v10M3 8h10"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
            </summary>
            <p className="pb-4 text-sm text-ink-60">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
