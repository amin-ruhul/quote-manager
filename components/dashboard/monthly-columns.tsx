import { cn } from "@/lib/utils";

/*
 * The dashboard's one chart shape: months across, one or two series of columns.
 *
 * Built from divs rather than SVG on purpose — a column is a rectangle, and
 * flexbox gives responsive widths and crisp 4px corners without viewBox maths
 * or a charting library on a screen that has to open fast (DESIGN.md).
 *
 * Mark specs follow the dataviz guidance: columns capped at 24px so the band
 * keeps its air, a 4px rounded data-end square at the baseline, a 2px surface
 * gap between touching bars, and a hairline baseline. Axis text wears ink
 * tokens — never the series colour.
 */

export type ColumnSeries = {
  id: string;
  label: string;
  /** A CSS colour. Pass a var() so the palette stays defined in one place. */
  color: string;
  values: number[];
};

export function MonthlyColumns({
  labels,
  series,
  formatValue,
  caption,
  /** 0–100 charts want a fixed ceiling; counts and money scale to their max. */
  max,
  onAccent = false,
  className,
}: {
  labels: string[];
  series: ColumnSeries[];
  formatValue: (value: number) => string;
  /** Read by screen readers and used as the table view's caption. */
  caption: string;
  max?: number;
  /** True inside the marigold card, where ink replaces the surface tokens. */
  onAccent?: boolean;
  className?: string;
}) {
  const ceiling = Math.max(
    max ?? 0,
    ...series.flatMap((entry) => entry.values),
    // Never divide by zero, and keep an all-zero chart flat rather than full.
    1,
  );

  return (
    <figure className={cn("m-0 flex flex-col", className)}>
      <div
        className="flex min-h-20 flex-1 items-end gap-1.5 sm:min-h-24"
        aria-hidden
        role="presentation"
      >
        {labels.map((label, index) => (
          <div
            key={label}
            className="flex h-full flex-1 items-end justify-center gap-[2px]"
          >
            {series.map((entry) => {
              const value = entry.values[index] ?? 0;
              return (
                <div
                  key={entry.id}
                  // Centred in its slot so the column sits over its month
                  // label; capped at 24px so the band keeps its air.
                  className="flex h-full max-w-6 flex-1 items-end justify-center"
                >
                  {/* Native per-mark tooltip: no JS, and every value is also in
                      the table below, so nothing is gated behind a hover. */}
                  <div
                    title={`${label} · ${entry.label}: ${formatValue(value)}`}
                    className="w-full rounded-t-[4px]"
                    style={{
                      height: `${Math.max((value / ceiling) * 100, value > 0 ? 2 : 0)}%`,
                      backgroundColor: entry.color,
                    }}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div
        className={cn(
          "mt-2 border-t pt-1.5",
          onAccent ? "border-black/15" : "border-hairline",
        )}
      >
        <div className="flex gap-1.5">
          {labels.map((label, index) => (
            <span
              key={label}
              className={cn(
                // The current month is named by the figure above the chart, so
                // its tick carries the emphasis rather than its bar — colour
                // stays one-per-series, never a ramp keyed to value.
                "tabular flex-1 text-center text-xs",
                index === labels.length - 1
                  ? onAccent
                    ? "font-medium text-black/80"
                    : "text-ink-90"
                  : onAccent
                    ? "text-black/50"
                    : "text-ink-60",
              )}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* The table view twin: every value reachable without colour or hover. */}
      <table className="sr-only">
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Month</th>
            {series.map((entry) => (
              <th key={entry.id} scope="col">
                {entry.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {labels.map((label, index) => (
            <tr key={label}>
              <th scope="row">{label}</th>
              {series.map((entry) => (
                <td key={entry.id}>{formatValue(entry.values[index] ?? 0)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

/** Identity without relying on colour matching — required from two series up. */
export function ColumnLegend({ series }: { series: ColumnSeries[] }) {
  return (
    <ul className="flex flex-wrap items-center gap-4">
      {series.map((entry) => (
        <li key={entry.id} className="flex items-center gap-1.5 text-sm">
          <span
            aria-hidden
            className="size-2.5 rounded-sm"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-ink-60">{entry.label}</span>
        </li>
      ))}
    </ul>
  );
}
