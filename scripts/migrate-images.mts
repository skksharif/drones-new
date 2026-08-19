/**
 * Moves the catalogue's local `/images/...` files to Cloudinary and rewrites
 * the stored paths to delivery URLs.
 *
 *   npm run migrate:images            — dry run, writes nothing
 *   npm run migrate:images -- --apply — uploads and rewrites the database
 *   npm run migrate:images -- --rollback <backup.json>
 *
 * Safe to re-run. Public ids are derived from the file path, so a second run
 * overwrites the same Cloudinary asset instead of creating a duplicate, and
 * anything already pointing at res.cloudinary.com is left alone.
 *
 * Every applied run writes `scripts/backups/images-<timestamp>.json` holding
 * the previous value of every field it touched — that file is the rollback.
 */

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, extname } from "node:path";
import { MongoClient, type Db } from "mongodb";

const apply = process.argv.includes("--apply");
const rollbackAt = process.argv.indexOf("--rollback");
const rollbackFile = rollbackAt === -1 ? null : process.argv[rollbackAt + 1];

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? "agrosky";
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!uri) {
  console.error("MONGODB_URI is not set. Add it to .env.local.");
  process.exit(1);
}
if (!rollbackFile && (!cloudName || !apiKey || !apiSecret)) {
  console.error("CLOUDINARY_CLOUD_NAME / _API_KEY / _API_SECRET are not all set.");
  process.exit(1);
}

/** Cloudinary's scheme — mirrors `sign()` in `src/lib/cloudinary.ts`. */
function sign(params: Record<string, string | number>, secret: string): string {
  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return createHash("sha1")
    .update(payload + secret)
    .digest("hex");
}

const isLocal = (value: string) => value.startsWith("/images/");

/**
 * `/images/products/p4.jpg` → `agrosky/images/products/p4`.
 *
 * Deterministic, so re-running overwrites rather than duplicating, and the
 * Cloudinary media library keeps the folder shape the repo had.
 */
function publicIdFor(path: string): string {
  const withoutExt = path.slice(1, path.length - extname(path).length);
  return `agrosky/${withoutExt}`;
}

async function upload(path: string): Promise<string> {
  const file = new URL(`../public${path}`, import.meta.url);
  const bytes = readFileSync(file);

  const publicId = publicIdFor(path);
  const timestamp = Math.floor(Date.now() / 1000);
  const signed = { overwrite: "true", public_id: publicId, timestamp };

  const form = new FormData();
  form.set("file", new Blob([new Uint8Array(bytes)]), basename(path));
  form.set("public_id", publicId);
  form.set("overwrite", "true");
  form.set("timestamp", String(timestamp));
  form.set("api_key", apiKey!);
  form.set("signature", sign(signed, apiSecret!));

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: form,
  });
  const json = (await response.json()) as { secure_url?: string; error?: { message: string } };
  if (!response.ok || !json.secure_url) {
    throw new Error(`${path}: ${json.error?.message ?? response.statusText}`);
  }
  return json.secure_url;
}

interface Touched {
  collection: string;
  slug: string;
  field: string;
  from: string | string[];
  to: string | string[];
}

async function migrate(db: Db) {
  const products = await db.collection("products").find({}).toArray();
  const categories = await db.collection("categories").find({}).toArray();
  const banners = await db.collection("banners").find({}).toArray();

  // Every distinct local path in the catalogue, in one pass, so a file shared
  // by two products uploads once.
  const paths = new Set<string>();
  const collect = (value: unknown) => {
    if (typeof value === "string" && isLocal(value)) paths.add(value);
    if (Array.isArray(value)) value.forEach(collect);
  };
  for (const p of products) collect([p.image, p.gallery]);
  for (const c of categories) collect(c.image);
  for (const b of banners) collect(b.image);

  const already =
    products.filter((p) => typeof p.image === "string" && !isLocal(p.image)).length +
    categories.filter((c) => typeof c.image === "string" && !isLocal(c.image)).length;

  console.log(`products=${products.length} categories=${categories.length} banners=${banners.length}`);
  console.log(`local files to upload: ${paths.size}   already remote: ${already}\n`);

  if (paths.size === 0) {
    console.log("Nothing to migrate.");
    return;
  }

  if (!apply) {
    for (const path of [...paths].sort()) {
      console.log(`  ${path}\n    -> https://res.cloudinary.com/${cloudName}/image/upload/${publicIdFor(path)}`);
    }
    console.log(`\nDry run. Re-run with --apply to upload and rewrite the database.`);
    return;
  }

  const map = new Map<string, string>();
  let done = 0;
  for (const path of [...paths].sort()) {
    const url = await upload(path);
    map.set(path, url);
    done += 1;
    console.log(`  [${String(done).padStart(2)}/${paths.size}] ${path}`);
  }

  const swap = (value: string) => map.get(value) ?? value;
  const touched: Touched[] = [];

  for (const product of products) {
    const update: Record<string, unknown> = {};
    if (typeof product.image === "string" && isLocal(product.image)) {
      touched.push({
        collection: "products",
        slug: product.slug,
        field: "image",
        from: product.image,
        to: swap(product.image),
      });
      update.image = swap(product.image);
    }
    if (Array.isArray(product.gallery) && product.gallery.some(isLocal)) {
      const next = product.gallery.map(swap);
      touched.push({
        collection: "products",
        slug: product.slug,
        field: "gallery",
        from: product.gallery,
        to: next,
      });
      update.gallery = next;
    }
    if (Object.keys(update).length > 0) {
      await db.collection("products").updateOne({ slug: product.slug }, { $set: update });
    }
  }

  for (const [name, rows] of [
    ["categories", categories],
    ["banners", banners],
  ] as const) {
    for (const row of rows) {
      if (typeof row.image !== "string" || !isLocal(row.image)) continue;
      touched.push({
        collection: name,
        slug: row.slug,
        field: "image",
        from: row.image,
        to: swap(row.image),
      });
      await db.collection(name).updateOne({ slug: row.slug }, { $set: { image: swap(row.image) } });
    }
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = new URL("./backups/", import.meta.url);
  mkdirSync(backupDir, { recursive: true });
  const backup = new URL(`./images-${stamp}.json`, backupDir);
  writeFileSync(backup, JSON.stringify({ db: dbName, touched }, null, 2), "utf8");

  console.log(`\nRewrote ${touched.length} fields across ${new Set(touched.map((t) => t.collection)).size} collections.`);
  console.log(`Rollback file: scripts/backups/images-${stamp}.json`);
}

async function rollback(db: Db, file: string) {
  const { touched } = JSON.parse(readFileSync(file, "utf8")) as { touched: Touched[] };
  for (const entry of touched) {
    await db
      .collection(entry.collection)
      .updateOne({ slug: entry.slug }, { $set: { [entry.field]: entry.from } });
  }
  console.log(`Restored ${touched.length} fields from ${basename(file)}.`);
  console.log("The Cloudinary assets are left in place; delete them by hand if you want them gone.");
}

const client = new MongoClient(uri);
try {
  await client.connect();
  const db = client.db(dbName);
  console.log(`Connected to "${dbName}".${apply || rollbackFile ? "" : "  (dry run)"}\n`);
  if (rollbackFile) await rollback(db, rollbackFile);
  else await migrate(db);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await client.close();
}
