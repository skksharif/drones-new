import type {
  Availability,
  BannerDef,
  CategoryDef,
  Product,
  ProductGroup,
  SpecRow,
} from "@/lib/types";

/**
 * Turns raw form data into a catalogue document, or into a list of field
 * errors. Nothing reaches the database without passing through here — a server
 * action receives whatever the caller chose to POST, not whatever the form
 * happened to render.
 */

export type FieldErrors = Record<string, string>;

export type Parsed<T> = { ok: true; value: T } | { ok: false; errors: FieldErrors };

export const AVAILABILITY: Availability[] = [
  "in-stock",
  "low-stock",
  "made-to-order",
  "out-of-stock",
];

export const AVAILABILITY_LABELS: Record<Availability, string> = {
  "in-stock": "In stock",
  "low-stock": "Low stock",
  "made-to-order": "Made to order",
  "out-of-stock": "Out of stock",
};

export const GROUPS: ProductGroup[] = ["drone", "part"];

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function str(form: FormData, key: string): string {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function bool(form: FormData, key: string): boolean {
  return form.get(key) === "on" || form.get(key) === "true";
}

/** Splits a textarea into trimmed, non-empty lines. */
function lines(form: FormData, key: string): string[] {
  return str(form, key)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

/** Tags arrive as one comma- or newline-separated blob; de-duplicated here. */
export function parseTags(raw: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const tag of raw.split(/[,\n]/)) {
    const clean = tag.trim().replace(/\s+/g, " ");
    if (!clean) continue;
    const key = clean.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(clean);
  }
  return out;
}

/** `label | value` per line — the shape the spec table renders. */
function parseSpecs(raw: string): SpecRow[] {
  const rows: SpecRow[] = [];
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const sep = trimmed.indexOf("|");
    if (sep === -1) continue;
    const label = trimmed.slice(0, sep).trim();
    const value = trimmed.slice(sep + 1).trim();
    if (label && value) rows.push({ label, value });
  }
  return rows;
}

export function serialiseSpecs(specs: SpecRow[]): string {
  return specs.map((row) => `${row.label} | ${row.value}`).join("\n");
}

/**
 * An empty price field means "price on request", which the whole storefront
 * already handles. A malformed one is an error rather than a silent null.
 */
function parsePrice(raw: string, field: string, errors: FieldErrors): number | null {
  if (raw === "") return null;
  const value = Number(raw.replace(/[,\s₹]/g, ""));
  if (!Number.isFinite(value) || value < 0) {
    errors[field] = "Enter a number, or leave blank for “Price on request”.";
    return null;
  }
  return Math.round(value);
}

export interface ProductContext {
  categories: CategoryDef[];
  /** Slugs already in use, excluding the product being edited. */
  takenSlugs: Set<string>;
  /** Set when editing, so the id and creation date survive. */
  existing?: Product;
}

export function parseProductForm(form: FormData, context: ProductContext): Parsed<Product> {
  const errors: FieldErrors = {};

  const name = str(form, "name");
  if (!name) errors.name = "Required.";

  const slug = slugify(str(form, "slug") || name);
  if (!slug) errors.slug = "Required.";
  else if (!SLUG_RE.test(slug)) errors.slug = "Use lowercase letters, numbers and hyphens.";
  else if (context.takenSlugs.has(slug)) errors.slug = "Another product already uses this slug.";

  const category = str(form, "category");
  if (!context.categories.some((c) => c.slug === category)) {
    errors.category = "Pick a category.";
  }

  const groupRaw = str(form, "group");
  const group = (GROUPS as string[]).includes(groupRaw)
    ? (groupRaw as ProductGroup)
    : (context.categories.find((c) => c.slug === category)?.group ?? "part");

  const availabilityRaw = str(form, "availability");
  const availability = (AVAILABILITY as string[]).includes(availabilityRaw)
    ? (availabilityRaw as Availability)
    : "in-stock";

  const price = parsePrice(str(form, "price"), "price", errors);
  const compareRaw = str(form, "compareAtPrice");
  const compareAtPrice = parsePrice(compareRaw, "compareAtPrice", errors);

  // A struck-through price only means anything next to a real one, and only
  // when it is higher — otherwise the badge would advertise a markup.
  if (compareAtPrice !== null) {
    if (price === null) {
      errors.compareAtPrice = "Set a price before adding a strike-through price.";
    } else if (compareAtPrice <= price) {
      errors.compareAtPrice = "Must be higher than the selling price.";
    }
  }

  const image = str(form, "image");
  if (!image) errors.image = "Required.";

  const gallery = lines(form, "gallery").filter((src) => src !== image);

  const summary = str(form, "summary");
  if (!summary) errors.summary = "Required — it is the card and meta description.";

  const addedAt = str(form, "addedAt") || context.existing?.addedAt || todayISO();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(addedAt)) {
    errors.addedAt = "Use YYYY-MM-DD.";
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const product: Product = {
    id: context.existing?.id ?? slug,
    slug,
    name,
    shortName: str(form, "shortName") || name,
    brand: str(form, "brand") || "AgroSky",
    category,
    type: str(form, "type") || "General",
    group,
    price,
    image,
    alt: str(form, "alt") || name,
    availability,
    addedAt,
    summary,
    description: str(form, "description") || summary,
    specs: parseSpecs(str(form, "specs")),
    highlights: lines(form, "highlights"),
    tags: parseTags(str(form, "tags")),
    order: context.existing?.order,
  };

  if (compareAtPrice !== null) product.compareAtPrice = compareAtPrice;
  if (gallery.length > 0) product.gallery = gallery;
  if (bool(form, "featured")) product.featured = true;
  if (bool(form, "bestseller")) product.bestseller = true;

  return { ok: true, value: product };
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export interface BannerContext {
  takenSlugs: Set<string>;
  existing?: BannerDef;
}

/**
 * Only same-site paths are accepted. The banner is admin-authored, but it is
 * also the most prominent link on the home page, so it must not be able to
 * point the shop's own hero at another origin.
 */
function internalPath(raw: string): string | null {
  if (!raw) return null;
  if (!raw.startsWith("/") || raw.startsWith("//")) return null;
  return raw;
}

export function parseBannerForm(form: FormData, context: BannerContext): Parsed<BannerDef> {
  const errors: FieldErrors = {};

  const headline = str(form, "headline");
  const slug = slugify(str(form, "slug") || headline || "banner");
  if (!SLUG_RE.test(slug)) errors.slug = "Use lowercase letters, numbers and hyphens.";
  else if (context.takenSlugs.has(slug)) errors.slug = "Another banner already uses this name.";

  const image = str(form, "image");
  if (!image) errors.image = "Required — a banner is the image.";

  const alt = str(form, "alt");
  if (!alt) errors.alt = "Required — it is what a screen reader announces.";

  const hrefRaw = str(form, "href");
  const href = internalPath(hrefRaw);
  if (hrefRaw && !href) {
    errors.href = "Must be a path on this site, starting with a single “/”.";
  }

  const ctaLabel = str(form, "ctaLabel");
  // Only when the field was left empty — a rejected URL already has a better
  // message sitting there, and overwriting it would hide the real problem.
  if (ctaLabel && !hrefRaw) errors.href = "Add the link this button should open.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const banner: BannerDef = {
    slug,
    image,
    alt,
    active: bool(form, "active"),
    order: context.existing?.order,
  };

  if (headline) banner.headline = headline;
  const subline = str(form, "subline");
  if (subline) banner.subline = subline;
  if (href) banner.href = href;
  if (ctaLabel) banner.ctaLabel = ctaLabel;

  return { ok: true, value: banner };
}
