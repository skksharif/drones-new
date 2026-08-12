"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
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
const SORTS: SortValue[] = SORT_OPTIONS.map((o) => o.value);

/* -------------------------------------------------------------------------- */
/* URL as the store                                                            */
/* -------------------------------------------------------------------------- */

const listeners = new Set<() => void>();

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  window.addEventListener("popstate", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("popstate", onChange);
  };
}

/** Snapshot is the raw querystring — a primitive, so identity is never a trap. */
function getSnapshot(): string {
  return window.location.search;
}

/** Prerender has no URL, so the server renders the unfiltered catalogue. */
function getServerSnapshot(): string {
  return "";
}

function writeSearch(query: string): void {
  const url = query ? `${window.location.pathname}?${query}` : window.location.pathname;
  // `replaceState` keeps Back pointing at the previous page rather than the
  // previous checkbox, and costs no navigation — filtering stays instant.
  window.history.replaceState(null, "", url);
  for (const listener of listeners) listener();
}

/* -------------------------------------------------------------------------- */
/* Serialisation                                                               */
/* -------------------------------------------------------------------------- */

function readList(params: URLSearchParams, key: string): string[] {
  const raw = params.get(key);
  if (!raw) return [];
  return [...new Set(raw.split(",").map((v) => v.trim()).filter(Boolean))];
}

function readInt(params: URLSearchParams, key: string, fallback: number): number {
  const raw = params.get(key);
  if (raw === null) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? clamp(parsed, priceBounds.min, priceBounds.max) : fallback;
}

function parseFilters(search: string, lockedCategory?: string): FilterState {
  const params = new URLSearchParams(search);
  const min = readInt(params, PARAM.min, defaultFilters.minPrice);
  const max = readInt(params, PARAM.max, defaultFilters.maxPrice);
  const sortParam = params.get(PARAM.sort);

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
    sort: SORTS.includes(sortParam as SortValue) ? (sortParam as SortValue) : defaultFilters.sort,
  };
}

/** Canonical querystring for a filter state — defaults are omitted entirely. */
function serialiseFilters(filters: FilterState, lockedCategory?: string): string {
  const params = new URLSearchParams();

  if (filters.q.trim()) params.set(PARAM.q, filters.q.trim());
  if (!lockedCategory && filters.categories.length) {
    params.set(PARAM.category, filters.categories.join(","));
  }
  if (filters.types.length) params.set(PARAM.type, filters.types.join(","));
  if (filters.groups.length) params.set(PARAM.group, filters.groups.join(","));
  if (filters.availability.length) params.set(PARAM.stock, filters.availability.join(","));
  if (filters.minPrice !== defaultFilters.minPrice) params.set(PARAM.min, String(filters.minPrice));
  if (filters.maxPrice !== defaultFilters.maxPrice) params.set(PARAM.max, String(filters.maxPrice));
  if (filters.featuredOnly) params.set(PARAM.featured, "1");
  if (filters.sort !== defaultFilters.sort) params.set(PARAM.sort, filters.sort);

  return params.toString();
}

/** Keeps the price range ordered and in bounds, and pins a locked category. */
function normalise(filters: FilterState, lockedCategory?: string): FilterState {
  const a = clamp(filters.minPrice, priceBounds.min, priceBounds.max);
  const b = clamp(filters.maxPrice, priceBounds.min, priceBounds.max);

  return {
    ...filters,
    categories: lockedCategory ? [lockedCategory] : filters.categories,
    minPrice: Math.min(a, b),
    maxPrice: Math.max(a, b),
  };
}

/* -------------------------------------------------------------------------- */
/* Hook                                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Filter state lives in the address bar, read through `useSyncExternalStore`.
 *
 * That buys three things at once: every filtered view is shareable and survives
 * back/forward; the server can prerender the unfiltered catalogue (real product
 * markup for crawlers, no Suspense skeleton); and each update reads the current
 * URL synchronously, so two taps in the same frame can never clobber each other
 * the way a stale React snapshot would.
 */
export function useProductFilters(lockedCategory?: string) {
  const search = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const filters = useMemo(
    () => parseFilters(search, lockedCategory),
    [search, lockedCategory],
  );

  const update = useCallback(
    (patch: (prev: FilterState) => Partial<FilterState>) => {
      // Re-read rather than closing over `filters`: the URL is the truth, and
      // it is already up to date even mid-frame.
      const prev = parseFilters(window.location.search, lockedCategory);
      const next = normalise({ ...prev, ...patch(prev) }, lockedCategory);
      writeSearch(serialiseFilters(next, lockedCategory));
    },
    [lockedCategory],
  );

  return {
    filters,
    setQuery: useCallback((q: string) => update(() => ({ q })), [update]),
    setSort: useCallback((sort: SortValue) => update(() => ({ sort })), [update]),
    toggleCategory: useCallback(
      // Sub-categories belong to a category, so they reset when it changes.
      (slug: string) =>
        update((prev) => ({ categories: toggle(prev.categories, slug), types: [] })),
      [update],
    ),
    toggleType: useCallback(
      (type: string) => update((prev) => ({ types: toggle(prev.types, type) })),
      [update],
    ),
    toggleGroup: useCallback(
      (group: ProductGroup) => update((prev) => ({ groups: toggle(prev.groups, group) })),
      [update],
    ),
    toggleAvailability: useCallback(
      (value: Availability) =>
        update((prev) => ({ availability: toggle(prev.availability, value) })),
      [update],
    ),
    setPriceRange: useCallback(
      (minPrice: number, maxPrice: number) => update(() => ({ minPrice, maxPrice })),
      [update],
    ),
    setFeaturedOnly: useCallback(
      (featuredOnly: boolean) => update(() => ({ featuredOnly })),
      [update],
    ),
    /** Resets every facet but keeps the chosen sort order. */
    clearAll: useCallback(
      () => update((prev) => ({ ...defaultFilters, sort: prev.sort })),
      [update],
    ),
  };
}
