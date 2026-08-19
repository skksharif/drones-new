import { MongoClient, type Db } from "mongodb";

/**
 * MongoDB connection, server-side only.
 *
 * Serverless invocations reuse a warm process, so the client is cached on
 * `globalThis` rather than created per request — a new connection per request
 * exhausts Atlas' connection limit quickly, and the free tier's limit is low.
 * The same cache keeps dev from leaking a client on every hot reload.
 */

const globalForMongo = globalThis as unknown as {
  _mongoClientPromise?: Promise<MongoClient>;
};

/** True when a cluster is configured. Without one the app reads the seed file. */
export function hasDatabase(): boolean {
  return Boolean(process.env.MONGODB_URI);
}

export function getClient(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. Check hasDatabase() before calling getClient().",
    );
  }

  if (!globalForMongo._mongoClientPromise) {
    globalForMongo._mongoClientPromise = new MongoClient(uri, {
      // Atlas' shared tier is slow to wake; fail with a clear error rather than
      // hanging a page render for the driver's 30s default.
      serverSelectionTimeoutMS: 10_000,
    }).connect();
  }

  return globalForMongo._mongoClientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getClient();
  return client.db(process.env.MONGODB_DB ?? "agrosky");
}

export const COLLECTIONS = {
  products: "products",
  categories: "categories",
  banners: "banners",
} as const;
