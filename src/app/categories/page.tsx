import { CategoryGrid } from "@/components/home/CategoryGrid";
import { ProductCarousel } from "@/components/product/ProductCarousel";
import { SectionCard } from "@/components/ui/SectionCard";
import { stockedCategories } from "@/lib/categories";
import { getBestsellers, getProductsByCategory, products } from "@/lib/products";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Shop by Category",
  description: `Browse the full ${siteConfig.name} range by category — complete drones, airframes, motors, propellers, flight controllers, batteries, chargers, spray systems and accessories.`,
  path: "/categories",
});

export default function CategoriesPage() {
  return (
    <div className="container-page space-y-2.5 py-2.5 sm:space-y-3 sm:py-3">
      <SectionCard
        icon="🏪"
        title="All Categories"
        subtitle={`${products.length} products across ${stockedCategories.length} stocked categories`}
        href="/products"
        viewAllLabel="Shop all"
      >
        <h1 className="sr-only">Shop by category</h1>
        <CategoryGrid />
      </SectionCard>

      <SectionCard
        icon="⭐"
        title="Popular right now"
        subtitle="What operators reorder most"
        href="/products"
      >
        <ProductCarousel products={getBestsellers(10)} ariaLabel="Popular products" />
      </SectionCard>

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
    </div>
  );
}
