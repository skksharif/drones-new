import { ProductGridSkeleton, Skeleton } from "@/components/ui/Skeleton";

/** Route-level fallback shown during navigation. Mirrors the listing layout. */
export default function Loading() {
  return (
    <div>
      <div className="border-b border-ink-100 bg-surface-muted">
        <div className="container-page py-6 sm:py-10">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="mt-4 h-8 w-64 sm:h-10" />
          <Skeleton className="mt-3 h-4 w-full max-w-xl" />
        </div>
      </div>

      <div className="container-page py-8 sm:py-10 lg:py-12">
        <div className="lg:grid lg:grid-cols-[16.5rem_1fr] lg:gap-10 xl:grid-cols-[18rem_1fr]">
          <div className="hidden space-y-6 lg:block">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
          </div>

          <div>
            <Skeleton className="mb-4 h-12 w-full rounded-full" />
            <Skeleton className="mb-5 h-4 w-32" />
            <ProductGridSkeleton count={8} />
          </div>
        </div>
      </div>
    </div>
  );
}
