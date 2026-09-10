import Link from "next/link";

import { Panel } from "@/components/panel";
import { Wordmark } from "@/components/wordmark";

/**
 * The frame both auth screens sit in.
 *
 * A lone 448px card centred in a 1440px window reads as an unfinished page —
 * so from `lg` the pitch and the form split into two columns and the pair fills
 * the width it was given. Below that it stacks in the same order, which is the
 * layout the phone wanted all along.
 *
 * `aside` is what actually separates the two screens: register carries the
 * marigold card, sign-in carries nothing. That asymmetry is deliberate.
 */
export function AuthShell({
  title,
  tagline,
  aside,
  footer,
  children,
}: {
  title: string;
  tagline: string;
  aside?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col justify-center px-6 py-12">
      <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-16">
        <section>
          <Link
            href="/"
            className="inline-flex rounded-md outline-none focus-visible:ring-3 focus-visible:ring-brand/50"
          >
            <Wordmark />
          </Link>

          <h1 className="mt-6 text-3xl font-semibold lg:text-4xl">{title}</h1>
          <p className="mt-3 max-w-sm text-body">{tagline}</p>

          {aside ? <div className="mt-8">{aside}</div> : null}
        </section>

        <section>
          <Panel className="sm:p-8">{children}</Panel>
          {footer}
        </section>
      </div>
    </main>
  );
}
