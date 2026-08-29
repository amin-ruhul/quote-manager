import { Panel } from "@/components/panel";
import { Button } from "@/components/ui/button";

/*
 * Phase 0 placeholder (SPEC §14). The real marketing page lands with Phase 7;
 * this exists so the scaffold has a route that exercises the design tokens.
 */
export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center px-6 py-20">
      <p className="text-sm font-medium text-ink-60">QuotePilot</p>

      <h1 className="mt-4 text-4xl leading-[1.1] font-semibold text-balance sm:text-5xl">
        <span className="mr-1 inline-block rounded-md bg-marigold px-2 py-0.5">
          Win
        </span>
        the job before you leave the driveway.
      </h1>

      <p className="mt-6 font-serif text-lg text-pretty text-body sm:text-xl">
        Describe the job, send a professional quote in minutes, and let your
        customer approve it from their phone.
      </p>

      <div className="mt-10">
        <Button size="lg" disabled>
          Get started
        </Button>
        <p className="mt-3 text-sm text-ink-40">
          Sign-up arrives with the auth phase.
        </p>
      </div>

      <Panel className="mt-16">
        <h2 className="text-sm font-semibold">Scaffold ready</h2>
        <p className="mt-2 text-sm text-ink-60">
          Next.js App Router, Tailwind, shadcn/ui, and Drizzle are wired up. No
          features yet — the build continues phase by phase per SPEC §14.
        </p>
      </Panel>
    </main>
  );
}
