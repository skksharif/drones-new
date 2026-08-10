import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductGrid } from "@/components/product/ProductGrid";
import { PurchasePanel } from "@/components/product/PurchasePanel";
import { JsonLd } from "@/components/seo/JsonLd";
import { Badge } from "@/components/ui/Badge";
import { CheckIcon, ChevronRight } from "@/components/ui/Icons";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/Section";
import { categoryName, getCategory } from "@/lib/categories";
import { formatPrice } from "@/lib/format";
import { getProduct, getRelatedProducts, products } from "@/lib/products";
import { pageMetadata, productSchema } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = getProduct(slug);
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
  const product = getProduct(slug);
  if (!product) notFound();

  const category = getCategory(product.category);
  const related = getRelatedProducts(product, 4);

  return (
    <>
      <JsonLd id={`ld-product-${product.slug}`} data={productSchema(product)} />

      <div className="border-b border-ink-100 bg-surface-muted">
        <div className="container-page py-4 sm:py-5">
          <Breadcrumbs
            crumbs={[
              { name: "Products", path: "/products" },
              ...(category
                ? [{ name: category.name, path: `/category/${category.slug}` }]
                : []),
              { name: product.shortName, path: `/products/${product.slug}` },
            ]}
          />
        </div>
      </div>

      <article className="container-page py-8 sm:py-10 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
          <ProductGallery product={product} />

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Link href={`/category/${product.category}`}>
                <Badge tone="neutral" className="transition-colors hover:bg-brand-100">
                  {categoryName(product.category)}
                </Badge>
              </Link>
              <Badge tone="neutral">{product.type}</Badge>
              <Badge tone="neutral">{product.brand}</Badge>
            </div>

            <h1 className="mt-4 text-2xl font-bold leading-tight sm:text-3xl lg:text-[2.125rem]">
              {product.name}
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-ink-500 sm:text-base">
              {product.summary}
            </p>

            <div className="mt-7 border-t border-ink-100 pt-7">
              <PurchasePanel product={product} />
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="mt-12 grid gap-8 lg:mt-16 lg:grid-cols-2 lg:gap-14">
          <Reveal>
            <h2 className="text-lg font-semibold sm:text-xl">Product description</h2>
            <p className="mt-4 text-sm leading-relaxed text-ink-600 sm:text-[0.9375rem]">
              {product.description}
            </p>

            <h3 className="mt-8 text-base font-semibold">Key highlights</h3>
            <ul className="mt-4 space-y-3">
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
            <h2 className="text-lg font-semibold sm:text-xl">Specifications</h2>
            <dl className="mt-4 overflow-hidden rounded-[var(--radius-card)] border border-ink-200/70">
              {product.specs.map((spec, index) => (
                <div
                  key={spec.label}
                  className={`flex flex-wrap gap-x-4 gap-y-1 px-4 py-3.5 text-sm ${
                    index % 2 === 0 ? "bg-surface-muted" : "bg-white"
                  }`}
                >
                  <dt className="w-40 shrink-0 font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-ink-400">
                    {spec.label}
                  </dt>
                  <dd className="flex-1 font-medium text-ink-800">{spec.value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-6 rounded-[var(--radius-card)] gradient-brand-soft p-5">
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
      </article>

      {/* Related */}
      {related.length > 0 ? (
        <section className="border-t border-ink-100 bg-surface-muted py-12 sm:py-16">
          <div className="container-page">
            <SectionHeading
              eyebrow="You may also need"
              title="Related products"
              action={
                <Link
                  href={`/category/${product.category}`}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 underline-offset-4 hover:underline"
                >
                  All {categoryName(product.category).toLowerCase()}
                  <ChevronRight className="size-3.5" />
                </Link>
              }
              className="mb-6 sm:mb-8"
            />
            <ProductGrid products={related} />
          </div>
        </section>
      ) : null}
    </>
  );
}
