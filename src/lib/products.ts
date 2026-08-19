import type { Product } from "./types";

/**
 * Catalogue selectors.
 *
 * These used to close over a module-level array of literals. The catalogue now
 * lives in the database, so every selector takes the list it should work on:
 * the server passes the full records, the browser passes the lean ones it holds
 * in context, and the logic is shared by both.
 */

/** Minimum shape each selector needs, so it works on full and lean records alike. */
type Priced = { price: number | null; compareAtPrice?: number };

export function findProduct<T extends { slug: string }>(
  products: T[],
  slug: string,
): T | undefined {
  return products.find((product) => product.slug === slug);
}

export function productsByCategory<T extends { category: string }>(
  products: T[],
  categorySlug: string,
): T[] {
  return products.filter((product) => product.category === categorySlug);
}

export function countByCategory<T extends { category: string }>(
  products: T[],
  categorySlug: string,
): number {
  return productsByCategory(products, categorySlug).length;
}

export function featuredProducts<T extends { featured?: boolean }>(
  products: T[],
  limit = 8,
): T[] {
  return products.filter((product) => product.featured).slice(0, limit);
}

export function bestsellers<T extends { bestseller?: boolean }>(
  products: T[],
  limit = 8,
): T[] {
  return products.filter((product) => product.bestseller).slice(0, limit);
}

/** Related products: same category first, then same group, excluding itself. */
export function relatedProducts(
  products: Product[],
  product: Product,
  limit = 4,
): Product[] {
  const sameCategory = products.filter(
    (p) => p.id !== product.id && p.category === product.category,
  );
  const sameGroup = products.filter(
    (p) => p.id !== product.id && p.category !== product.category && p.group === product.group,
  );
  return [...sameCategory, ...sameGroup].slice(0, limit);
}

export interface PriceBounds {
  min: number;
  max: number;
}

/**
 * Range for the price filter. An empty or wholly enquiry-only catalogue would
 * otherwise produce Infinity from Math.min/max and break the slider, so it
 * falls back to a zero range.
 */
export function computePriceBounds(products: Priced[]): PriceBounds {
  const priced = products
    .map((product) => product.price)
    .filter((price): price is number => price !== null);
  if (priced.length === 0) return { min: 0, max: 0 };
  return { min: Math.min(...priced), max: Math.max(...priced) };
}

/**
 * Slugs of the most recently added products. Cards badge these NEW — a date
 * cutoff would silently empty itself as the catalogue ages.
 */
export function computeNewArrivals<T extends { slug: string; addedAt: string }>(
  products: T[],
  limit = 6,
): Set<string> {
  return new Set(
    [...products]
      .sort((a, b) => b.addedAt.localeCompare(a.addedAt))
      .slice(0, limit)
      .map((product) => product.slug),
  );
}

/** Saving against the struck-through price, rounded, or null when not on offer. */
export function discountPercent(product: Priced): number | null {
  if (product.price === null || !product.compareAtPrice) return null;
  const percent = Math.round((1 - product.price / product.compareAtPrice) * 100);
  return percent > 0 ? percent : null;
}

/**
 * The "Hot Deals" pool. Genuinely discounted products lead, ranked by saving;
 * bestsellers and featured stock fill the rest so the rail is never empty just
 * because nothing happens to be on offer this week.
 */
export function deals<T extends Priced & { bestseller?: boolean; featured?: boolean }>(
  products: T[],
  limit = 10,
): T[] {
  const discounted = products
    .filter((product) => discountPercent(product) !== null)
    .sort((a, b) => (discountPercent(b) ?? 0) - (discountPercent(a) ?? 0));

  const rest = products
    .filter(
      (product) =>
        discountPercent(product) === null &&
        product.price !== null &&
        (product.bestseller || product.featured),
    )
    .sort((a, b) => (a.price ?? 0) - (b.price ?? 0));

  return [...discounted, ...rest].slice(0, limit);
}

/**
 * Sub-type suggestions per category, for the product form.
 *
 * The union of what a category *declares* (`CategoryDef.types`) and what its
 * products *actually use* (`Product.type`). Those two can drift — the declared
 * list is read-only now, while product types stay editable — so offering only
 * one of them would either hide a live sub-type or suggest one nothing uses.
 */
export function subTypesByCategory(
  categories: { slug: string; types: string[] }[],
  products: { category: string; type: string }[],
): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const category of categories) out[category.slug] = [...category.types];
  for (const product of products) {
    const list = (out[product.category] ??= []);
    if (product.type && !list.includes(product.type)) list.push(product.type);
  }
  for (const slug of Object.keys(out)) out[slug].sort((a, b) => a.localeCompare(b));
  return out;
}
