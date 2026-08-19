import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ProductBrowser } from "@/components/product/ProductBrowser";
import { ProductCarousel } from "@/components/product/ProductCarousel";
import { JsonLd } from "@/components/seo/JsonLd";
import { SectionCard } from "@/components/ui/SectionCard";
import { getCatalogue } from "@/lib/catalogue";
import { findCategory } from "@/lib/categories";
import { productsByCategory } from "@/lib/products";
import { categoryMetadata, itemListSchema } from "@/lib/seo";
import { CategoryIcon } from "@/components/ui/CategoryIcon";

/** Sort weight for the category highlight slider. */
function rank(product: { bestseller?: boolean; featured?: boolean }): number {
  return (product.bestseller ? 2 : 0) + (product.featured ? 1 : 0);
}

export async function generateStaticParams() {
  const { categories } = await getCatalogue();
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: PageProps<"/category/[slug]">) {
  const { slug } = await params;
  const { products, categories } = await getCatalogue();
  const category = findCategory(categories, slug);
  if (!category) return { title: "Category not found" };
  return categoryMetadata(category, productsByCategory(products, slug).length);
}

export default async function CategoryPage({ params }: PageProps<"/category/[slug]">) {
  const { slug } = await params;
  const { products, categories } = await getCatalogue();
  const category = findCategory(categories, slug);
  if (!category) notFound();

  const items = productsByCategory(products, slug);
  // Featured and bestselling items first, so the rail leads with the strongest
  // products before the filterable grid repeats the full list.
  const highlights = [...items].sort((a, b) => rank(b) - rank(a)).slice(0, 10);

  return (
    <>
      <JsonLd
        id={`ld-category-${slug}`}
        data={itemListSchema(items, { name: category.name, path: `/category/${slug}` })}
      />

      <div className="container-page space-y-2.5 py-2.5 sm:space-y-3 sm:py-3">
        <Breadcrumbs
          crumbs={[
            { name: "Products", path: "/products" },
            { name: category.name, path: `/category/${slug}` },
          ]}
        />

        {highlights.length > 3 ? (
          <SectionCard
            icon={<CategoryIcon slug={category.slug} />}
            title={`Popular in ${category.name}`}
            subtitle={category.tagline}
          >
            <ProductCarousel
              products={highlights}
              priorityCount={2}
              ariaLabel={`Popular ${category.name}`}
            />
          </SectionCard>
        ) : null}

        <SectionCard
          as="h1"
          icon={<CategoryIcon slug={category.slug} />}
          title={category.name}
          subtitle={`${category.description} · ${items.length} ${
            items.length === 1 ? "product" : "products"
          }`}
        >
          <ProductBrowser
            source={items}
            lockedCategory={slug}
            emptyHint={`No ${category.name.toLowerCase()} match these filters. Try widening the price range or clearing the availability filter.`}
          />
        </SectionCard>
      </div>
    </>
  );
}
