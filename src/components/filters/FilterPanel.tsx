"use client";

import { useState, type ReactNode } from "react";
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
import { priceBounds, products } from "@/lib/products";
import type { Availability, ProductGroup } from "@/lib/types";
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
}: FilterPanelProps) {
  const types = availableTypes(filters.categories);

  return (
    <div className="space-y-7">
      <Group label="Product type">
        <div className="flex flex-wrap gap-2">
          {GROUP_OPTIONS.map((option) => (
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

      {!hideCategories ? (
        <Group label="Category">
          <ul className="space-y-0.5">
            {categories.map((category) => {
              const count = products.filter((p) => p.category === category.slug).length;
              return (
                <li key={category.slug}>
                  <CheckboxRow
                    checked={filters.categories.includes(category.slug)}
                    onChange={() => onToggleCategory(category.slug)}
                    label={category.name}
                    count={count}
                  />
                </li>
              );
            })}
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
        <PriceRange
          min={filters.minPrice}
          max={filters.maxPrice}
          onChange={onPriceChange}
        />
      </Group>

      <Group label="Availability">
        <ul className="space-y-0.5">
          {AVAILABILITY_OPTIONS.map((option) => (
            <li key={option.value}>
              <CheckboxRow
                checked={filters.availability.includes(option.value)}
                onChange={() => onToggleAvailability(option.value)}
                label={option.label}
                count={products.filter((p) => p.availability === option.value).length}
              />
            </li>
          ))}
        </ul>
      </Group>

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
          count={products.filter((p) => p.featured).length}
        />
      </Group>
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
        "rounded-full border px-3.5 py-2 text-xs font-medium transition-all duration-200",
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
        "flex cursor-pointer items-center gap-3 rounded-lg px-1.5 py-2.5 transition-colors",
        "hover:bg-brand-50/70",
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
      />
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

  // Adjust the dragged values during render when the committed range changes
  // externally (filters cleared, or restored from the URL on back/forward).
  const [committed, setCommitted] = useState({ min, max });
  if (committed.min !== min || committed.max !== max) {
    setCommitted({ min, max });
    setLocalMin(min);
    setLocalMax(max);
  }

  const span = priceBounds.max - priceBounds.min;
  const leftPct = ((localMin - priceBounds.min) / span) * 100;
  const rightPct = ((localMax - priceBounds.min) / span) * 100;
  const isDefault =
    localMin === defaultFilters.minPrice && localMax === defaultFilters.maxPrice;

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

      <div className="relative h-6">
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
          onChange={(e) => setLocalMin(Math.min(Number(e.target.value), localMax - STEP))}
          onPointerUp={() => onChange(localMin, localMax)}
          onKeyUp={() => onChange(localMin, localMax)}
          className="range-thumb absolute inset-x-0 top-0 h-6 w-full appearance-none bg-transparent"
        />
        <input
          type="range"
          aria-label="Maximum price"
          min={priceBounds.min}
          max={priceBounds.max}
          step={STEP}
          value={localMax}
          onChange={(e) => setLocalMax(Math.max(Number(e.target.value), localMin + STEP))}
          onPointerUp={() => onChange(localMin, localMax)}
          onKeyUp={() => onChange(localMin, localMax)}
          className="range-thumb absolute inset-x-0 top-0 h-6 w-full appearance-none bg-transparent"
        />
      </div>

      {!isDefault ? (
        <button
          type="button"
          onClick={() => {
            setLocalMin(defaultFilters.minPrice);
            setLocalMax(defaultFilters.maxPrice);
            onChange(defaultFilters.minPrice, defaultFilters.maxPrice);
          }}
          className="mt-3 text-xs font-medium text-brand-700 underline-offset-2 hover:underline"
        >
          Reset price range
        </button>
      ) : (
        <p className="mt-3 text-xs text-ink-400">
          Enquiry-only drones are hidden when this range is narrowed.
        </p>
      )}

      <style>{`
        .range-thumb { pointer-events: none; }
        .range-thumb::-webkit-slider-thumb {
          pointer-events: auto;
          appearance: none;
          height: 22px;
          width: 22px;
          border-radius: 9999px;
          background: #fff;
          border: 3px solid var(--color-brand-700);
          box-shadow: 0 2px 8px rgb(16 17 22 / 0.2);
          cursor: grab;
        }
        .range-thumb::-webkit-slider-thumb:active { cursor: grabbing; }
        .range-thumb::-moz-range-thumb {
          pointer-events: auto;
          height: 22px;
          width: 22px;
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
