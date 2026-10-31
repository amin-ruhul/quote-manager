import { SectionHeading } from "@/components/landing/section-heading";
import { BILLING_ENABLED } from "@/lib/constants";

/*
 * Native <details> — no JavaScript, keyboard-accessible for free, and it costs
 * the page nothing on a phone. The questions are the objections that stop
 * someone signing up, answered plainly.
 */
type Question = { q: string; a: string };

export const QUESTIONS: Question[] = [
  {
    q: "Is it really free?",
    a: BILLING_ENABLED
      ? "Yes, to start. The free plan needs no card. Paid plans lift the monthly limit when quoting is making you money."
      : "Yes. Core quoting is free. No card, no trial countdown. You get your pricebook, your branding, the customer quote page and the tracking.",
  },
  {
    q: "Does my customer need an app or an account?",
    a: "No. They get a link. It opens in whatever browser is already on their phone, and they tap Accept. Nothing to install, nothing to sign up for.",
  },
  {
    q: "Do I need to download anything?",
    a: "No. It's a web app. Add it to your home screen if you like.",
  },
  {
    q: "How do you make money?",
    a: "AI drafting is a paid extra. Quoting stays free.",
  },
  {
    q: "What if the AI gets a price wrong?",
    a: "It can't set one. Prices come only from the pricebook you build. If a line doesn't match anything you sell, it comes back blank and marked “price not set” for you to fill in. You review every quote before it goes anywhere.",
  },
  {
    q: "Do I have to use the AI?",
    a: "No. AI drafting is optional, and it's a paid extra. Plenty of jobs are faster to build by hand from your pricebook.",
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
    a: "You need a connection to send. Build the quote in the driveway, send it when you've got a bar. On most jobs that's the same minute.",
  },
];

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
