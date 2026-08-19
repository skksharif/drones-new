import { cache } from "react";
import { COLLECTIONS, getDb, hasDatabase } from "./db";
import bannersSeed from "../../data/banners.json";
import categoriesSeed from "../../data/categories.json";
import productsSeed from "../../data/products.json";
import type {
  BannerDef,
  Catalogue,
  CategoryDef,
  ClientCatalogue,
  ClientProduct,
  Product,
} from "./types";

/**
 * Server-side catalogue access.
 *
 * Pages call this and are still statically prerendered — nothing here reads a
 * request — so the site keeps serving static HTML. After an edit the admin
 * panel calls `revalidatePath`, and only the affected pages regenerate.
 *
 * Never import this from a client component: it pulls in the driver and the
 * seed data. Client code reads {@link ClientCatalogue} from the catalogue
 * context instead.
 */

/** Committed JSON, used to seed a new database and to run without one. */
const seed: Catalogue = {
  products: productsSeed as unknown as Product[],
  categories: categoriesSeed as unknown as CategoryDef[],
  banners: bannersSeed as unknown as BannerDef[],
};

/**
 * Reads the catalogue once per request. `cache` dedupes it across every
 * component in a single render, so a page with six product rails still makes
 * one round trip.
 */
export const getCatalogue = cache(async (): Promise<Catalogue> => {
  if (!hasDatabase()) return seed;

  const db = await getDb();
  const [products, categories, banners] = await Promise.all([
    db
      .collection<Product>(COLLECTIONS.products)
      .find({}, { projection: { _id: 0 } })
      .sort({ order: 1 })
      .toArray(),
    db
      .collection<CategoryDef>(COLLECTIONS.categories)
      .find({}, { projection: { _id: 0 } })
      .sort({ order: 1 })
      .toArray(),
    db
      .collection<BannerDef>(COLLECTIONS.banners)
      .find({}, { projection: { _id: 0 } })
      .sort({ order: 1 })
      .toArray(),
  ]);

  // An empty cluster (first deploy, before seeding) must not blank the site.
  // Banners are excluded from the test on purpose: having none is normal.
  if (products.length === 0 && categories.length === 0) return seed;

  return { products, categories, banners };
});

/** Strips the long-form copy the browser never renders. */
export function toClientProduct(product: Product): ClientProduct {
  // Destructure-to-discard is the idiomatic omit; the two names exist only to
  // be dropped from `rest`.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { description, highlights, ...rest } = product;
  return rest;
}

export function toClientCatalogue(catalogue: Catalogue): ClientCatalogue {
  return {
    products: catalogue.products.map(toClientProduct),
    // `icon` is a leftover emoji that nothing renders any more. Dropping it
    // here keeps it out of the RSC payload of every storefront page.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    categories: catalogue.categories.map(({ icon, ...rest }) => rest),
  };
}
