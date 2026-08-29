import { Skeleton } from "@/components/ui/skeleton";

export default function PricebookLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-5 w-56" />
      </div>
      <Skeleton className="h-12 w-full" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <div className="divide-y divide-hairline rounded-lg border border-hairline bg-surface">
          {[0, 1, 2].map((row) => (
            <div key={row} className="space-y-2 p-4">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-5 w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
