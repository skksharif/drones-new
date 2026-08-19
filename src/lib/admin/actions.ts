"use server";

import { redirect } from "next/navigation";
import { getCatalogue } from "@/lib/catalogue";
import {
  cloudinaryConfigured,
  createUploadTicket,
  destroyImage,
  type UploadTicket,
} from "@/lib/cloudinary";
import { COLLECTIONS } from "@/lib/db";
import { AdminError, requireDatabase, requireSession } from "./guard";
import { deleteBanner, deleteProduct, reorder, saveBanner, saveProduct } from "./repository";
import { parseBannerForm, parseProductForm, type FieldErrors } from "./validate";

/**
 * Catalogue mutations.
 *
 * Every one of them starts with `requireSession()`. Server actions are POST
 * endpoints with a public id, so the layout guard around the admin pages does
 * not protect them — only this does.
 */

/**
 * The collections whose display order the admin can rearrange.
 *
 * Categories are not among them: their order is part of the fixed shape of
 * the shop, not editable content.
 */
export type Reorderable = "products" | "banners";

export interface SaveState {
  errors?: FieldErrors;
  message?: string;
  /**
   * Everything that was submitted, echoed back.
   *
   * React resets a form once its action resolves, so without this a single
   * bad field would wipe everything else the editor had typed. The forms
   * re-seed their defaults from here and remount on {@link SaveState.attempt}.
   */
  values?: Record<string, string>;
  /** Bumped on every failed submit, purely to force that remount. */
  attempt?: number;
}

/** File entries are dropped: only the text fields need re-seeding. */
function echo(form: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [key, value] of form.entries()) {
    if (typeof value === "string") values[key] = value;
  }
  return values;
}

function rejected(prev: SaveState, form: FormData, errors: FieldErrors): SaveState {
  return {
    errors,
    message: "Check the highlighted fields.",
    values: echo(form),
    attempt: (prev.attempt ?? 0) + 1,
  };
}

function failure(error: unknown, prev: SaveState, form: FormData): SaveState {
  if (error instanceof AdminError) {
    return { message: error.message, values: echo(form), attempt: (prev.attempt ?? 0) + 1 };
  }
  throw error;
}

export async function saveProductAction(prev: SaveState, form: FormData): Promise<SaveState> {
  await requireSession();

  const previousSlug = String(form.get("previousSlug") ?? "") || undefined;
  const { products, categories } = await getCatalogue();
  const existing = previousSlug ? products.find((p) => p.slug === previousSlug) : undefined;

  const parsed = parseProductForm(form, {
    categories,
    takenSlugs: new Set(products.filter((p) => p.slug !== previousSlug).map((p) => p.slug)),
    existing,
  });

  if (!parsed.ok) return rejected(prev, form, parsed.errors);

  try {
    requireDatabase();
    await saveProduct(parsed.value, previousSlug);
  } catch (error) {
    return failure(error, prev, form);
  }

  redirect(`/admin/products?saved=${encodeURIComponent(parsed.value.slug)}`);
}

export async function deleteProductAction(form: FormData): Promise<void> {
  await requireSession();
  const slug = String(form.get("slug") ?? "");
  if (!slug) return;

  try {
    await deleteProduct(slug);
  } catch (error) {
    // Read-only mode is a refusal, not a crash: say so on the page they came
    // from rather than throwing them into the error boundary.
    if (error instanceof AdminError) {
      redirect(`/admin/products/${slug}?error=${encodeURIComponent(error.message)}`);
    }
    throw error;
  }

  redirect(`/admin/products?deleted=${encodeURIComponent(slug)}`);
}

/** Moves one entry up or down the display order. */
export async function moveAction(form: FormData): Promise<void> {
  await requireSession();

  // A server action is a POST endpoint with a public id, so the `kind` that
  // arrives is whatever the caller chose to send. Anything but these two —
  // `categories` above all — is refused here rather than defaulted.
  const raw = String(form.get("kind") ?? "");
  if (raw !== "products" && raw !== "banners") return;
  const kind: Reorderable = raw;

  const slug = String(form.get("slug") ?? "");
  const delta = form.get("direction") === "up" ? -1 : 1;

  const catalogue = await getCatalogue();
  const slugs = catalogue[kind].map((row) => row.slug);

  const index = slugs.indexOf(slug);
  const target = index + delta;
  if (index === -1 || target < 0 || target >= slugs.length) return;

  [slugs[index], slugs[target]] = [slugs[target], slugs[index]];

  try {
    await reorder(COLLECTIONS[kind], slugs);
  } catch (error) {
    if (error instanceof AdminError) {
      redirect(`/admin/${kind}?error=${encodeURIComponent(error.message)}`);
    }
    throw error;
  }
}

export async function saveBannerAction(prev: SaveState, form: FormData): Promise<SaveState> {
  await requireSession();

  const previousSlug = String(form.get("previousSlug") ?? "") || undefined;
  const { banners } = await getCatalogue();
  const existing = previousSlug ? banners.find((b) => b.slug === previousSlug) : undefined;

  const parsed = parseBannerForm(form, {
    takenSlugs: new Set(banners.filter((b) => b.slug !== previousSlug).map((b) => b.slug)),
    existing,
  });

  if (!parsed.ok) return rejected(prev, form, parsed.errors);

  try {
    requireDatabase();
    await saveBanner(parsed.value, previousSlug);
  } catch (error) {
    return failure(error, prev, form);
  }

  redirect(`/admin/banners?saved=${encodeURIComponent(parsed.value.slug)}`);
}

export async function deleteBannerAction(form: FormData): Promise<void> {
  await requireSession();
  const slug = String(form.get("slug") ?? "");
  if (!slug) return;

  try {
    await deleteBanner(slug);
  } catch (error) {
    if (error instanceof AdminError) {
      redirect(`/admin/banners/${slug}?error=${encodeURIComponent(error.message)}`);
    }
    throw error;
  }

  redirect(`/admin/banners?deleted=${encodeURIComponent(slug)}`);
}

/**
 * Hands the browser a signed ticket so it can upload straight to Cloudinary.
 *
 * Signed rather than unsigned: an unsigned preset is a public write endpoint
 * for anyone who reads the page source. This one needs a live admin session.
 */
export async function createUploadTicketAction(): Promise<
  { ok: true; ticket: UploadTicket } | { ok: false; message: string }
> {
  await requireSession();
  if (!cloudinaryConfigured()) {
    return {
      ok: false,
      message:
        "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.",
    };
  }
  return { ok: true, ticket: createUploadTicket() };
}

/** Removes an uploaded asset. Local `/images/...` paths are left alone. */
export async function destroyImageAction(url: string): Promise<boolean> {
  await requireSession();
  return destroyImage(url);
}
