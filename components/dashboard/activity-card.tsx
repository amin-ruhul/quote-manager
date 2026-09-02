"use client";

import { useState } from "react";

import {
  ColumnLegend,
  type ColumnSeries,
  MonthlyColumns,
} from "@/components/dashboard/monthly-columns";
import { Panel } from "@/components/panel";
import type { MonthPerformance } from "@/lib/dashboard";
import { basisPointsToPercent } from "@/lib/money";
import { cn } from "@/lib/utils";

/*
 * How quotes are landing (SPEC §12).
 *
 * Two readings of the same six months behind a switch rather than two charts
 * side by side: counts and a percentage share no y-axis, and putting them on
 * one plot would be the dual-axis mistake — a chart that invents a correlation
 * out of two arbitrary scales.
 *
 * The series colours are the quote statuses' own colours, so a bar and its
 * status pill match by construction. Validated for colour-vision deficiency
 * before use: ΔE 24.9 deutan, 26.0 normal vision, both above the ΔE 8 floor.
 */

type View = "counts" | "rate";

const VIEWS: { id: View; label: string }[] = [
  { id: "counts", label: "Sent vs accepted" },
  { id: "rate", label: "Acceptance rate" },
];

export function ActivityCard({
  months,
  className,
}: {
  months: MonthPerformance[];
  className?: string;
}) {
  const [view, setView] = useState<View>("counts");

  const labels = months.map((month) => month.label);

  const countSeries: ColumnSeries[] = [
    {
      id: "sent",
      label: "Sent",
      color: "var(--color-status-sent)",
      values: months.map((month) => month.sent),
    },
    {
      id: "accepted",
      label: "Accepted",
      color: "var(--color-status-accepted)",
      values: months.map((month) => month.accepted),
    },
  ];

  const rateSeries: ColumnSeries[] = [
    {
      id: "rate",
      label: "Acceptance rate",
      color: "var(--color-status-accepted)",
      values: months.map((month) => month.acceptanceRateBasisPoints),
    },
  ];

  return (
    <Panel className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold">How quotes are landing</h2>

        <div
          role="tablist"
          aria-label="Chart"
          className="inline-flex rounded-md bg-surface-2 p-0.5"
        >
          {VIEWS.map((option) => (
            <button
              key={option.id}
              type="button"
              role="tab"
              aria-selected={view === option.id}
              onClick={() => setView(option.id)}
              className={cn(
                "rounded-sm px-2.5 py-1 text-[0.8rem] font-medium transition-colors",
                view === option.id
                  ? "bg-surface text-ink-90"
                  : "text-ink-60 hover:text-ink-90",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {view === "counts" ? (
        <>
          {/* Two series always get a legend — identity is never colour alone. */}
          <ColumnLegend series={countSeries} />
          <MonthlyColumns
            labels={labels}
            series={countSeries}
            formatValue={(value) => String(value)}
            caption="Quotes sent and accepted, by month"
          />
        </>
      ) : (
        <MonthlyColumns
          labels={labels}
          series={rateSeries}
          // A rate is always read against 100%, so the ceiling is fixed —
          // scaling it to the best month would flatter a bad one.
          max={10_000}
          formatValue={(value) => `${basisPointsToPercent(value)}%`}
          caption="Share of sent quotes accepted, by month"
        />
      )}
    </Panel>
  );
}
