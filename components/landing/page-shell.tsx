import Link from "next/link";

import { Button } from "@/components/ui/button";

/**
 * The frame every marketing sub-page sits in: title, standfirst, content.
 *
 * These pages exist mainly because the footer links to them, and a footer link
 * that 404s costs more trust than the link earns. Keeping the shell here means
 * they read as one site rather than six separate attempts at a page.
 */
export function PageShell({
  eyebrow,
  title,
  standfirst,
  children,
}: {
  eyebrow: string;
  title: string;
  standfirst?: string;
  children?: React.ReactNode;
}) {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
      <p className="inline-flex rounded-pill bg-brand-wash px-2.5 py-1 text-xs font-medium tracking-[0.08em] text-brand uppercase">
        {eyebrow}
      </p>
      <h1 className="mt-4 text-4xl font-semibold text-balance sm:text-5xl">
        {title}
      </h1>
      {standfirst ? (
        <p className="mt-5 text-lg text-pretty text-body">{standfirst}</p>
      ) : null}

      {children ? <div className="mt-10">{children}</div> : null}
    </main>
  );
}

/**
 * The honest version of an empty page: says there is nothing here yet, says
 * what will be here, and gives the visitor somewhere to go instead. Used by
 * the pages that are real routes but have no content written for them.
 */
export function ComingSoon({
  what,
  children,
}: {
  what: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg bg-midnight p-6 text-white sm:p-8">
      <p className="max-w-xl text-lg text-pretty">{what}</p>
      {children}
      <Button
        asChild
        size="lg"
        className="mt-6 w-full bg-white text-black hover:bg-white/90 sm:w-auto"
      >
        <Link href="/">Back to the home page</Link>
      </Button>
    </div>
  );
}

/** Body copy for the prose-ish pages, so they share one measure and rhythm. */
export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-4 text-pretty text-body [&_h2]:mt-10 [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-ink-90">
      {children}
    </div>
  );
}
