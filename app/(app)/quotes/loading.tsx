import { Panel } from "@/components/panel";
import { Skeleton } from "@/components/ui/skeleton";

export default function QuotesLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-9 w-36" />
        <Skeleton className="h-5 w-24" />
      </div>
      <Skeleton className="h-12 w-full" />
      <Panel className="divide-y divide-hairline p-0">
        {[0, 1, 2].map((row) => (
          <div key={row} className="space-y-2 p-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-5 w-2/3" />
          </div>
        ))}
      </Panel>
    </div>
  );
}
