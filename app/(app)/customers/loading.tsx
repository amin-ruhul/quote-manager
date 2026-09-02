import { Panel } from "@/components/panel";
import { Skeleton } from "@/components/ui/skeleton";

export default function CustomersLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-9 w-44" />
        <Skeleton className="h-5 w-28" />
      </div>
      <Skeleton className="h-12 w-full" />
      <Panel className="divide-y divide-hairline p-0">
        {[0, 1, 2].map((row) => (
          <div key={row} className="space-y-2 p-4">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-4 w-40" />
          </div>
        ))}
      </Panel>
    </div>
  );
}
