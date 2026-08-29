import { Panel } from "@/components/panel";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-5 w-40" />
      </div>
      <Skeleton className="h-32 w-full rounded-lg" />
      <div className="grid grid-cols-2 gap-2">
        {[0, 1, 2, 3].map((cell) => (
          <Skeleton key={cell} className="h-20 w-full rounded-lg" />
        ))}
      </div>
      <Panel className="divide-y divide-hairline p-0">
        {[0, 1, 2].map((row) => (
          <div key={row} className="space-y-2 p-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-5 w-2/3" />
          </div>
        ))}
      </Panel>
    </div>
  );
}
