import { SectionHeading } from "@/components/landing/section-heading";

/*
 * Native <details> — no JavaScript, keyboard-accessible for free, and it costs
 * the page nothing on a phone. The questions are the objections that stop
 * someone signing up, answered plainly.
 */
const QUESTIONS = [
  {
    q: "Does my customer need an app or an account?",
    a: "No. They get a link. It opens in whatever browser is already on their phone, and they tap Accept. Nothing to install, nothing to sign up for.",
  },
  {
    q: "What if the AI gets a price wrong?",
    a: "It can't set one. Prices come only from the pricebook you build. If a line doesn't match anything you sell, it comes back blank and marked “price not set” for you to fill in. You review every quote before it goes anywhere.",
  },
  {
    q: "Do I have to use the AI?",
    a: "No. Plenty of jobs are faster to build by hand from your pricebook. The description box is there when you want it.",
  },
  {
    q: "Can I change the prices you start me with?",
    a: "All of them. We seed your pricebook with common electrical jobs so you're not staring at a blank screen, then you edit every one to your numbers.",
  },
  {
    q: "What happens when I hit 5 quotes on the free plan?",
    a: "Nothing breaks. Your existing quotes stay live and your customers can still accept them. You just can't create a new one until next month or until you upgrade.",
  },
  {
    q: "Is my pricebook private?",
    a: "Yes. Your prices and customers belong to your business and aren't shown to anyone else. Customers only ever see the one quote you send them.",
  },
  {
    q: "Does it work with no signal at the job?",
    a: "You need a connection to send. Write the description in the driveway, send it when you've got a bar — most jobs it's the same minute.",
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
