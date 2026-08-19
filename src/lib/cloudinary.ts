import { createHash } from "node:crypto";

/**
 * Cloudinary uploads, signed server-side.
 *
 * The browser uploads straight to Cloudinary rather than posting the file
 * through a server action: Vercel caps a serverless request body at a few
 * megabytes, and a product photo can exceed it. All the server does is sign
 * the parameters, so `CLOUDINARY_API_SECRET` never leaves it.
 *
 *   CLOUDINARY_CLOUD_NAME
 *   CLOUDINARY_API_KEY
 *   CLOUDINARY_API_SECRET
 */

export const CLOUDINARY_FOLDER = "agrosky/products";

export function cloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

export interface UploadTicket {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
}

/**
 * Cloudinary's scheme: every signed parameter except `file`, `api_key` and
 * `resource_type`, sorted by key, joined as a querystring, with the API secret
 * appended, then SHA-1.
 */
function sign(params: Record<string, string | number>, secret: string): string {
  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return createHash("sha1")
    .update(payload + secret)
    .digest("hex");
}

/** A short-lived permission slip for one upload. */
export function createUploadTicket(): UploadTicket {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary is not configured.");
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = CLOUDINARY_FOLDER;

  return {
    cloudName,
    apiKey,
    timestamp,
    folder,
    signature: sign({ folder, timestamp }, apiSecret),
  };
}

/**
 * Recovers the public id from a delivery URL, so an image can be removed from
 * Cloudinary without storing a second field alongside every URL.
 *
 * Returns null for anything that is not a Cloudinary upload URL — local
 * `/images/...` paths from the seed catalogue land here too.
 */
export function publicIdFromUrl(url: string): string | null {
  const match = /\/upload\/(?:[^/]+\/)*?(?:v\d+\/)?(.+)$/.exec(url);
  if (!url.includes("res.cloudinary.com") || !match) return null;
  return match[1].replace(/\.[a-z0-9]+$/i, "");
}

/** Best-effort removal. A failure here must never block saving the product. */
export async function destroyImage(url: string): Promise<boolean> {
  const publicId = publicIdFromUrl(url);
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!publicId || !cloudName || !apiKey || !apiSecret) return false;

  const timestamp = Math.floor(Date.now() / 1000);
  const body = new URLSearchParams({
    public_id: publicId,
    timestamp: String(timestamp),
    api_key: apiKey,
    signature: sign({ public_id: publicId, timestamp }, apiSecret),
  });

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: "POST",
      body,
    });
    return response.ok;
  } catch {
    return false;
  }
}
