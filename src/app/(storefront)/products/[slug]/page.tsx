import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ProductCarousel } from "@/components/product/ProductCarousel";
import { ProductGallery } from "@/components/product/ProductGallery";
import { PurchasePanel } from "@/components/product/PurchasePanel";
import { JsonLd } from "@/components/seo/JsonLd";
import { Badge } from "@/components/ui/Badge";
import { CheckIcon, ChevronRight } from "@/components/ui/Icons";
import { Reveal } from "@/components/ui/Reveal";
import { SectionCard } from "@/components/ui/SectionCard";
import { getCatalogue } from "@/lib/catalogue";
import { categoryName, findCategory } from "@/lib/categories";
import { formatPrice } from "@/lib/format";
import { findProduct, relatedProducts } from "@/lib/products";
import { pageMetadata, productSchema } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { CategoryIcon } from "@/components/ui/CategoryIcon";

export async function generateStaticParams() {
  const { products } = await getCatalogue();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const { products } = await getCatalogue();
  const product = findProduct(products, slug);
  if (!product) return { title: "Product not found" };

  const priceLabel =
    product.price === null ? "Price on request" : `${formatPrice(product.price)}`;

  return pageMetadata({
    title: `${product.name} — ${priceLabel}`,
    description: `${product.summary} Buy ${product.name} from ${siteConfig.name} at ${priceLabel}. ${product.brand} · ${product.type} · shipped across Andhra Pradesh and Telangana.`,
    path: `/products/${product.slug}`,
    image: product.image,
    type: "article",
    keywords: [
      product.name.toLowerCase(),
      `${product.name.toLowerCase()} price`,
      `buy ${product.brand.toLowerCase()} ${product.type.toLowerCase()}`,
      ...product.tags,
    ],
  });
}

export default async function ProductDetailPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const { products, categories } = await getCatalogue();
  const product = findProduct(products, slug);
  if (!product) notFound();

  const category = findCategory(categories, product.category);
  const related = relatedProducts(products, product, 8);

  return (
    <>
      <JsonLd id={`ld-product-${product.slug}`} data={productSchema(product)} />

      <div className="container-page space-y-2.5 py-2.5 sm:space-y-3 sm:py-3">
        <Breadcrumbs
          crumbs={[
            { name: "Products", path: "/products" },
            ...(category ? [{ name: category.name, path: `/category/${category.slug}` }] : []),
            { name: product.shortName, path: `/products/${product.slug}` },
          ]}
        />

        {/* Buy block */}
        <article className="rounded-[var(--radius-card)] bg-white p-3 shadow-[var(--shadow-card)] sm:p-5">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
            <ProductGallery product={product} />

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/category/${product.category}`}>
                  <Badge tone="neutral" className="transition-colors hover:bg-brand-100">
                    {categoryName(categories, product.category)}
                  </Badge>
                </Link>
                <Badge tone="neutral">{product.type}</Badge>
                <Badge tone="neutral">{product.brand}</Badge>
              </div>

              <h1 className="mt-4 text-xl font-bold leading-tight sm:text-2xl lg:text-3xl">
                {product.name}
              </h1>

              <p className="mt-3 text-sm leading-relaxed text-ink-500 sm:text-[0.9375rem]">
                {product.summary}
              </p>

              <div className="mt-6 border-t border-ink-100 pt-6">
                <PurchasePanel product={product} />
              </div>
            </div>
          </div>
        </article>

        {/* Details */}
        <div className="rounded-[var(--radius-card)] bg-white p-3 shadow-[var(--shadow-card)] sm:p-5">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
            <Reveal>
              <h2 className="text-base font-bold sm:text-lg">Product description</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-600">{product.description}</p>

              <h3 className="mt-7 text-sm font-bold">Key highlights</h3>
              <ul className="mt-3 space-y-3">
                {product.highlights.map((highlight) => (
                  <li key={highlight} className="flex gap-3 text-sm text-ink-600">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full gradient-brand-soft text-brand-700">
                      <CheckIcon className="size-3.5" strokeWidth={2.5} />
                    </span>
                    {highlight}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={80}>
              <h2 className="text-base font-bold sm:text-lg">Specifications</h2>
              <dl className="mt-3 overflow-hidden rounded-2xl border border-ink-200/70">
                {product.specs.map((spec, index) => (
                  <div
                    key={spec.label}
                    className={`flex flex-wrap gap-x-4 gap-y-1 px-4 py-3 text-sm ${
                      index % 2 === 0 ? "bg-surface-muted" : "bg-white"
                    }`}
                  >
                    <dt className="w-36 shrink-0 font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-ink-400">
                      {spec.label}
                    </dt>
                    <dd className="flex-1 font-medium text-ink-800">{spec.value}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-5 rounded-2xl gradient-brand-soft p-5">
                <h3 className="text-sm font-semibold text-brand-900">Need help fitting this?</h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-900/75">
                  Tell us your airframe and payload and we&apos;ll confirm compatibility before you
                  order — including rotation, pitch and connector type.
                </p>
                <Link
                  href="/contact"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-800 underline-offset-4 hover:underline"
                >
                  Contact our team
                  <ChevronRight className="size-3.5" />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 ? (
          <SectionCard
            icon={<CategoryIcon slug={product.category} />}
            title="Related products"
            subtitle="You may also need these"
            href={`/category/${product.category}`}
            viewAllLabel="View All"
          >
            <ProductCarousel products={related} ariaLabel="Related products" />
          </SectionCard>
        ) : null}
      </div>
    </>
  );
}
