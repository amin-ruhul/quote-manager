import type { Metadata } from "next";

import { ComingSoon, PageShell } from "@/components/landing/page-shell";

export const metadata: Metadata = {
  title: "Blog — QuotePace",
  description:
    "Writing about quoting, pricing, and winning residential electrical work. Not published yet.",
};

/*
 * A real route so the footer link resolves, and honest about being empty.
 * When there are posts, replace this with a list — the shell and metadata
 * already fit.
 */
export default function BlogPage() {
  return (
    <PageShell
      eyebrow="Blog"
      title="Nothing published yet."
      standfirst="We would rather ship the product than pad a blog with posts nobody asked for."
    >
      <ComingSoon what="When there is something worth reading here it will be about quoting and pricing residential electrical work — what wins jobs, what loses them, and what the numbers across QuotePace actually show. Not listicles." />
    </PageShell>
  );
}
