import { products as allProducts, priceBounds } from "./products";
import type { Availability, Product, ProductGroup } from "./types";

export const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export const AVAILABILITY_OPTIONS: { value: Availability; label: string }[] = [
  { value: "in-stock", label: "In stock" },
  { value: "low-stock", label: "Low stock" },
  { value: "made-to-order", label: "Made to order" },
];

export const GROUP_OPTIONS: { value: ProductGroup; label: string }[] = [
  { value: "drone", label: "Drones" },
  { value: "part", label: "Parts & Accessories" },
];

export interface FilterState {
  q: string;
  categories: string[];
  types: string[];
  groups: ProductGroup[];
  availability: Availability[];
  minPrice: number;
  maxPrice: number;
  featuredOnly: boolean;
  sort: SortValue;
}

export const defaultFilters: FilterState = {
  q: "",
  categories: [],
  types: [],
  groups: [],
  availability: [],
  minPrice: priceBounds.min,
  maxPrice: priceBounds.max,
  featuredOnly: false,
  sort: "relevance",
};

export function isDefaultFilters(f: FilterState): boolean {
  return (
    f.q.trim() === "" &&
    f.categories.length === 0 &&
    f.types.length === 0 &&
    f.groups.length === 0 &&
    f.availability.length === 0 &&
    f.minPrice === defaultFilters.minPrice &&
    f.maxPrice === defaultFilters.maxPrice &&
    !f.featuredOnly
  );
}

/**
 * Number of active facets shown on the "Filters" badge. The search term is
 * deliberately excluded — it lives in its own field, not in the filter panel.
 */
export function activeFilterCount(f: FilterState): number {
  let n = 0;
  n += f.categories.length + f.types.length + f.groups.length + f.availability.length;
  if (f.minPrice !== defaultFilters.minPrice || f.maxPrice !== defaultFilters.maxPrice) n += 1;
  if (f.featuredOnly) n += 1;
  return n;
}

function normalise(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

/**
 * Scores a product against a search query. Returns 0 when there is no match, so
 * callers can both filter and rank with a single pass.
 */
export function scoreProduct(product: Product, query: string): number {
  const q = normalise(query);
  if (!q) return 1;

  const terms = q.split(" ").filter(Boolean);
  const name = normalise(product.name);
  const haystack = normalise(
    [
      product.name,
      product.shortName,
      product.brand,
      product.type,
      product.summary,
      product.tags.join(" "),
      product.specs.map((s) => s.value).join(" "),
    ].join(" "),
  );

  let score = 0;
  for (const term of terms) {
    if (name.startsWith(term)) score += 12;
    else if (name.includes(term)) score += 8;
    else if (normalise(product.brand).includes(term)) score += 5;
    else if (product.tags.some((t) => normalise(t).includes(term))) score += 4;
    else if (haystack.includes(term)) score += 2;
    else return 0; // every term must match somewhere
  }

  if (product.featured) score += 1;
  if (product.bestseller) score += 1;
  return score;
}

function matchesPrice(product: Product, min: number, max: number): boolean {
  // Enquiry-only products have no price and are only excluded when the range is narrowed.
  if (product.price === null) {
    return min === priceBounds.min && max === priceBounds.max;
  }
  return product.price >= min && product.price <= max;
}

export interface FilterResult {
  items: Product[];
  total: number;
}

export function filterProducts(
  filters: FilterState,
  source: Product[] = allProducts,
): FilterResult {
  const scored: { product: Product; score: number }[] = [];

  for (const product of source) {
    if (filters.categories.length && !filters.categories.includes(product.category)) continue;
    if (filters.types.length && !filters.types.includes(product.type)) continue;
    if (filters.groups.length && !filters.groups.includes(product.group)) continue;
    if (filters.availability.length && !filters.availability.includes(product.availability)) continue;
    if (filters.featuredOnly && !product.featured) continue;
    if (!matchesPrice(product, filters.minPrice, filters.maxPrice)) continue;

    const score = scoreProduct(product, filters.q);
    if (score === 0) continue;

    scored.push({ product, score });
  }

  scored.sort((a, b) => {
    switch (filters.sort) {
      case "newest":
        return b.product.addedAt.localeCompare(a.product.addedAt);
      case "price-asc":
        return priceKey(a.product) - priceKey(b.product);
      case "price-desc":
        return priceKey(b.product, true) - priceKey(a.product, true);
      case "name-asc":
        return a.product.name.localeCompare(b.product.name);
      case "relevance":
      default:
        if (b.score !== a.score) return b.score - a.score;
        return b.product.addedAt.localeCompare(a.product.addedAt);
    }
  });

  const items = scored.map((s) => s.product);
  return { items, total: items.length };
}

/** Enquiry-only products sort to the end of both price orders. */
function priceKey(product: Product, descending = false): number {
  if (product.price !== null) return product.price;
  return descending ? -Infinity : Infinity;
}

/** Subcategory options available given the currently selected categories. */
export function availableTypes(categorySlugs: string[], source: Product[] = allProducts): string[] {
  const pool = categorySlugs.length
    ? source.filter((p) => categorySlugs.includes(p.category))
    : source;
  return [...new Set(pool.map((p) => p.type))].sort((a, b) => a.localeCompare(b));
}
