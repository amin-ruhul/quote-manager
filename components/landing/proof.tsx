import { Reveal, RevealGroup, RevealItem } from "@/components/landing/reveal";
import { SectionHeading } from "@/components/landing/section-heading";
import { formatCents } from "@/lib/money";

/* ========================================================================
 * ⚠️  PLACEHOLDER DATA — NOT REAL TESTIMONIALS. REPLACE BEFORE LAUNCH.  ⚠️
 * ========================================================================
 *
 * Every name, town, quote and figure below is invented, so the section can be
 * designed and reviewed. None of it is true, and shipping it as-is would be
 * the easiest thing on this site for a visitor to catch us out on.
 *
 * To make this section real:
 *   1. Replace every entry with a testimonial you actually collected.
 *   2. Set `USING_PLACEHOLDER_TESTIMONIALS` to false.
 *
 * While the flag is true, the section carries a visible "example content"
 * label and is hidden from search engines' snippets — so a half-finished
 * deploy embarrasses us in front of nobody but ourselves.
 *
 * What makes a real testimonial work is specificity: a first name, a town, and
 * a number. Keep that shape when you swap the content in.
 */
const USING_PLACEHOLDER_TESTIMONIALS = true;

type Testimonial = {
  quote: string;
  name: string;
  location: string;
  trade: string;
  /** The job this won, in integer cents (never floats — CLAUDE.md rule 7). */
  jobWonCents?: number;
  /** Accent card treatment. One per row at most, or the grid gets loud. */
  tone?: "marigold" | "sky" | "coral";
};

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Quoted a panel upgrade from the driveway before I'd packed the van. She accepted it while I was still parked outside.",
    name: "Dave",
    location: "Leeds",
    trade: "Electrician",
    jobWonCents: 320000,
    tone: "marigold",
  },
  {
    quote:
      "I used to lose Sunday nights to quotes. Now the pricebook does the maths and I just check the lines.",
    name: "Marcus",
    location: "Bristol",
    trade: "Electrician",
  },
  {
    quote:
      "The follow-up email won me a job I'd written off three weeks earlier. I'd never have chased it myself.",
    name: "Priya",
    location: "Manchester",
    trade: "Electrician",
    jobWonCents: 148500,
    tone: "sky",
  },
  {
    quote:
      "Good, better, best changed everything. Nobody picks the cheap one any more — they pick the middle.",
    name: "Tom",
    location: "Sheffield",
    trade: "Electrician",
  },
  {
    quote:
      "Knowing the second they opened it is the bit I didn't expect to care about. Now I know when to ring.",
    name: "Aisha",
    location: "Birmingham",
    trade: "Electrician",
  },
  {
    quote:
      "It flagged the permit line instead of guessing at it. That's the only reason I trust it with my prices.",
    name: "Rob",
    location: "Newcastle",
    trade: "Electrician",
    jobWonCents: 275000,
    tone: "coral",
  },
];

const TONES: Record<string, { card: string; chip: string; muted: string }> = {
  marigold: {
    card: "bg-marigold",
    chip: "bg-black/10 text-ink-90",
    muted: "text-ink-90/70",
  },
  sky: {
    card: "bg-sky",
    chip: "bg-black/10 text-ink-90",
    muted: "text-ink-90/70",
  },
  coral: {
    card: "bg-coral",
    chip: "bg-black/10 text-ink-90",
    muted: "text-ink-90/70",
  },
};

/**
 * The proof that sits inside the promise band.
 *
 * Two states, one slot: the strongest testimonial once there is one, and the
 * admission that there isn't until then. Keeping both here means the page never
 * has an empty hole where social proof should be — it tells the truth in the
 * same place either way.
 */
export function ProofPanel() {
  const featured = TESTIMONIALS[0];

  return (
    <div className="rounded-lg border border-white/15 bg-white/5 p-6 sm:p-7">
      <p className="text-xs font-medium tracking-[0.08em] text-white/50 uppercase">
        {featured ? "From an electrician" : "Proof"}
      </p>

      {featured ? (
        <>
          <p className="mt-4 text-lg text-pretty text-white/90">
            “{featured.quote}”
          </p>
          <p className="mt-4 text-sm text-white/60">
            <span className="font-medium text-white/90">{featured.name}</span> ·{" "}
            {featured.trade}, {featured.location}
          </p>

          {/* The wall downpage carries the same warning. This panel quotes a
              named person, so it cannot be the one place the label is missing. */}
          {USING_PLACEHOLDER_TESTIMONIALS ? (
            <p className="mt-4 text-xs text-white/40">
              Example content — not a real customer yet
            </p>
          ) : null}
        </>
      ) : (
        <p className="mt-4 text-pretty text-white/70">
          QuotePilot is new, so there are no reviews to show you yet. We&apos;d
          rather say that than invent one. Use it free on your next job — if it
          wins you work, tell us and we&apos;ll put your name here.
        </p>
      )}
    </div>
  );
}

/**
 * The testimonial wall. Renders nothing until there is something to put in it —
 * the promise band above already covers the empty case, and a page that says
 * "no reviews yet" twice is worse than one that says it once.
 */
export function Proof() {
  // The promise band above features the first entry, so the wall starts at the
  // second — otherwise the same quote appears twice within one scroll.
  const rest = TESTIMONIALS.slice(1);

  if (rest.length === 0) return null;

  return (
    <section className="border-y border-hairline bg-surface-2">
      <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-24">
        <Reveal>
          <SectionHeading
            eyebrow="Proof"
            title="Electricians who quote on the spot."
            body="What changes when the quote goes out the same day, in their words."
            align="center"
          />

          {USING_PLACEHOLDER_TESTIMONIALS ? (
            // The wrapper does the centering: `mx-auto` has no effect on an
            // inline-flex pill, so the label needs a block-level parent.
            <div className="mt-6 text-center">
              <p
                role="note"
                className="inline-flex rounded-pill bg-status-viewed-bg px-3 py-1 text-xs font-medium text-status-viewed"
              >
                Example content — these are not real customers yet
              </p>
            </div>
          ) : null}
        </Reveal>

        <RevealGroup className="mt-10">
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((item) => (
              <TestimonialCard key={item.name + item.quote} {...item} />
            ))}
          </ul>
        </RevealGroup>
      </div>
    </section>
  );
}

function TestimonialCard({
  quote,
  name,
  location,
  trade,
  jobWonCents,
  tone,
}: Testimonial) {
  const accent = tone ? TONES[tone] : undefined;

  return (
    <RevealItem
      as="li"
      className={[
        "flex flex-col rounded-lg p-5 transition-colors duration-200 sm:p-6",
        accent
          ? accent.card
          : "border border-hairline bg-surface hover:border-hairline-strong",
      ].join(" ")}
    >
      <p className={`text-pretty ${accent ? "text-ink-90" : ""}`}>“{quote}”</p>

      {jobWonCents !== undefined ? (
        <p
          className={`mt-4 inline-flex w-fit rounded-pill px-2 py-0.5 text-xs font-medium ${
            accent ? accent.chip : "bg-status-accepted-bg text-status-accepted"
          }`}
        >
          <span className="tabular">{formatCents(jobWonCents)}</span>
          <span className="ml-1">job won</span>
        </p>
      ) : null}

      {/* Attribution pinned to the bottom so the names line up across a row
          even when the quotes above them run to different lengths. */}
      <div className="mt-auto flex items-center gap-3 pt-5">
        <span
          className={`flex size-9 shrink-0 items-center justify-center rounded-pill text-xs font-semibold ${
            accent ? "bg-black/10 text-ink-90" : "bg-surface-2 text-ink-60"
          }`}
          aria-hidden
        >
          {name.slice(0, 1)}
        </span>
        <p className={`text-sm ${accent ? accent.muted : "text-ink-60"}`}>
          <span
            className={`block font-medium ${accent ? "text-ink-90" : "text-ink-90"}`}
          >
            {name}
          </span>
          {trade}, {location}
        </p>
      </div>
    </RevealItem>
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
    <section className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
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
