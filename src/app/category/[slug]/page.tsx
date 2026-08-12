import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ProductBrowser } from "@/components/product/ProductBrowser";
import { ProductCarousel } from "@/components/product/ProductCarousel";
import { JsonLd } from "@/components/seo/JsonLd";
import { categories, getCategory } from "@/lib/categories";
import { getProductsByCategory } from "@/lib/products";
import { categoryMetadata, itemListSchema } from "@/lib/seo";

/** Sort weight for the category highlight slider. */
function rank(product: { bestseller?: boolean; featured?: boolean }): number {
  return (product.bestseller ? 2 : 0) + (product.featured ? 1 : 0);
}

export function generateStaticParams() {
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: PageProps<"/category/[slug]">) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) return { title: "Category not found" };
  return categoryMetadata(category, getProductsByCategory(slug).length);
}

export default async function CategoryPage({ params }: PageProps<"/category/[slug]">) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

  const items = getProductsByCategory(slug);
  // Featured and bestselling items first, so the slider leads with the strongest
  // products before the filterable grid repeats the full list.
  const highlights = [...items]
    .sort((a, b) => rank(b) - rank(a))
    .slice(0, 10);

  return (
    <>
      <JsonLd
        id={`ld-category-${slug}`}
        data={itemListSchema(items, { name: category.name, path: `/category/${slug}` })}
      />

      {/* Compact text header — the products below are the page, not a banner. */}
      <div className="border-b border-ink-100 bg-surface-muted">
        <div className="container-page py-5 sm:py-8">
          <Breadcrumbs
            crumbs={[
              { name: "Products", path: "/products" },
              { name: category.name, path: `/category/${slug}` },
            ]}
            className="mb-3"
          />
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-brand-700">
            {category.group === "drone" ? "Complete drones" : "Parts & accessories"}
          </p>
          <h1 className="mt-1.5 text-2xl font-bold sm:text-3xl lg:text-4xl">{category.name}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-500 sm:text-base">
            {category.description}
          </p>
          <p className="mt-3 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-400">
            {items.length} {items.length === 1 ? "product" : "products"} ·{" "}
            {category.types.join(" · ")}
          </p>
        </div>
      </div>

      {/* Top picks in this category, as a slider. */}
      {highlights.length > 3 ? (
        <div className="container-page pt-7 sm:pt-9">
          <h2 className="mb-4 text-base font-semibold sm:text-lg">
            Popular in {category.name.toLowerCase()}
          </h2>
          <ProductCarousel
            products={highlights}
            priorityCount={2}
            ariaLabel={`Popular ${category.name}`}
          />
        </div>
      ) : null}

      <div className="container-page py-8 sm:py-10 lg:py-12">
        <ProductBrowser
          source={items}
          lockedCategory={slug}
          emptyHint={`No ${category.name.toLowerCase()} match these filters. Try widening the price range or clearing the availability filter.`}
        />
      </div>
    </>
  );
}
