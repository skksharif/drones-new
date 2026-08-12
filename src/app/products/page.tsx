import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ProductBrowser } from "@/components/product/ProductBrowser";
import { JsonLd } from "@/components/seo/JsonLd";
import { SectionCard } from "@/components/ui/SectionCard";
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

      <div className="container-page space-y-2.5 py-2.5 sm:py-3">
        <Breadcrumbs crumbs={[{ name: "Products", path: "/products" }]} />

        <SectionCard
          as="h1"
          icon="🛒"
          title="All Products"
          subtitle={`Every drone, frame, motor, controller and nozzle we stock — ${products.length} products in total. Use the filters to narrow by category, price, availability or type.`}
        >
          <ProductBrowser />
        </SectionCard>
      </div>
    </>
  );
}
