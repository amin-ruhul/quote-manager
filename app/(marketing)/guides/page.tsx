import type { Metadata } from "next";
import Link from "next/link";

import { ComingSoon, PageShell } from "@/components/landing/page-shell";

export const metadata: Metadata = {
  title: "Guides — QuotePace",
  description:
    "Practical guides for electricians using QuotePace: building a pricebook, quoting panel upgrades, and following up without nagging.",
};

/*
 * A real route so the footer link resolves. The planned list is shown rather
 * than hidden — it tells a visitor what kind of help is coming, which is the
 * only useful thing an empty page can do.
 */
const PLANNED = [
  "Building a pricebook you can quote from in two minutes",
  "Pricing a 100A to 200A panel upgrade without guessing",
  "Good / better / best: how to structure options that get picked",
  "Following up on a quiet quote without nagging the customer",
];

export default function GuidesPage() {
  return (
    <PageShell
      eyebrow="Guides"
      title="Not written yet."
      standfirst="These are the guides we plan to write first. If one of them would help you now, tell us and it moves up the list."
    >
      <ul className="mb-8 space-y-2">
        {PLANNED.map((item) => (
          <li
            key={item}
            className="rounded-lg border border-hairline bg-surface p-4 text-sm text-ink-60"
          >
            {item}
          </li>
        ))}
      </ul>

      <ComingSoon what="In the meantime, the FAQ on the home page covers the questions that come up most, and the product itself seeds your pricebook with common electrical jobs so you are not starting from a blank screen.">
        <p className="mt-4 text-sm text-white/70">
          Want one of these sooner?{" "}
          <Link href="/contact" className="font-medium text-white underline">
            Tell us which
          </Link>
          .
        </p>
      </ComingSoon>
    </PageShell>
  );
}
