import { Reveal, RevealGroup, RevealItem } from "@/components/landing/reveal";
import { SectionHeading } from "@/components/landing/section-heading";
import { formatCents } from "@/lib/money";

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

/*
 * REAL TESTIMONIALS ONLY. Nothing here until someone has actually said it.
 *
 * This list held six invented electricians — names, towns and the value of
 * jobs they had supposedly won — behind an "example content" label. A label
 * does not undo a fabricated quote: the visitor who skims sees six happy
 * customers, and the one who reads the label learns we are willing to make
 * people up. Both are worse than saying we are new.
 *
 * Empty, the page tells the truth on its own: the promise band prints "no
 * reviews yet, we'd rather say that than invent one" and the wall below
 * renders nothing at all.
 *
 * What makes a real one work is specificity — a first name, a town, and a
 * number:
 *
 *   {
 *     quote: "Quoted it from the driveway. She accepted before I'd packed up.",
 *     name: "Dave",
 *     location: "Leeds",
 *     trade: "Electrician",
 *     jobWonCents: 320000,
 *     tone: "marigold",
 *   }
 */
const TESTIMONIALS: Testimonial[] = [];

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
        </>
      ) : (
        <p className="mt-4 text-pretty text-white/70">
          QuotePace is new, so there are no reviews to show you yet. We&apos;d
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
 * Unsigned on purpose. It read "— Your name, founder", which is placeholder
 * text shipped as if it were copy: a note whose whole job is to sound like a
 * person, signed by nobody. Better unsigned than signed by a template. Add a
 * real name here whenever you want the note attributed.
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
      </div>
    </section>
  );
}
