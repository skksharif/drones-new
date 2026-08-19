import { CategoryGrid } from "@/components/home/CategoryGrid";
import { ProductCarousel } from "@/components/product/ProductCarousel";
import { SectionCard } from "@/components/ui/SectionCard";
import { getCatalogue } from "@/lib/catalogue";
import { stockedCategories } from "@/lib/categories";
import { bestsellers, productsByCategory } from "@/lib/products";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { StarIcon, StoreIcon } from "@/components/ui/Icons";

export const metadata = pageMetadata({
  title: "Shop by Category",
  description: `Browse the full ${siteConfig.name} range by category — complete drones, airframes, motors, propellers, flight controllers, batteries, chargers, spray systems and accessories.`,
  path: "/categories",
});

export default async function CategoriesPage() {
  const catalogue = await getCatalogue();
  const { products, categories } = catalogue;
  const stocked = stockedCategories(categories, products);

  return (
    <div className="container-page space-y-2.5 py-2.5 sm:space-y-3 sm:py-3">
      <SectionCard
        icon={<StoreIcon />}
        title="All Categories"
        subtitle={`${products.length} products across ${stocked.length} stocked categories`}
        href="/products"
        viewAllLabel="Shop all"
      >
        <h1 className="sr-only">Shop by category</h1>
        <CategoryGrid categories={categories} products={products} />
      </SectionCard>

      <SectionCard
        icon={<StarIcon />}
        title="Popular right now"
        subtitle="What operators reorder most"
        href="/products"
      >
        <ProductCarousel products={bestsellers(products, 10)} ariaLabel="Popular products" />
      </SectionCard>

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
    </div>
  );
}
