"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import {
  categoryName as nameOf,
  categoryShortName as shortNameOf,
} from "@/lib/categories";
import {
  computeNewArrivals,
  computePriceBounds,
  type PriceBounds,
} from "@/lib/products";
import type { CategoryDef, ClientCatalogue, ClientProduct } from "@/lib/types";

/**
 * The catalogue, as the browser sees it.
 *
 * The cart resolves saved slugs against it, the browser filters and sorts
 * within it, and the price slider takes its range from it — all synchronously,
 * which is why it is handed down from the root layout rather than fetched.
 * Before the catalogue moved to a database these were module imports; the
 * context replaces that single source without changing what any of them do.
 */
interface CatalogueValue extends ClientCatalogue {
  priceBounds: PriceBounds;
  /** Slugs badged NEW on cards. */
  newArrivals: Set<string>;
  findProduct: (slug: string) => ClientProduct | undefined;
  categoryName: (slug: string) => string;
  categoryShortName: (slug: string) => string;
}

const CatalogueContext = createContext<CatalogueValue | null>(null);

export function CatalogueProvider({
  catalogue,
  children,
}: {
  catalogue: ClientCatalogue;
  children: ReactNode;
}) {
  const value = useMemo<CatalogueValue>(() => {
    const { products, categories } = catalogue;
    const bySlug = new Map(products.map((product) => [product.slug, product]));

    return {
      products,
      categories,
      priceBounds: computePriceBounds(products),
      newArrivals: computeNewArrivals(products),
      findProduct: (slug) => bySlug.get(slug),
      categoryName: (slug) => nameOf(categories, slug),
      categoryShortName: (slug) => shortNameOf(categories, slug),
    };
  }, [catalogue]);

  return <CatalogueContext.Provider value={value}>{children}</CatalogueContext.Provider>;
}

export function useCatalogue(): CatalogueValue {
  const context = useContext(CatalogueContext);
  if (!context) throw new Error("useCatalogue must be used inside <CatalogueProvider>");
  return context;
}

export type { CategoryDef, ClientProduct };
