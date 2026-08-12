import { ProductCard } from "./ProductCard";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ProductGrid({
  products,
  className,
  /** Number of leading cards to mark as priority for LCP. */
  priorityCount = 0,
  columns = "default",
}: {
  products: Product[];
  className?: string;
  priorityCount?: number;
  columns?: "default" | "wide";
}) {
  return (
    <div
      className={cn(
        // Denser than a marketing grid on purpose: more of the catalogue is
        // visible per screen, which is the point of a shop listing.
        "grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3",
        columns === "wide" ? "lg:grid-cols-4 xl:grid-cols-5" : "lg:grid-cols-4 xl:grid-cols-5",
        className,
      )}
    >
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={index < priorityCount}
        />
      ))}
    </div>
  );
}
