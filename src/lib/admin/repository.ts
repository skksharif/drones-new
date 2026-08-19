import { revalidatePath } from "next/cache";
import { COLLECTIONS, getDb } from "@/lib/db";
import type { BannerDef, Product } from "@/lib/types";
import { requireDatabase } from "./guard";

/**
 * Every catalogue write. Reads stay in `lib/catalogue.ts`.
 *
 * Products and banners only. Categories are read-only throughout the app, so
 * nothing here writes to that collection and no caller can point `reorder()`
 * at it — the `Reorderable` union in `actions.ts` excludes it.
 *
 * The storefront is statically prerendered, so a write is only half the job:
 * each mutation ends in `refresh()`, which invalidates the root layout and
 * with it every page that renders catalogue data — home, category, listing,
 * product, sitemap.
 */

/**
 * One product change can move the home rails, a category page, the listing,
 * the product page and the sitemap, so revalidating the root layout is both
 * the simplest and the only reliably complete answer.
 */
function refresh(): void {
  revalidatePath("/", "layout");
}

/** Appends to the end of the display order. */
async function nextOrder(collection: string): Promise<number> {
  const db = await getDb();
  const last = await db
    .collection(collection)
    .find({}, { projection: { order: 1 } })
    .sort({ order: -1 })
    .limit(1)
    .toArray();
  const highest = last[0]?.order;
  return typeof highest === "number" ? highest + 1 : 0;
}

export async function saveProduct(product: Product, previousSlug?: string): Promise<void> {
  requireDatabase();
  const db = await getDb();
  const products = db.collection<Product>(COLLECTIONS.products);

  const document: Product = {
    ...product,
    order: product.order ?? (await nextOrder(COLLECTIONS.products)),
  };

  if (previousSlug && previousSlug !== product.slug) {
    await products.deleteOne({ slug: previousSlug });
  }

  await products.replaceOne({ slug: product.slug }, document, { upsert: true });
  refresh();
}

export async function deleteProduct(slug: string): Promise<void> {
  requireDatabase();
  const db = await getDb();
  await db.collection<Product>(COLLECTIONS.products).deleteOne({ slug });
  refresh();
}

export async function saveBanner(banner: BannerDef, previousSlug?: string): Promise<void> {
  requireDatabase();
  const db = await getDb();
  const banners = db.collection<BannerDef>(COLLECTIONS.banners);

  const document: BannerDef = {
    ...banner,
    order: banner.order ?? (await nextOrder(COLLECTIONS.banners)),
  };

  if (previousSlug && previousSlug !== banner.slug) {
    await banners.deleteOne({ slug: previousSlug });
  }

  await banners.replaceOne({ slug: banner.slug }, document, { upsert: true });
  refresh();
}

export async function deleteBanner(slug: string): Promise<void> {
  requireDatabase();
  const db = await getDb();
  await db.collection<BannerDef>(COLLECTIONS.banners).deleteOne({ slug });
  refresh();
}

/** Rewrites `order` to match the given slug sequence. */
export async function reorder(
  collection: (typeof COLLECTIONS)[keyof typeof COLLECTIONS],
  slugs: string[],
): Promise<void> {
  requireDatabase();
  const db = await getDb();
  await db.collection(collection).bulkWrite(
    slugs.map((slug, index) => ({
      updateOne: { filter: { slug }, update: { $set: { order: index } } },
    })),
  );
  refresh();
}
