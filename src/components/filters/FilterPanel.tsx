"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { CheckIcon, SparkIcon } from "@/components/ui/Icons";
import {
  AVAILABILITY_OPTIONS,
  GROUP_OPTIONS,
  availableTypes,
  defaultFilters,
  type FilterState,
} from "@/lib/filters";
import { categories } from "@/lib/categories";
import { formatPriceCompact } from "@/lib/format";
import { priceBounds, products as allProducts } from "@/lib/products";
import type { Availability, Product, ProductGroup } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface FilterPanelProps {
  filters: FilterState;
  onToggleCategory: (slug: string) => void;
  onToggleType: (type: string) => void;
  onToggleGroup: (group: ProductGroup) => void;
  onToggleAvailability: (value: Availability) => void;
  onPriceChange: (min: number, max: number) => void;
  onFeaturedChange: (value: boolean) => void;
  /** Hides the category block on category pages where it is already fixed. */
  hideCategories?: boolean;
  /** Pool the counts are drawn from — a category page passes its own subset. */
  source?: Product[];
}

export function FilterPanel({
  filters,
  onToggleCategory,
  onToggleType,
  onToggleGroup,
  onToggleAvailability,
  onPriceChange,
  onFeaturedChange,
  hideCategories = false,
  source = allProducts,
}: FilterPanelProps) {
  const types = useMemo(
    () => availableTypes(filters.categories, source),
    [filters.categories, source],
  );

  // Counts describe the pool, not the current result set, so a facet never
  // reads "0" purely because another facet is switched on.
  const counts = useMemo(() => {
    const byCategory = new Map<string, number>();
    const byAvailability = new Map<string, number>();
    const byGroup = new Map<string, number>();
    let featured = 0;

    for (const product of source) {
      byCategory.set(product.category, (byCategory.get(product.category) ?? 0) + 1);
      byAvailability.set(
        product.availability,
        (byAvailability.get(product.availability) ?? 0) + 1,
      );
      byGroup.set(product.group, (byGroup.get(product.group) ?? 0) + 1);
      if (product.featured) featured += 1;
    }

    return { byCategory, byAvailability, byGroup, featured };
  }, [source]);

  const groupOptions = GROUP_OPTIONS.filter((o) => (counts.byGroup.get(o.value) ?? 0) > 0);
  const availabilityOptions = AVAILABILITY_OPTIONS.filter(
    (o) => (counts.byAvailability.get(o.value) ?? 0) > 0,
  );
  const categoryOptions = categories.filter((c) => (counts.byCategory.get(c.slug) ?? 0) > 0);

  return (
    <div className="space-y-7">
      {groupOptions.length > 1 ? (
        <Group label="Product type">
          <div className="flex flex-wrap gap-2">
            {groupOptions.map((option) => (
              <Chip
                key={option.value}
                active={filters.groups.includes(option.value)}
                onClick={() => onToggleGroup(option.value)}
              >
                {option.label}
              </Chip>
            ))}
          </div>
        </Group>
      ) : null}

      {!hideCategories && categoryOptions.length > 1 ? (
        <Group label="Category">
          <ul className="space-y-0.5">
            {categoryOptions.map((category) => (
              <li key={category.slug}>
                <CheckboxRow
                  checked={filters.categories.includes(category.slug)}
                  onChange={() => onToggleCategory(category.slug)}
                  label={category.name}
                  count={counts.byCategory.get(category.slug) ?? 0}
                />
              </li>
            ))}
          </ul>
        </Group>
      ) : null}

      {types.length > 1 ? (
        <Group label="Sub-category">
          <div className="flex flex-wrap gap-2">
            {types.map((type) => (
              <Chip
                key={type}
                active={filters.types.includes(type)}
                onClick={() => onToggleType(type)}
              >
                {type}
              </Chip>
            ))}
          </div>
        </Group>
      ) : null}

      <Group label="Price range">
        <PriceRange min={filters.minPrice} max={filters.maxPrice} onChange={onPriceChange} />
      </Group>

      {availabilityOptions.length > 1 ? (
        <Group label="Availability">
          <ul className="space-y-0.5">
            {availabilityOptions.map((option) => (
              <li key={option.value}>
                <CheckboxRow
                  checked={filters.availability.includes(option.value)}
                  onChange={() => onToggleAvailability(option.value)}
                  label={option.label}
                  count={counts.byAvailability.get(option.value) ?? 0}
                />
              </li>
            ))}
          </ul>
        </Group>
      ) : null}

      {counts.featured > 0 ? (
        <Group label="Highlights">
          <CheckboxRow
            checked={filters.featuredOnly}
            onChange={() => onFeaturedChange(!filters.featuredOnly)}
            label={
              <span className="inline-flex items-center gap-1.5">
                <SparkIcon className="size-3.5 text-brand-700" />
                Featured products only
              </span>
            }
            count={counts.featured}
          />
        </Group>
      ) : null}
    </div>
  );
}

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-3 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-ink-400">
        {label}
      </legend>
      {children}
    </fieldset>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "min-h-11 rounded-full border px-4 text-xs font-medium transition-all duration-200",
        "motion-safe:active:scale-95",
        active
          ? "border-brand-700 bg-brand-700 text-white shadow-[var(--shadow-soft)]"
          : "border-ink-200 bg-white text-ink-600 hover:border-brand-700/40 hover:text-brand-800",
      )}
    >
      {children}
    </button>
  );
}

function CheckboxRow({
  checked,
  onChange,
  label,
  count,
}: {
  checked: boolean;
  onChange: () => void;
  label: ReactNode;
  count?: number;
}) {
  return (
    <label
      className={cn(
        "flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-1.5 py-2.5 transition-colors",
        "tap-highlight-none hover:bg-brand-50/70",
      )}
    >
      <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
      <span
        aria-hidden
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-md border transition-all duration-200",
          "peer-focus-visible:ring-4 peer-focus-visible:ring-brand-600/20",
          checked
            ? "border-brand-700 gradient-brand text-white"
            : "border-ink-300 bg-white text-transparent",
        )}
      >
        <CheckIcon className="size-3.5" strokeWidth={3} />
      </span>
      <span className="flex-1 text-sm text-ink-700">{label}</span>
      {typeof count === "number" ? (
        <span className="font-mono text-[0.6875rem] text-ink-400">{count}</span>
      ) : null}
    </label>
  );
}

const STEP = 500;
const COMMIT_DELAY = 220;

function PriceRange({
  min,
  max,
  onChange,
}: {
  min: number;
  max: number;
  onChange: (min: number, max: number) => void;
}) {
  const [localMin, setLocalMin] = useState(min);
  const [localMax, setLocalMax] = useState(max);
  const timer = useRef<number | null>(null);

  // Adjust the dragged values during render when the committed range changes
  // externally (filters cleared, or restored from the URL on back/forward).
  const [committed, setCommitted] = useState({ min, max });
  if (committed.min !== min || committed.max !== max) {
    setCommitted({ min, max });
    setLocalMin(min);
    setLocalMax(max);
  }

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  /**
   * Committing on `pointerup` alone loses the drag whenever the finger leaves
   * the slider before releasing — which is most drags on a phone. Every change
   * schedules a commit instead, and pointer/key release just commits early.
   */
  const commit = (nextMin: number, nextMax: number) => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
    if (nextMin === committed.min && nextMax === committed.max) return;
    setCommitted({ min: nextMin, max: nextMax });
    onChange(nextMin, nextMax);
  };

  const schedule = (nextMin: number, nextMax: number) => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => commit(nextMin, nextMax), COMMIT_DELAY);
  };

  const commitNow = () => commit(localMin, localMax);

  const span = priceBounds.max - priceBounds.min;
  const leftPct = ((localMin - priceBounds.min) / span) * 100;
  const rightPct = ((localMax - priceBounds.min) / span) * 100;
  const isDefault = localMin === defaultFilters.minPrice && localMax === defaultFilters.maxPrice;

  const reset = () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
    setLocalMin(defaultFilters.minPrice);
    setLocalMax(defaultFilters.maxPrice);
    setCommitted({ min: defaultFilters.minPrice, max: defaultFilters.maxPrice });
    onChange(defaultFilters.minPrice, defaultFilters.maxPrice);
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <span className="rounded-lg bg-surface-sunken px-2.5 py-1.5 font-mono text-xs font-medium text-ink-700">
          {formatPriceCompact(localMin)}
        </span>
        <span className="text-xs text-ink-400">to</span>
        <span className="rounded-lg bg-surface-sunken px-2.5 py-1.5 font-mono text-xs font-medium text-ink-700">
          {formatPriceCompact(localMax)}
        </span>
      </div>

      <div className="relative h-8">
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-ink-200" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full gradient-brand"
          style={{ left: `${leftPct}%`, right: `${100 - rightPct}%` }}
        />
        <input
          type="range"
          aria-label="Minimum price"
          min={priceBounds.min}
          max={priceBounds.max}
          step={STEP}
          value={localMin}
          onChange={(e) => {
            const next = Math.min(Number(e.target.value), localMax - STEP);
            setLocalMin(next);
            schedule(next, localMax);
          }}
          onPointerUp={commitNow}
          onKeyUp={commitNow}
          onBlur={commitNow}
          // Raised above the max thumb once the two get close, otherwise the
          // upper input swallows the pointer and the min thumb can't be moved.
          style={{ zIndex: leftPct > 55 ? 4 : 3 }}
          className="range-thumb absolute inset-x-0 top-0 h-8 w-full appearance-none bg-transparent"
        />
        <input
          type="range"
          aria-label="Maximum price"
          min={priceBounds.min}
          max={priceBounds.max}
          step={STEP}
          value={localMax}
          onChange={(e) => {
            const next = Math.max(Number(e.target.value), localMin + STEP);
            setLocalMax(next);
            schedule(localMin, next);
          }}
          onPointerUp={commitNow}
          onKeyUp={commitNow}
          onBlur={commitNow}
          className="range-thumb absolute inset-x-0 top-0 z-3 h-8 w-full appearance-none bg-transparent"
        />
      </div>

      {!isDefault ? (
        <button
          type="button"
          onClick={reset}
          className="mt-2 min-h-9 text-xs font-medium text-brand-700 underline-offset-2 hover:underline"
        >
          Reset price range
        </button>
      ) : (
        <p className="mt-2 text-xs text-ink-400">
          Enquiry-only drones are hidden when this range is narrowed.
        </p>
      )}

      <style>{`
        .range-thumb {
          pointer-events: none;
          /* Stops a drag from scrolling the filter sheet underneath. */
          touch-action: none;
        }
        .range-thumb::-webkit-slider-thumb {
          pointer-events: auto;
          appearance: none;
          height: 24px;
          width: 24px;
          border-radius: 9999px;
          background: #fff;
          border: 3px solid var(--color-brand-700);
          box-shadow: 0 2px 8px rgb(16 17 22 / 0.2);
          cursor: grab;
        }
        .range-thumb::-webkit-slider-thumb:active { cursor: grabbing; }
        .range-thumb::-moz-range-thumb {
          pointer-events: auto;
          height: 24px;
          width: 24px;
          border-radius: 9999px;
          background: #fff;
          border: 3px solid var(--color-brand-700);
          box-shadow: 0 2px 8px rgb(16 17 22 / 0.2);
          cursor: grab;
        }
      `}</style>
    </div>
  );
}
