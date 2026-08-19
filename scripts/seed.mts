/**
 * Seeds MongoDB from the committed catalogue JSON.
 *
 *   npm run seed          — only fills empty collections, safe to re-run
 *   npm run seed -- --force — replaces everything, discarding admin edits
 *
 * The JSON in `data/` is the reference copy: it is what the site falls back to
 * when no cluster is configured, and what a fresh database starts from.
 */

import { readFileSync } from "node:fs";
import { MongoClient } from "mongodb";

interface Seedable {
  slug: string;
  order?: number;
}

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error(
    "MONGODB_URI is not set.\n" +
      "Add it to .env.local, then run: npm run seed",
  );
  process.exit(1);
}

const force = process.argv.includes("--force");
const dbName = process.env.MONGODB_DB ?? "agrosky";

function read<T extends Seedable>(file: string): T[] {
  const rows = JSON.parse(readFileSync(new URL(`../data/${file}`, import.meta.url), "utf8"));
  // Array position drove display order while the catalogue lived in source;
  // persist it so document order in the database cannot change the site.
  return rows.map((row: T, index: number) => ({ ...row, order: index }));
}

const client = new MongoClient(uri);

try {
  await client.connect();
  const db = client.db(dbName);
  console.log(`Connected to "${dbName}".`);

  for (const [name, file] of [
    ["products", "products.json"],
    ["categories", "categories.json"],
    ["banners", "banners.json"],
  ] as const) {
    const collection = db.collection(name);
    const existing = await collection.countDocuments();

    if (existing > 0 && !force) {
      console.log(`- ${name}: ${existing} documents already present, skipped.`);
      continue;
    }

    const rows = read(file);
    if (existing > 0) {
      await collection.deleteMany({});
      console.log(`- ${name}: cleared ${existing} documents (--force).`);
    }

    if (rows.length > 0) await collection.insertMany(rows);
    await collection.createIndex({ slug: 1 }, { unique: true });
    await collection.createIndex({ order: 1 });
    console.log(`- ${name}: inserted ${rows.length} documents.`);
  }

  console.log("\nDone. Restart the dev server to read from the database.");
} catch (error) {
  console.error("\nSeeding failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await client.close();
}
