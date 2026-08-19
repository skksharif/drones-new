import type { CategoryDef } from "./types";

/**
 * Category selectors. Like the product selectors, these take the list to work
 * on rather than closing over a module-level array — the catalogue is loaded
 * per request on the server and held in context in the browser.
 */

export function findCategory(
  categories: CategoryDef[],
  slug: string,
): CategoryDef | undefined {
  return categories.find((category) => category.slug === slug);
}

export function categoryName(categories: CategoryDef[], slug: string): string {
  return findCategory(categories, slug)?.name ?? slug;
}

export function categoryShortName(categories: CategoryDef[], slug: string): string {
  return findCategory(categories, slug)?.short ?? slug;
}

/**
 * Categories that actually have something to sell. Empty ones still exist —
 * they carry the chip and the landing page — but sections and rails built from
 * products skip them.
 */
export function stockedCategories<T extends { category: string }>(
  categories: CategoryDef[],
  products: T[],
): CategoryDef[] {
  return categories.filter((category) =>
    products.some((product) => product.category === category.slug),
  );
}
