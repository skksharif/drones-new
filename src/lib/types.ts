export type ProductGroup = "drone" | "part";

export type Availability = "in-stock" | "low-stock" | "made-to-order" | "out-of-stock";

export interface CategoryDef {
  slug: string;
  name: string;
  /** Compact label for the category chip rail and bottom-sheet filters. */
  short: string;
  /**
   * @deprecated Legacy emoji, still present in the stored documents but no
   * longer rendered: the category mark comes from `components/ui/CategoryIcon`
   * and is keyed off the slug. Stripped before the catalogue reaches the
   * browser.
   */
  icon?: string;
  /** Short blurb used on category cards and as the meta description seed. */
  description: string;
  /** One-line tagline shown under the section heading on the home page. */
  tagline: string;
  group: ProductGroup;
  image: string;
  /** Sub-types available inside this category, used by the subcategory filter. */
  types: string[];
  /**
   * Display position. Array order carried this before the catalogue moved to a
   * database, where document order is not guaranteed; the admin panel edits it
   * to reorder the chip rail and the home page sections.
   */
  order?: number;
}

export interface SpecRow {
  label: string;
  value: string;
}

/**
 * The catalogue as a whole. Read on the server, and handed to the browser as a
 * {@link ClientCatalogue} so the cart and the filters can work synchronously.
 */
export interface Catalogue {
  products: Product[];
  categories: CategoryDef[];
  banners: BannerDef[];
}

/**
 * A hand-authored slide for the home page banner.
 *
 * When any banner is active it replaces the automatic offer carousel wholesale
 * — mixing an uploaded image with the generated text slides looks like two
 * different sites. With none active the automatic slides come back.
 */
/** How a slide is painted. */
export type BannerBackground = "image" | "color";

/** Which way the copy is tinted so it stays legible on the background. */
export type BannerTheme = "light" | "dark";

export interface BannerDef {
  slug: string;
  background: BannerBackground;
  /** Set when `background` is `"image"`. */
  image?: string;
  /** `#rrggbb`, set when `background` is `"color"`. */
  backgroundColor?: string;
  theme: BannerTheme;
  /** What a screen reader announces for the image. Image slides only. */
  alt?: string;
  /** Overlay copy. All optional: an image on its own is a valid banner. */
  eyebrow?: string;
  headline?: string;
  subline?: string;
  ctaLabel?: string;
  /** Internal path only, e.g. `/category/drones`. Never an external URL. */
  href?: string;
  /** Drafts stay out of the carousel without being deleted. */
  active: boolean;
  /** Display position, as on {@link CategoryDef.order}. */
  order?: number;
}

/**
 * What the browser actually needs. The long-form copy is dropped: only the
 * product page renders it, and that page is server-rendered, so shipping it to
 * every visitor costs bandwidth nobody spends.
 */
export type ClientProduct = Omit<Product, "description" | "highlights">;

export interface ClientCatalogue {
  products: ClientProduct[];
  categories: CategoryDef[];
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
  /** Hand-picked for the Hot Deals rail on the home page. */
  isHotDeal?: boolean;
  /** Position within Hot Deals. Unset sorts after everything numbered. */
  hotDealOrder?: number;
  /** ISO date used for the "Newest" sort order. */
  addedAt: string;
  summary: string;
  description: string;
  specs: SpecRow[];
  highlights: string[];
  tags: string[];
  /** Display position, for the same reason as {@link CategoryDef.order}. */
  order?: number;
}
