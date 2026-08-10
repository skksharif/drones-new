import { ProductCard } from "./ProductCard";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Horizontally scrolling product rail on mobile that becomes a grid from `sm`
 * upward. Uses scroll-snap for a native-feeling swipe on touch.
 */
export function ProductRail({
  products,
  className,
  priorityCount = 0,
}: {
  products: Product[];
  className?: string;
  priorityCount?: number;
}) {
  return (
    <>
      <div
        className={cn(
          "no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:hidden",
          className,
        )}
      >
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            priority={index < priorityCount}
            className="w-[62vw] max-w-64 shrink-0 snap-start"
            sizes="62vw"
          />
        ))}
      </div>

      <div
        className={cn(
          "hidden gap-5 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
          className,
        )}
      >
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} priority={index < priorityCount} />
        ))}
      </div>
    </>
  );
}
