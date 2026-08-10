export type ProductGroup = "drone" | "part";

export type Availability = "in-stock" | "low-stock" | "made-to-order" | "out-of-stock";

export interface CategoryDef {
  slug: string;
  name: string;
  /** Short blurb used on category cards and as the meta description seed. */
  description: string;
  group: ProductGroup;
  image: string;
  /** Sub-types available inside this category, used by the subcategory filter. */
  types: string[];
}

export interface SpecRow {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  /** Short name used in tight spaces such as breadcrumbs and cart rows. */
  shortName: string;
  brand: string;
  category: string;
  /** Sub-type within the category, e.g. "Folding Propeller". */
  type: string;
  group: ProductGroup;
  /** Price in INR. `null` means price on request (enquiry-only). */
  price: number | null;
  /** Optional struck-through reference price. */
  compareAtPrice?: number;
  image: string;
  /** Additional gallery images; the primary image is prepended automatically. */
  gallery?: string[];
  alt: string;
  availability: Availability;
  featured?: boolean;
  bestseller?: boolean;
  /** ISO date used for the "Newest" sort order. */
  addedAt: string;
  summary: string;
  description: string;
  specs: SpecRow[];
  highlights: string[];
  tags: string[];
}
