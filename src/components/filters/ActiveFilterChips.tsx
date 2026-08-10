"use client";

import { CloseIcon } from "@/components/ui/Icons";
import { categoryName } from "@/lib/categories";
import { AVAILABILITY_OPTIONS, GROUP_OPTIONS, defaultFilters, type FilterState } from "@/lib/filters";
import { formatPriceCompact } from "@/lib/format";
import type { Availability, ProductGroup } from "@/lib/types";

interface Props {
  filters: FilterState;
  onToggleCategory: (slug: string) => void;
  onToggleType: (type: string) => void;
  onToggleGroup: (group: ProductGroup) => void;
  onToggleAvailability: (value: Availability) => void;
  onPriceChange: (min: number, max: number) => void;
  onFeaturedChange: (value: boolean) => void;
  onClearSearch: () => void;
  onClearAll: () => void;
  hideCategories?: boolean;
}

export function ActiveFilterChips({
  filters,
  onToggleCategory,
  onToggleType,
  onToggleGroup,
  onToggleAvailability,
  onPriceChange,
  onFeaturedChange,
  onClearSearch,
  onClearAll,
  hideCategories = false,
}: Props) {
  const chips: { key: string; label: string; onRemove: () => void }[] = [];

  if (filters.q.trim()) {
    chips.push({
      key: "q",
      label: `“${filters.q.trim()}”`,
      onRemove: onClearSearch,
    });
  }

  if (!hideCategories) {
    for (const slug of filters.categories) {
      chips.push({
        key: `cat-${slug}`,
        label: categoryName(slug),
        onRemove: () => onToggleCategory(slug),
      });
    }
  }

  for (const type of filters.types) {
    chips.push({ key: `type-${type}`, label: type, onRemove: () => onToggleType(type) });
  }

  for (const group of filters.groups) {
    chips.push({
      key: `group-${group}`,
      label: GROUP_OPTIONS.find((g) => g.value === group)?.label ?? group,
      onRemove: () => onToggleGroup(group),
    });
  }

  for (const value of filters.availability) {
    chips.push({
      key: `stock-${value}`,
      label: AVAILABILITY_OPTIONS.find((a) => a.value === value)?.label ?? value,
      onRemove: () => onToggleAvailability(value),
    });
  }

  if (
    filters.minPrice !== defaultFilters.minPrice ||
    filters.maxPrice !== defaultFilters.maxPrice
  ) {
    chips.push({
      key: "price",
      label: `${formatPriceCompact(filters.minPrice)} – ${formatPriceCompact(filters.maxPrice)}`,
      onRemove: () => onPriceChange(defaultFilters.minPrice, defaultFilters.maxPrice),
    });
  }

  if (filters.featuredOnly) {
    chips.push({
      key: "featured",
      label: "Featured only",
      onRemove: () => onFeaturedChange(false),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.onRemove}
          className="group inline-flex max-w-full items-center gap-1.5 rounded-full border border-brand-700/25 bg-brand-50 py-1.5 pl-3 pr-2 text-xs font-medium text-brand-800 transition-colors hover:border-brand-700/50 hover:bg-brand-100"
        >
          <span className="truncate">{chip.label}</span>
          <CloseIcon className="size-3.5 shrink-0 opacity-60 transition-opacity group-hover:opacity-100" />
          <span className="sr-only">Remove filter</span>
        </button>
      ))}

      <button
        type="button"
        onClick={onClearAll}
        className="rounded-full px-2.5 py-1.5 text-xs font-semibold text-ink-500 underline-offset-2 transition-colors hover:text-brand-700 hover:underline"
      >
        Clear all
      </button>
    </div>
  );
}
