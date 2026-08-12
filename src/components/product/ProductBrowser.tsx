"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { ProductGrid } from "./ProductGrid";
import { ActiveFilterChips } from "@/components/filters/ActiveFilterChips";
import { BottomSheet } from "@/components/filters/BottomSheet";
import { FilterPanel } from "@/components/filters/FilterPanel";
import { SearchInput } from "@/components/filters/SearchInput";
import { SortOptionList, SortSelect } from "@/components/filters/SortSelect";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { FilterIcon, SearchIcon, SortIcon } from "@/components/ui/Icons";
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
  className,
}: {
  /** Product pool to filter within — a category page passes its own subset. */
  source?: Product[];
  /** Fixes the category facet (category pages) and hides it from the panel. */
  lockedCategory?: string;
  showSearch?: boolean;
  searchAutoFocus?: boolean;
  emptyHint?: string;
  className?: string;
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

  const closeFilters = useCallback(() => setFiltersOpen(false), []);
  const closeSort = useCallback(() => setSortOpen(false), []);

  const { items, total } = useMemo(() => filterProducts(filters, source), [filters, source]);

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
    source,
  };

  const clearAllAndClose = useCallback(() => {
    clearAll();
    setFiltersOpen(false);
  }, [clearAll]);

  return (
    <div
      className={cn(
        "lg:grid lg:grid-cols-[15rem_1fr] lg:items-start lg:gap-8 xl:grid-cols-[16rem_1fr]",
        className,
      )}
    >
      {/* Desktop sidebar */}
      <aside className="hidden lg:block" aria-label="Product filters">
        <div className="sticky top-[calc(var(--header-h)+1.5rem)] max-h-[calc(100dvh-var(--header-h)-3rem)] overflow-y-auto overscroll-contain pb-8 pr-2">
          <div className="mb-4 flex items-center justify-between">
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
        {/* Toolbar — sticks under the header so filters and sort are always a
            thumb away, however far the grid has been scrolled. */}
        <div className="sticky top-[var(--header-h)] z-30 -mx-3 mb-3 border-b border-ink-100 bg-white/95 px-3 py-2.5 backdrop-blur-md sm:-mx-4 sm:px-4 lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none">
          <div className="flex items-center gap-2 sm:gap-3">
            {showSearch ? (
              <SearchInput
                value={filters.q}
                onChange={setQuery}
                autoFocus={searchAutoFocus}
                className="min-w-0 flex-1"
                placeholder="Search drones, frames, motors, nozzles…"
              />
            ) : (
              <div className="flex-1" />
            )}

            {/* Compact icon controls — phones only */}
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              aria-label={filterCount > 0 ? `Filters, ${filterCount} active` : "Filters"}
              className="relative flex size-10 shrink-0 items-center justify-center rounded-xl border border-ink-200 bg-white text-ink-700 tap-highlight-none transition-colors active:bg-ink-100 sm:hidden"
            >
              <FilterIcon className="size-4.5" />
              {filterCount > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full gradient-brand text-[0.625rem] font-bold text-white ring-2 ring-white">
                  {filterCount}
                </span>
              ) : null}
            </button>
            <button
              type="button"
              onClick={() => setSortOpen(true)}
              aria-label={`Sort products, currently ${activeSortLabel}`}
              className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-ink-200 bg-white text-ink-700 tap-highlight-none transition-colors active:bg-ink-100 sm:hidden"
            >
              <SortIcon className="size-4.5" />
            </button>

            {/* Tablet: full filter button + native sort select */}
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="hidden h-10 shrink-0 items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 text-[0.8125rem] font-medium text-ink-700 transition-colors hover:border-brand-700/40 sm:flex lg:hidden"
            >
              <FilterIcon className="size-4" />
              Filters
              {filterCount > 0 ? (
                <span className="flex size-5 items-center justify-center rounded-full gradient-brand text-[0.625rem] font-bold text-white">
                  {filterCount}
                </span>
              ) : null}
            </button>
            <SortSelect
              value={filters.sort}
              onChange={setSort}
              className="hidden w-48 shrink-0 sm:block"
            />
          </div>
        </div>

        {/* Result count + active chips */}
        <div className="mb-3 space-y-2">
          <p className="text-xs text-ink-500 sm:text-sm" role="status" aria-live="polite">
            <span className="font-semibold text-ink-900">{total}</span>{" "}
            {total === 1 ? "product" : "products"}
            {filters.q.trim() ? (
              <>
                {" "}
                for <span className="font-medium text-ink-800">“{filters.q.trim()}”</span>
              </>
            ) : null}
            <span className="hidden sm:inline"> · sorted by {activeSortLabel}</span>
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
        {items.length > 0 ? (
          <ProductGrid products={items} priorityCount={4} />
        ) : (
          <EmptyState
            icon={<SearchIcon className="size-6" />}
            title={
              filters.q.trim() ? "No products match your search" : "No products match these filters"
            }
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
        onClose={closeFilters}
        title="Filters"
        footer={
          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={clearAllAndClose}>
              Clear all
            </Button>
            <Button fullWidth onClick={closeFilters}>
              Show {total} {total === 1 ? "result" : "results"}
            </Button>
          </div>
        }
      >
        <div className="py-2">
          <FilterPanel {...panelProps} />
        </div>
      </BottomSheet>

      <BottomSheet open={sortOpen} onClose={closeSort} title="Sort by">
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
