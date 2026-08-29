import { SectionHeading } from "@/components/landing/section-heading";

/*
 * The only numbered section on the page. These three are a real sequence — you
 * cannot get the yes before you send — so the numbers carry information.
 * They're set as breaker-panel circuit labels, which is how an electrician
 * already reads a numbered list.
 */
const STEPS = [
  {
    label: "Describe",
    title: "Say what the job is.",
    body: "“Swap the 100A panel for a 200A, six recessed lights in the kitchen.” Type it or talk it. QuotePilot matches it to the prices already in your pricebook.",
  },
  {
    label: "Send",
    title: "Check it, then send.",
    body: "You see every line before anything goes out. Change a price, add a permit, delete a line. Then send the link by email — or text it yourself.",
  },
  {
    label: "Get the yes",
    title: "They accept on their phone.",
    body: "No app, no login, no PDF to pinch and zoom. They tap Accept and sign with their name. You get an email the moment it happens.",
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-24">
      <SectionHeading
        eyebrow="How it works"
        title="Three steps. About five minutes."
      />

      <ol className="mt-10 grid gap-4 sm:grid-cols-3">
        {STEPS.map((step, index) => (
          <li
            key={step.label}
            className="rounded-lg border border-hairline bg-surface p-5 sm:p-6"
          >
            <p className="tabular flex items-center gap-2 text-xs font-medium tracking-[0.08em] text-ink-40 uppercase">
              <span className="rounded-sm border border-hairline bg-surface-2 px-1.5 py-0.5">
                {String(index + 1).padStart(2, "0")}
              </span>
              {step.label}
            </p>
            <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
            <p className="mt-2 text-sm text-ink-60">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
