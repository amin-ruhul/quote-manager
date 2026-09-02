import { Panel } from "@/components/panel";
import { Skeleton } from "@/components/ui/skeleton";

/** Mirrors the dashboard's grid, so nothing jumps when the data lands. */
export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-5 w-40" />
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <Skeleton className="h-32 w-full rounded-lg lg:col-span-7" />

        <div className="grid grid-cols-2 gap-2 lg:col-span-5 lg:content-start">
          {[0, 1, 2, 3].map((cell) => (
            <Skeleton key={cell} className="h-20 w-full rounded-lg" />
          ))}
        </div>

        <SectionSkeleton className="lg:col-span-7" rows={3} />

        <div className="grid gap-4 lg:col-span-5 lg:content-start">
          <SectionSkeleton rows={2} />
          <SectionSkeleton rows={2} />
        </div>
      </div>
    </div>
  );
}

function SectionSkeleton({
  rows,
  className,
}: {
  rows: number;
  className?: string;
}) {
  return (
    <Panel className={`p-0 ${className ?? ""}`}>
      <div className="border-b border-hairline px-4 py-3 sm:px-5">
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="divide-y divide-hairline">
        {Array.from({ length: rows }, (_, row) => (
          <div key={row} className="space-y-2 px-4 py-3 sm:px-5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-2/3" />
          </div>
        ))}
      </div>
      <div className="border-t border-hairline p-3">
        <Skeleton className="h-11 w-full rounded-md" />
      </div>
    </Panel>
  );
}
