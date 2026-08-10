import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ProductBrowser } from "@/components/product/ProductBrowser";
import { JsonLd } from "@/components/seo/JsonLd";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
import { categories, getCategory } from "@/lib/categories";
import { getProductsByCategory } from "@/lib/products";
import { categoryMetadata, itemListSchema } from "@/lib/seo";

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

  return (
    <>
      <JsonLd
        id={`ld-category-${slug}`}
        data={itemListSchema(items, { name: category.name, path: `/category/${slug}` })}
      />

      {/* Category banner */}
      <div className="relative overflow-hidden border-b border-ink-100">
        <div className="absolute inset-0" aria-hidden>
          <Image
            src={category.image}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-r from-ink-950/92 via-ink-950/78 to-ink-950/45" />
        </div>

        <div className="container-page relative py-8 sm:py-12 lg:py-14">
          <Breadcrumbs
            tone="dark"
            crumbs={[
              { name: "Products", path: "/products" },
              { name: category.name, path: `/category/${slug}` },
            ]}
            className="mb-4"
          />
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-brand-300">
            {category.group === "drone" ? "Complete drones" : "Parts & accessories"}
          </p>
          <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
            {category.name}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-300 sm:text-base">
            {category.description}
          </p>
          <p className="mt-4 font-mono text-xs uppercase tracking-[0.14em] text-ink-400">
            {items.length} {items.length === 1 ? "product" : "products"} ·{" "}
            {category.types.join(" · ")}
          </p>
        </div>
      </div>

      <div className="container-page py-8 sm:py-10 lg:py-12">
        <Suspense fallback={<ProductGridSkeleton count={6} />}>
          <ProductBrowser
            source={items}
            lockedCategory={slug}
            emptyHint={`No ${category.name.toLowerCase()} match these filters. Try widening the price range or clearing the availability filter.`}
          />
        </Suspense>
      </div>
    </>
  );
}
