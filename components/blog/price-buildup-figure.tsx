/*
 * The cost build-up for a worked example quote, as a stacked bar.
 *
 * Drawn in markup rather than shipped as a picture: it stays sharp on every
 * screen, reflows on a phone instead of shrinking to nothing, weighs nothing on
 * a job-site connection, and the figures can be corrected in a diff. Colors
 * come from the accent cast in DESIGN.md, which a chart is one of the few
 * places allowed to use them.
 */

type Line = {
  label: string;
  /** Integer cents, like every other amount in the app. */
  cents: number;
  /** Tailwind background class from the accent cast. */
  swatch: string;
  note: string;
};

const LINES: Line[] = [
  {
    label: "Materials",
    cents: 88_000,
    swatch: "bg-sky",
    note: "Panel, breakers, conductors, ground rods — at your cost, not list.",
  },
  {
    label: "Labor",
    cents: 115_000,
    swatch: "bg-brand",
    note: "Hours × your loaded rate: wage, taxes, insurance, van, phone.",
  },
  {
    label: "Permit & inspection",
    cents: 18_000,
    swatch: "bg-marigold",
    note: "The fee, plus the half-day you spend waiting for the inspector.",
  },
  {
    label: "Overhead recovery",
    cents: 55_000,
    swatch: "bg-mocha",
    note: "This job's share of rent, software, the truck, the hours you quote.",
  },
  {
    label: "Margin",
    cents: 44_000,
    swatch: "bg-midnight",
    note: "Profit. Added last, and the first thing lost when you price by feel.",
  },
];

const TOTAL_CENTS = LINES.reduce((sum, line) => sum + line.cents, 0);

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
});

function share(cents: number) {
  return (cents / TOTAL_CENTS) * 100;
}

export function PriceBuildupFigure() {
  return (
    <figure className="rounded-card my-10 border border-black/8 bg-surface p-6">
      <figcaption className="text-sm text-ink-60">
        A worked example, not a recommendation — every figure here should be
        yours.
      </figcaption>

      <p className="mt-3 text-3xl font-semibold text-ink-90 tabular-nums">
        {money.format(TOTAL_CENTS / 100)}
      </p>

      {/*
        The bar is decorative: the same numbers are in the list below it, which
        is what a screen reader reads instead.
      */}
      <div
        aria-hidden
        className="mt-4 flex h-4 w-full gap-0.5 overflow-hidden rounded-pill"
      >
        {LINES.map((line) => (
          <div
            key={line.label}
            className={line.swatch}
            style={{ width: `${share(line.cents)}%` }}
          />
        ))}
      </div>

      <dl className="mt-5 space-y-3">
        {LINES.map((line) => (
          <div key={line.label} className="flex gap-3">
            <span
              aria-hidden
              className={`mt-1.5 size-2.5 shrink-0 rounded-sm ${line.swatch}`}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <dt className="font-medium text-ink-90">{line.label}</dt>
                <dd className="shrink-0 text-ink-90 tabular-nums">
                  {money.format(line.cents / 100)}
                  <span className="ml-2 text-ink-60">
                    {share(line.cents).toFixed(0)}%
                  </span>
                </dd>
              </div>
              <p className="mt-0.5 text-sm text-pretty text-body">
                {line.note}
              </p>
            </div>
          </div>
        ))}
      </dl>
    </figure>
  );
}
