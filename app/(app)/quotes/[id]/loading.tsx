import { Panel } from "@/components/panel";
import { Skeleton } from "@/components/ui/skeleton";

export default function QuoteBuilderLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-2/3" />
      </div>
      <Panel className="space-y-4">
        {[0, 1, 2].map((field) => (
          <div key={field} className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-11 w-full" />
          </div>
        ))}
      </Panel>
      <Panel className="space-y-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
      </Panel>
    </div>
  );
}
