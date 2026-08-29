import { Skeleton } from "@/components/ui/skeleton";

export default function PublicQuoteLoading() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex items-center gap-4">
        <Skeleton className="size-14 rounded-md" />
        <Skeleton className="h-6 w-40" />
      </div>
      <div className="mt-6 space-y-4 rounded-lg border border-hairline bg-surface p-5 shadow-quote sm:p-8">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-3/4" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-5/6" />
        <div className="space-y-3 pt-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="mt-6 h-14 w-full" />
    </main>
  );
}
