/*
 * The quoting sequence this post is arguing for, as a single list.
 *
 * Drawn in markup rather than shipped as a picture for the same reasons as
 * the price build-up figure: it stays sharp, reflows on a phone, and the
 * steps can be corrected in a diff. Numbers are circuit-label style, matching
 * how-it-works on the landing page — an electrician already reads a numbered
 * list that way.
 */

const STEPS = [
  {
    label: "Request",
    note: "What they asked for, in their words.",
  },
  {
    label: "Job details",
    note: "A site visit, photos, or a description you trust.",
  },
  {
    label: "Scope",
    note: "What is included, written so a customer can read it.",
  },
  {
    label: "Labor",
    note: "The whole day, not just the minutes of install.",
  },
  {
    label: "Materials",
    note: "At your cost, then the markup you always use.",
  },
  {
    label: "Overhead & profit",
    note: "The business has to exist after this job.",
  },
  {
    label: "Exclusions",
    note: "What would change the number, said up front.",
  },
  {
    label: "Review and send",
    note: "One pass, then out the door the same day.",
  },
];

export function QuoteWorkflowFigure() {
  return (
    <figure className="rounded-card my-10 border border-black/8 bg-surface p-6">
      <figcaption className="text-sm text-ink-60">
        The same sequence, every job — so quoting is a habit, not a blank page.
      </figcaption>

      <ol className="mt-5 list-none space-y-0">
        {STEPS.map((step, index) => (
          <li key={step.label} className="flex gap-4">
            <div className="flex w-8 shrink-0 flex-col items-center">
              <span className="flex size-8 items-center justify-center rounded-sm border border-black/8 bg-surface-2 text-xs font-medium text-ink-90 tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              {index < STEPS.length - 1 ? (
                <span aria-hidden className="w-px flex-1 bg-black/8" />
              ) : null}
            </div>
            <div className={index < STEPS.length - 1 ? "pb-5" : undefined}>
              <p className="pt-1.5 font-medium text-ink-90">{step.label}</p>
              <p className="mt-0.5 text-sm text-pretty text-body">
                {step.note}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </figure>
  );
}
