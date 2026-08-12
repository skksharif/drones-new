import { PromoBanner } from "@/components/home/PromoBanner";
import { ProductBrowser } from "@/components/product/ProductBrowser";
import { ProductCarousel } from "@/components/product/ProductCarousel";
import { JsonLd } from "@/components/seo/JsonLd";
import { SectionCard } from "@/components/ui/SectionCard";
import { stockedCategories } from "@/lib/categories";
import {
  getDeals,
  getFeaturedProducts,
  getProductsByCategory,
  products,
} from "@/lib/products";
import { itemListSchema, pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata = pageMetadata({
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description: siteConfig.description,
  path: "/",
});

export default function HomePage() {
  const deals = getDeals(10);
  // The banner only ever advertises live offers; featured stock stands in if
  // nothing is currently discounted.
  const banner = deals.length >= 2 ? deals.slice(0, 3) : getFeaturedProducts(3);

  return (
    <>
      <JsonLd
        id="ld-home-products"
        data={itemListSchema(products, { name: "AgroSky Products", path: "/" })}
      />

      <h1 className="sr-only">
        {siteConfig.name} — buy agricultural drones, frames, motors and spare parts online
      </h1>

      <div className="container-page space-y-2.5 py-2.5 sm:space-y-3 sm:py-3">
        <PromoBanner products={banner} />

        {deals.length > 0 ? (
          <SectionCard
            icon="🏷️"
            title="Hot Deals"
            subtitle="Best prices on top products"
            href="/products"
          >
            <ProductCarousel products={deals} priorityCount={2} ariaLabel="Hot deals" />
          </SectionCard>
        ) : null}

        {stockedCategories.map((category) => (
          <SectionCard
            key={category.slug}
            icon={category.icon}
            title={category.name}
            subtitle={category.tagline}
            href={`/category/${category.slug}`}
          >
            <ProductCarousel
              products={getProductsByCategory(category.slug)}
              ariaLabel={category.name}
            />
          </SectionCard>
        ))}

        {/* The shop itself — full catalogue with search, filters and sorting. */}
        <SectionCard
          id="shop"
          icon="🛒"
          title="All Products"
          subtitle={`Search, filter and sort all ${products.length} products`}
        >
          <ProductBrowser />
        </SectionCard>
      </div>
    </>
  );
}
