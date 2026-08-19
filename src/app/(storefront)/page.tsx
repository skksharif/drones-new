import { PromoBanner } from "@/components/home/PromoBanner";
import { ProductBrowser } from "@/components/product/ProductBrowser";
import { ProductCarousel } from "@/components/product/ProductCarousel";
import { JsonLd } from "@/components/seo/JsonLd";
import { SectionCard } from "@/components/ui/SectionCard";
import { getCatalogue } from "@/lib/catalogue";
import { stockedCategories } from "@/lib/categories";
import { deals as pickDeals, featuredProducts, productsByCategory } from "@/lib/products";
import { itemListSchema, pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { CartIcon, TagIcon } from "@/components/ui/Icons";

export const metadata = pageMetadata({
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description: siteConfig.description,
  path: "/",
});

export default async function HomePage() {
  const { products, categories, banners } = await getCatalogue();
  const deals = pickDeals(products, 10);
  const stocked = stockedCategories(categories, products);
  // The banner only ever advertises live offers; featured stock stands in if
  // nothing is currently discounted.
  const banner = deals.length >= 2 ? deals.slice(0, 3) : featuredProducts(products, 3);
  // Narrowed here rather than in the carousel: `PromoBanner` is a client
  // component, so anything handed to it is serialised into the page. A parked
  // draft's headline would otherwise be readable in the page source.
  const liveBanners = banners.filter((entry) => entry.active);

  return (
    <>
      <JsonLd
        id="ld-home-products"
        data={itemListSchema(products, { name: `${siteConfig.name} Products`, path: "/" })}
      />

      <h1 className="sr-only">
        {siteConfig.name} — buy agricultural drones, frames, motors and spare parts online
      </h1>

      <div className="container-page space-y-2.5 py-2.5 sm:space-y-3 sm:py-3">
        <PromoBanner products={banner} banners={liveBanners} />

        {deals.length > 0 ? (
          <SectionCard
            icon={<TagIcon />}
            title="Hot Deals"
            subtitle="Best prices on top products"
            href="/products"
          >
            <ProductCarousel products={deals} priorityCount={2} ariaLabel="Hot deals" />
          </SectionCard>
        ) : null}

        {stocked.map((category) => (
          <SectionCard
            key={category.slug}
            icon={<CategoryIcon slug={category.slug} />}
            title={category.name}
            subtitle={category.tagline}
            href={`/category/${category.slug}`}
          >
            <ProductCarousel
              products={productsByCategory(products, category.slug)}
              ariaLabel={category.name}
            />
          </SectionCard>
        ))}

        {/* The shop itself — full catalogue with search, filters and sorting. */}
        <SectionCard
          id="shop"
          icon={<CartIcon />}
          title="All Products"
          subtitle={`Search, filter and sort all ${products.length} products`}
        >
          <ProductBrowser />
        </SectionCard>
      </div>
    </>
  );
}
