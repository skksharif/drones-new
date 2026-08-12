import type { MetadataRoute } from "next";
import { categories } from "@/lib/categories";
import { products } from "@/lib/products";
import { absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/products"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/categories"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/services"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/about"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/contact"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: absoluteUrl(`/category/${category.slug}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: absoluteUrl(`/products/${product.slug}`),
    lastModified: new Date(product.addedAt),
    changeFrequency: "weekly",
    priority: product.featured ? 0.8 : 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
