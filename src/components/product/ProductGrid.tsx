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
        "grid grid-cols-2 gap-3 sm:gap-5",
        columns === "wide"
          ? "lg:grid-cols-3 xl:grid-cols-4"
          : "lg:grid-cols-3 xl:grid-cols-4",
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
