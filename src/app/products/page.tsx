import { Suspense } from "react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ProductBrowser } from "@/components/product/ProductBrowser";
import { JsonLd } from "@/components/seo/JsonLd";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
import { products } from "@/lib/products";
import { itemListSchema, pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata = pageMetadata({
  title: "All Products — Drones, Frames, Motors & Spare Parts",
  description: `Browse all ${products.length} products from ${siteConfig.name}: agricultural spraying drones, EFT frames, Hobbywing motors and propellers, Pixhawk flight controllers, spray nozzles and accessories. Filter by category, price and availability.`,
  path: "/products",
  keywords: [
    "buy agriculture drone online",
    "drone spare parts india",
    "EFT drone frame price",
    "Hobbywing motor price india",
    "Pixhawk flight controller buy",
    "drone spray nozzle",
  ],
});

export default function ProductsPage() {
  return (
    <>
      <JsonLd
        id="ld-all-products"
        data={itemListSchema(products, { name: "All Products", path: "/products" })}
      />

      <div className="border-b border-ink-100 bg-surface-muted">
        <div className="container-page py-6 sm:py-10">
          <Breadcrumbs crumbs={[{ name: "Products", path: "/products" }]} className="mb-4" />
          <h1 className="text-2xl font-bold sm:text-3xl lg:text-4xl">All Products</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-500 sm:text-base">
            Every drone, frame, motor, controller and nozzle we stock — {products.length} products in
            total. Use the filters to narrow by category, price, availability or type.
          </p>
        </div>
      </div>

      <div className="container-page py-8 sm:py-10 lg:py-12">
        <Suspense fallback={<ProductGridSkeleton count={8} />}>
          <ProductBrowser />
        </Suspense>
      </div>
    </>
  );
}
