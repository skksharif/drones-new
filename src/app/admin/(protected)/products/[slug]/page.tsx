import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminNotice } from "@/components/admin/AdminNotice";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { ProductForm } from "@/components/admin/ProductForm";
import { deleteProductAction } from "@/lib/admin/actions";
import { getCatalogue } from "@/lib/catalogue";
import { countByCategory, subTypesByCategory } from "@/lib/products";
import { cloudinaryConfigured } from "@/lib/cloudinary";

export async function generateMetadata({ params }: PageProps<"/admin/products/[slug]">) {
  const { slug } = await params;
  return { title: `Edit ${slug}` };
}

export default async function EditProductPage({
  params,
  searchParams,
}: PageProps<"/admin/products/[slug]">) {
  const { slug } = await params;
  const { error } = await searchParams;
  const { products, categories } = await getCatalogue();
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();

  const subTypes = subTypesByCategory(categories, products);
  const productCounts = Object.fromEntries(
    categories.map((c) => [c.slug, countByCategory(products, c.slug)]),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/admin/products" className="text-sm text-ink-500 hover:text-ink-900">
            ← Products
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-ink-900">{product.name}</h1>
          <a
            href={`/products/${product.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-ink-400 hover:text-brand-800"
          >
            /products/{product.slug} ↗
          </a>
        </div>
        <DeleteButton
          action={deleteProductAction}
          slug={product.slug}
          label="Delete product"
          confirm={`Delete “${product.name}”? Anyone holding it in their cart will lose it.`}
        />
      </div>

      {typeof error === "string" ? <AdminNotice tone="danger">{error}</AdminNotice> : null}

      <ProductForm
        product={product}
        categories={categories}
        subTypes={subTypes}
        productCounts={productCounts}
        uploadsEnabled={cloudinaryConfigured()}
      />
    </div>
  );
}
