import { Panel } from "@/components/panel";
import { Skeleton } from "@/components/ui/skeleton";

export default function CustomerDetailLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Skeleton className="h-9 w-52" />
      <Panel className="space-y-3">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-5 w-56" />
        <Skeleton className="h-11 w-32" />
      </Panel>
      <div className="grid grid-cols-2 gap-2">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
      <Panel className="divide-y divide-hairline p-0">
        {[0, 1].map((row) => (
          <div key={row} className="space-y-2 p-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-2/3" />
          </div>
        ))}
      </Panel>
    </div>
  );
}
