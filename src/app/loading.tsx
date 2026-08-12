import { ProductGridSkeleton, Skeleton } from "@/components/ui/Skeleton";

/** Route-level fallback shown during navigation. Mirrors the listing layout. */
export default function Loading() {
  return (
    <div className="container-page space-y-2.5 py-2.5 sm:py-3">
      <Skeleton className="h-3 w-40" />

      <div className="rounded-[var(--radius-card)] bg-white p-4 shadow-[var(--shadow-card)] sm:p-5">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="mt-2 h-4 w-full max-w-md" />

        <div className="mt-5 lg:grid lg:grid-cols-[16.5rem_1fr] lg:gap-10 xl:grid-cols-[18rem_1fr]">
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
            <Skeleton className="mb-4 h-12 w-full rounded-2xl" />
            <Skeleton className="mb-5 h-4 w-32" />
            <ProductGridSkeleton count={8} />
          </div>
        </div>
      </div>
    </div>
  );
}
