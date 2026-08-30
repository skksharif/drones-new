import type { Metadata } from "next";
import { availabilityMeta } from "./format";
import { siteConfig } from "./site";
import type { CategoryDef, Product } from "./types";

export function absoluteUrl(path = "/"): string {
  return new URL(path, siteConfig.url).toString();
}

interface PageMetaInput {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  keywords?: string[];
  noIndex?: boolean;
}

/** Builds a consistent metadata object with canonical + Open Graph + Twitter tags. */
export function pageMetadata({
  title,
  description,
  path,
  image = siteConfig.ogImage,
  type = "website",
  keywords,
  noIndex,
}: PageMetaInput): Metadata {
  const url = absoluteUrl(path);
  return {
    title,
    description,
    keywords,
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: true } : undefined,
    openGraph: {
      type,
      url,
      siteName: siteConfig.name,
      title,
      description,
      locale: siteConfig.locale,
      images: [{ url: absoluteUrl(image), width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteUrl(image)],
    },
  };
}

// ── JSON-LD builders ────────────────────────────────────────────────────────

export function organizationSchema() {
  const { contact, social } = siteConfig;
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.legalName,
    alternateName: siteConfig.name,
    url: siteConfig.url,
    logo: absoluteUrl("/images/brand/logo.png"),
    description: siteConfig.description,
    foundingDate: String(siteConfig.foundingYear),
    founder: { "@type": "Person", name: siteConfig.founder, jobTitle: siteConfig.founderRole },
    email: contact.email,
    telephone: contact.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: contact.address.street,
      addressLocality: contact.address.locality,
      addressRegion: contact.address.region,
      postalCode: contact.address.postalCode,
      addressCountry: contact.address.country,
    },
    sameAs: [social.facebook, social.instagram, social.linkedin],
  };
}

export function localBusinessSchema() {
  const { contact } = siteConfig;
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    "@id": `${siteConfig.url}/#store`,
    name: siteConfig.legalName,
    image: absoluteUrl("/images/brand/logo.png"),
    url: siteConfig.url,
    telephone: contact.phone,
    email: contact.email,
    priceRange: "₹₹",
    currenciesAccepted: siteConfig.currency,
    address: {
      "@type": "PostalAddress",
      streetAddress: contact.address.street,
      addressLocality: contact.address.locality,
      addressRegion: contact.address.region,
      postalCode: contact.address.postalCode,
      addressCountry: contact.address.country,
    },
    areaServed: siteConfig.contact.serviceAreas.map((name) => ({
      "@type": "AdministrativeArea",
      name,
    })),
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
        opens: "09:00",
        closes: "19:00",
      },
    ],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    url: siteConfig.url,
    name: siteConfig.name,
    description: siteConfig.description,
    publisher: { "@id": `${siteConfig.url}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function productSchema(product: Product) {
  const url = absoluteUrl(`/products/${product.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: product.name,
    description: product.summary,
    sku: product.id,
    image: [absoluteUrl(product.image), ...(product.gallery ?? []).map((g) => absoluteUrl(g))],
    brand: { "@type": "Brand", name: product.brand },
    category: product.category,
    url,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: siteConfig.currency,
      ...(product.price !== null
        ? { price: product.price }
        : { priceSpecification: { "@type": "PriceSpecification", priceCurrency: siteConfig.currency } }),
      availability: availabilityMeta[product.availability].schema,
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": `${siteConfig.url}/#organization` },
    },
  };
}

export function itemListSchema(
  items: Product[],
  { name, path }: { name: string; path: string },
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    url: absoluteUrl(path),
    numberOfItems: items.length,
    itemListElement: items.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/products/${product.slug}`),
      name: product.name,
    })),
  };
}

export function breadcrumbSchema(crumbs: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

export function categoryMetadata(category: CategoryDef, count: number): Metadata {
  return pageMetadata({
    title: `${category.name} — Buy Online in India`,
    description: `${category.description} Browse ${count} ${category.name.toLowerCase()} from ${siteConfig.name}, shipped across Andhra Pradesh and Telangana.`,
    path: `/category/${category.slug}`,
    image: category.image,
    keywords: [
      category.name.toLowerCase(),
      `buy ${category.name.toLowerCase()} india`,
      "agriculture drone",
      "drone spare parts",
      siteConfig.name.toLowerCase(),
    ],
  });
}
