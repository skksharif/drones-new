"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import {
  SORT_OPTIONS,
  defaultFilters,
  type FilterState,
  type SortValue,
} from "@/lib/filters";
import { priceBounds } from "@/lib/products";
import type { Availability, ProductGroup } from "@/lib/types";
import { clamp, toggle } from "@/lib/utils";

const PARAM = {
  q: "q",
  category: "category",
  type: "type",
  group: "group",
  stock: "stock",
  min: "min",
  max: "max",
  featured: "featured",
  sort: "sort",
} as const;

const AVAILABILITIES: Availability[] = [
  "in-stock",
  "low-stock",
  "made-to-order",
  "out-of-stock",
];
const GROUPS: ProductGroup[] = ["drone", "part"];
const SORTS = SORT_OPTIONS.map((o) => o.value);

function readList(params: URLSearchParams, key: string): string[] {
  const raw = params.get(key);
  if (!raw) return [];
  return raw.split(",").map((v) => v.trim()).filter(Boolean);
}

function readInt(params: URLSearchParams, key: string, fallback: number): number {
  const raw = params.get(key);
  if (raw === null) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? clamp(parsed, priceBounds.min, priceBounds.max) : fallback;
}

/**
 * Reads and writes the full filter state through the URL, so every filtered
 * view is shareable, bookmarkable and restored on back/forward navigation.
 */
export function useProductFilters(lockedCategory?: string) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo<FilterState>(() => {
    const params = new URLSearchParams(searchParams.toString());
    const sortParam = params.get(PARAM.sort);
    const min = readInt(params, PARAM.min, defaultFilters.minPrice);
    const max = readInt(params, PARAM.max, defaultFilters.maxPrice);

    return {
      q: params.get(PARAM.q) ?? "",
      categories: lockedCategory ? [lockedCategory] : readList(params, PARAM.category),
      types: readList(params, PARAM.type),
      groups: readList(params, PARAM.group).filter((g): g is ProductGroup =>
        GROUPS.includes(g as ProductGroup),
      ),
      availability: readList(params, PARAM.stock).filter((a): a is Availability =>
        AVAILABILITIES.includes(a as Availability),
      ),
      minPrice: Math.min(min, max),
      maxPrice: Math.max(min, max),
      featuredOnly: params.get(PARAM.featured) === "1",
      sort: (SORTS.includes(sortParam as SortValue) ? sortParam : "relevance") as SortValue,
    };
  }, [searchParams, lockedCategory]);

  const commit = useCallback(
    (next: Partial<FilterState>) => {
      const merged = { ...filters, ...next };
      const params = new URLSearchParams();

      if (merged.q.trim()) params.set(PARAM.q, merged.q.trim());
      if (!lockedCategory && merged.categories.length) {
        params.set(PARAM.category, merged.categories.join(","));
      }
      if (merged.types.length) params.set(PARAM.type, merged.types.join(","));
      if (merged.groups.length) params.set(PARAM.group, merged.groups.join(","));
      if (merged.availability.length) params.set(PARAM.stock, merged.availability.join(","));
      if (merged.minPrice !== defaultFilters.minPrice) {
        params.set(PARAM.min, String(merged.minPrice));
      }
      if (merged.maxPrice !== defaultFilters.maxPrice) {
        params.set(PARAM.max, String(merged.maxPrice));
      }
      if (merged.featuredOnly) params.set(PARAM.featured, "1");
      if (merged.sort !== "relevance") params.set(PARAM.sort, merged.sort);

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [filters, lockedCategory, pathname, router],
  );

  return {
    filters,
    setQuery: useCallback((q: string) => commit({ q }), [commit]),
    setSort: useCallback((sort: SortValue) => commit({ sort }), [commit]),
    toggleCategory: useCallback(
      (slug: string) => commit({ categories: toggle(filters.categories, slug), types: [] }),
      [commit, filters.categories],
    ),
    toggleType: useCallback(
      (type: string) => commit({ types: toggle(filters.types, type) }),
      [commit, filters.types],
    ),
    toggleGroup: useCallback(
      (group: ProductGroup) => commit({ groups: toggle(filters.groups, group) }),
      [commit, filters.groups],
    ),
    toggleAvailability: useCallback(
      (value: Availability) => commit({ availability: toggle(filters.availability, value) }),
      [commit, filters.availability],
    ),
    setPriceRange: useCallback(
      (minPrice: number, maxPrice: number) => commit({ minPrice, maxPrice }),
      [commit],
    ),
    setFeaturedOnly: useCallback(
      (featuredOnly: boolean) => commit({ featuredOnly }),
      [commit],
    ),
    clearAll: useCallback(() => {
      const params = new URLSearchParams();
      if (filters.sort !== "relevance") params.set(PARAM.sort, filters.sort);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    }, [filters.sort, pathname, router]),
  };
}
