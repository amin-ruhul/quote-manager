import { RevealGroup, RevealItem } from "@/components/landing/reveal";
import { SectionHeading } from "@/components/landing/section-heading";
import {
  AcceptMockup,
  BuildMockup,
  ReviewMockup,
} from "@/components/landing/step-mockups";
import { INVITE_ONLY_NOTE } from "@/lib/constants";

/*
 * The only numbered section on the page. These three are a real sequence — you
 * cannot get the yes before you send — so the numbers carry information.
 * They're set as breaker-panel circuit labels, which is how an electrician
 * already reads a numbered list.
 *
 * Each step carries a small mockup of the actual screen, so the claim and the
 * evidence for it sit in the same card.
 */
const STEPS = [
  {
    label: "Build",
    title: "Pull the lines from your pricebook.",
    body: "Panel swap, six recessed lights, a permit. Tap them in at the prices you already set — or describe the job in a sentence and let AI draft it for you.",
    Mockup: BuildMockup,
  },
  {
    label: "Send",
    title: "Check it, then send.",
    body: "You see every line before anything goes out. Change a price, add a permit, delete a line. Then send the link however you like — text, WhatsApp, or in person.",
    Mockup: ReviewMockup,
  },
  {
    label: "Get the yes",
    title: "They accept on their phone.",
    body: "No app, no login, no PDF to pinch and zoom. They tap Accept and sign with their name. You get an email the moment it happens.",
    Mockup: AcceptMockup,
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="mx-auto max-w-5xl scroll-mt-24 px-5 py-16 sm:px-8 sm:py-24"
    >
      <SectionHeading
        eyebrow="How it works"
        title="Three steps. About five minutes."
        body="From the driveway to a signed quote — without opening Word once."
        align="center"
      />

      {/* Said once, plainly, beside the step that mentions AI — rather than as
          an asterisk on a claim three sections further down. */}
      <p className="mx-auto mt-4 max-w-xl text-center text-sm text-ink-60">
        AI drafting is{" "}
        <span className="font-medium text-ink-90">
          {INVITE_ONLY_NOTE.toLowerCase()}
        </span>{" "}
        while we test it. Everything else here is free from the moment you sign
        up.
      </p>

      <RevealGroup className="mt-12">
        <ol className="grid gap-4 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <RevealItem
              key={step.label}
              as="li"
              className="flex flex-col rounded-lg border border-hairline bg-surface p-5 transition-colors duration-200 hover:border-hairline-strong sm:p-6"
            >
              <p className="tabular flex items-center gap-2 text-xs font-medium tracking-[0.08em] text-ink-60 uppercase">
                <span className="rounded-sm border border-hairline bg-surface-2 px-1.5 py-0.5">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {step.label}
              </p>
              <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-ink-60">{step.body}</p>

              {/* Pushed to the bottom so the three mockups line up across the
                  row even when the copy above them wraps differently. */}
              <div className="mt-auto">
                <step.Mockup />
              </div>
            </RevealItem>
          ))}
        </ol>
      </RevealGroup>
    </section>
  );
}
