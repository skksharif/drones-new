"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ProductGrid } from "./ProductGrid";
import { ActiveFilterChips } from "@/components/filters/ActiveFilterChips";
import { BottomSheet } from "@/components/filters/BottomSheet";
import { FilterPanel } from "@/components/filters/FilterPanel";
import { SearchInput } from "@/components/filters/SearchInput";
import { SortOptionList, SortSelect } from "@/components/filters/SortSelect";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { FilterIcon, SearchIcon, SortIcon } from "@/components/ui/Icons";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
import { useProductFilters } from "@/hooks/useProductFilters";
import { SORT_OPTIONS, activeFilterCount, filterProducts, isDefaultFilters } from "@/lib/filters";
import { products as allProducts } from "@/lib/products";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ProductBrowser({
  source = allProducts,
  lockedCategory,
  showSearch = true,
  searchAutoFocus = false,
  emptyHint,
}: {
  /** Product pool to filter within — a category page passes its own subset. */
  source?: Product[];
  /** Fixes the category facet (category pages) and hides it from the panel. */
  lockedCategory?: string;
  showSearch?: boolean;
  searchAutoFocus?: boolean;
  emptyHint?: string;
}) {
  const {
    filters,
    setQuery,
    setSort,
    toggleCategory,
    toggleType,
    toggleGroup,
    toggleAvailability,
    setPriceRange,
    setFeaturedOnly,
    clearAll,
  } = useProductFilters(lockedCategory);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  // One short skeleton pass on mount avoids a jarring pop-in and gives the
  // client-side filter state time to read the URL.
  const [booting, setBooting] = useState(true);
  useEffect(() => {
    const timer = window.setTimeout(() => setBooting(false), 220);
    return () => window.clearTimeout(timer);
  }, []);

  const { items, total } = useMemo(
    () => filterProducts(filters, source),
    [filters, source],
  );

  const filterCount = activeFilterCount(filters) - (lockedCategory ? 1 : 0);
  const hasFilters = !isDefaultFilters(filters);
  const activeSortLabel = SORT_OPTIONS.find((o) => o.value === filters.sort)?.label;

  const panelProps = {
    filters,
    onToggleCategory: toggleCategory,
    onToggleType: toggleType,
    onToggleGroup: toggleGroup,
    onToggleAvailability: toggleAvailability,
    onPriceChange: setPriceRange,
    onFeaturedChange: setFeaturedOnly,
    hideCategories: Boolean(lockedCategory),
  };

  return (
    <div className="lg:grid lg:grid-cols-[16.5rem_1fr] lg:gap-10 xl:grid-cols-[18rem_1fr]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block" aria-label="Product filters">
        <div className="sticky top-32 max-h-[calc(100dvh-9rem)] overflow-y-auto overscroll-contain pb-8 pr-2">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Filters</h2>
            {hasFilters ? (
              <button
                type="button"
                onClick={clearAll}
                className="text-xs font-semibold text-brand-700 underline-offset-2 hover:underline"
              >
                Clear all
              </button>
            ) : null}
          </div>
          <FilterPanel {...panelProps} />
        </div>
      </aside>

      <div className="min-w-0">
        {/* Search + sort toolbar */}
        {showSearch ? (
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchInput
              value={filters.q}
              onChange={setQuery}
              autoFocus={searchAutoFocus}
              className="flex-1"
              placeholder="Search drones, frames, motors, nozzles…"
            />
            <SortSelect
              value={filters.sort}
              onChange={setSort}
              className="hidden sm:block sm:w-56"
            />
          </div>
        ) : (
          <div className="mb-4 hidden justify-end sm:flex">
            <SortSelect value={filters.sort} onChange={setSort} className="w-56" />
          </div>
        )}

        {/* Mobile filter + sort bar */}
        <div className="mb-4 grid grid-cols-2 gap-2.5 sm:hidden">
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="flex h-11 items-center justify-center gap-2 rounded-full border border-ink-200 bg-white text-sm font-medium text-ink-700 transition-colors active:bg-ink-100"
          >
            <FilterIcon className="size-4.5" />
            Filters
            {filterCount > 0 ? (
              <span className="flex size-5 items-center justify-center rounded-full gradient-brand text-[0.625rem] font-bold text-white">
                {filterCount}
              </span>
            ) : null}
          </button>
          <button
            type="button"
            onClick={() => setSortOpen(true)}
            className="flex h-11 items-center justify-center gap-2 rounded-full border border-ink-200 bg-white text-sm font-medium text-ink-700 transition-colors active:bg-ink-100"
          >
            <SortIcon className="size-4.5" />
            Sort
          </button>
        </div>

        {/* Tablet filter button */}
        <div className="mb-4 hidden sm:flex lg:hidden">
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="flex h-11 items-center gap-2 rounded-full border border-ink-200 bg-white px-5 text-sm font-medium text-ink-700 transition-colors hover:border-brand-700/40"
          >
            <FilterIcon className="size-4.5" />
            Filters
            {filterCount > 0 ? (
              <span className="flex size-5 items-center justify-center rounded-full gradient-brand text-[0.625rem] font-bold text-white">
                {filterCount}
              </span>
            ) : null}
          </button>
        </div>

        {/* Result count + active chips */}
        <div className="mb-5 space-y-3">
          <p className="text-sm text-ink-500" role="status" aria-live="polite">
            {booting ? (
              <span className="inline-block h-4 w-32 rounded skeleton align-middle" />
            ) : (
              <>
                <span className="font-semibold text-ink-900">{total}</span>{" "}
                {total === 1 ? "product" : "products"}
                {filters.q.trim() ? (
                  <>
                    {" "}
                    for <span className="font-medium text-ink-800">“{filters.q.trim()}”</span>
                  </>
                ) : null}
                <span className="hidden sm:inline"> · sorted by {activeSortLabel}</span>
              </>
            )}
          </p>

          <ActiveFilterChips
            filters={filters}
            onToggleCategory={toggleCategory}
            onToggleType={toggleType}
            onToggleGroup={toggleGroup}
            onToggleAvailability={toggleAvailability}
            onPriceChange={setPriceRange}
            onFeaturedChange={setFeaturedOnly}
            onClearSearch={() => setQuery("")}
            onClearAll={clearAll}
            hideCategories={Boolean(lockedCategory)}
          />
        </div>

        {/* Results */}
        {booting ? (
          <ProductGridSkeleton count={8} />
        ) : items.length > 0 ? (
          <ProductGrid products={items} priorityCount={2} />
        ) : (
          <EmptyState
            icon={<SearchIcon className="size-6" />}
            title={filters.q.trim() ? "No products match your search" : "No products match these filters"}
            description={
              emptyHint ??
              "Try a different keyword, widen the price range, or clear a filter or two. If you're after a specific part we don't list, message us on WhatsApp — we can usually source it."
            }
            action={
              <>
                <Button onClick={clearAll} variant="primary">
                  Clear all filters
                </Button>
                <Link
                  href="/contact"
                  className="inline-flex h-11 items-center rounded-full border border-ink-200 bg-white px-5 text-sm font-medium text-ink-700 transition-colors hover:border-brand-700/40 hover:text-brand-800"
                >
                  Request a part
                </Link>
              </>
            }
          />
        )}
      </div>

      {/* Mobile / tablet sheets */}
      <BottomSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filters"
        footer={
          <div className="flex gap-3">
            <Button
              variant="outline"
              fullWidth
              onClick={() => {
                clearAll();
                setFiltersOpen(false);
              }}
            >
              Clear all
            </Button>
            <Button fullWidth onClick={() => setFiltersOpen(false)}>
              Show {total} {total === 1 ? "result" : "results"}
            </Button>
          </div>
        }
      >
        <div className={cn("pt-2", "pb-2")}>
          <FilterPanel {...panelProps} />
        </div>
      </BottomSheet>

      <BottomSheet open={sortOpen} onClose={() => setSortOpen(false)} title="Sort by">
        <div className="pt-2">
          <SortOptionList
            value={filters.sort}
            onChange={(value) => {
              setSort(value);
              setSortOpen(false);
            }}
          />
        </div>
      </BottomSheet>
    </div>
  );
}
