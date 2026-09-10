import Link from "next/link";

import { ProofPanel } from "@/components/landing/proof";
import { Reveal } from "@/components/landing/reveal";
import { Button } from "@/components/ui/button";

/**
 * The page's one dark island between the hero and the footer.
 *
 * This was two stacked midnight cards — the promise, then the honesty note —
 * which put two near-identical dark rectangles and two identical CTAs on the
 * same screen. They are one thing: a large claim, and the admission that we
 * cannot prove it yet. Side by side they argue with each other in a way that
 * reads as candour; stacked they just read as repetition.
 *
 * Full-bleed rather than a rounded card, so it separates the product half of
 * the page from the pricing half instead of floating in it.
 *
 * Named `PromiseBand` rather than `Promise` so it does not shadow the global.
 */
export function PromiseBand() {
  return (
    <section className="bg-midnight text-white">
      <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-24">
        <Reveal>
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
            <div>
              <p className="inline-flex rounded-pill bg-white/10 px-2.5 py-1 text-xs font-medium tracking-[0.08em] text-white/70 uppercase">
                The promise
              </p>

              <h2 className="mt-4 text-3xl font-semibold text-balance sm:text-4xl">
                Win the jobs you were losing to a slow quote.
              </h2>

              <p className="mt-4 max-w-lg text-lg text-pretty text-white/70">
                Same work, same prices. The only thing that changes is how long
                your customer waits to say yes.
              </p>

              {/* White, not blue: on midnight the blue loses its contrast and
                  stops reading as the primary action. */}
              <Button
                asChild
                size="lg"
                className="mt-8 w-full bg-white text-black hover:bg-white/90 sm:w-auto"
              >
                <Link href="/register">Start free — no card</Link>
              </Button>
            </div>

            <ProofPanel />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
