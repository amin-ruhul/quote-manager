import Link from "next/link";

import { SectionHeading } from "@/components/landing/section-heading";
import { Button } from "@/components/ui/button";

/*
 * REAL testimonials only. Nothing here is invented, and nothing invented should
 * ever be added — a made-up name on this page is dishonest and it is the single
 * easiest thing for a visitor to catch.
 *
 * To publish one, add an entry. What makes a testimonial work is specificity:
 * a first name, a town, and a number.
 *
 *   { quote: "Won a $3k panel job because I quoted on the spot.",
 *     name: "Dave", location: "Leeds", trade: "Electrician" }
 *
 * While this list is empty the section says so, plainly, instead of pretending.
 */
const TESTIMONIALS: {
  quote: string;
  name: string;
  location: string;
  trade: string;
}[] = [];

export function Proof() {
  return (
    <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-24">
      <SectionHeading
        eyebrow="Proof"
        title={
          TESTIMONIALS.length > 0
            ? "Electricians who quote on the spot."
            : "New, and honest about it."
        }
      />

      {TESTIMONIALS.length > 0 ? (
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((item) => (
            <li
              key={item.name + item.quote}
              className="rounded-lg border border-hairline bg-surface p-6"
            >
              <p className="text-pretty">“{item.quote}”</p>
              <p className="mt-4 text-sm text-ink-60">
                <span className="font-medium text-ink-90">{item.name}</span> ·{" "}
                {item.trade}, {item.location}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-10 rounded-lg bg-midnight p-6 text-white sm:p-8">
          <p className="max-w-xl text-lg text-pretty">
            QuotePilot is new, so there are no reviews to show you yet.
            We&apos;d rather say that than invent one. Use it free on your next
            job — if it wins you work, tell us and we&apos;ll put your name
            here.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-6 w-full bg-white text-black hover:bg-white/90 sm:w-auto"
          >
            <Link href="/login">Start free — no card</Link>
          </Button>
        </div>
      )}
    </section>
  );
}

/**
 * The human behind the tool. Source Serif appears exactly here and nowhere else
 * on the page — one editorial voice among the product claims (DESIGN.md).
 *
 * TODO: rewrite in your own words before launch. Two or three lines, plain,
 * about why you built it. Sign it with your real name.
 */
export function FounderNote() {
  return (
    <section className="mx-auto max-w-3xl px-5 pb-16 sm:px-8 sm:pb-24">
      <div className="border-l-2 border-hairline pl-6">
        <p className="font-serif text-xl leading-relaxed text-pretty text-body">
          I kept hearing the same thing from electricians: the work is fine, the
          paperwork is what kills the evening. So I built the smallest tool that
          gets a professional quote out of your hands and into the
          customer&apos;s before they call someone else.
        </p>
        <p className="mt-4 text-sm text-ink-60">— Your name, founder</p>
      </div>
    </section>
  );
}
