import Link from "next/link";
import { ProductForm } from "@/components/admin/ProductForm";
import { getCatalogue } from "@/lib/catalogue";
import { countByCategory, subTypesByCategory } from "@/lib/products";
import { cloudinaryConfigured } from "@/lib/cloudinary";

export const metadata = { title: "New product" };

export default async function NewProductPage() {
  const { products, categories } = await getCatalogue();
  const subTypes = subTypesByCategory(categories, products);
  const productCounts = Object.fromEntries(
    categories.map((c) => [c.slug, countByCategory(products, c.slug)]),
  );

  return (
    <div className="space-y-4">
      <div>
        <Link href="/admin/products" className="text-sm text-ink-500 hover:text-ink-900">
          ← Products
        </Link>
        <h1 className="mt-1 text-2xl font-bold text-ink-900">New product</h1>
      </div>
      <ProductForm
        categories={categories}
        subTypes={subTypes}
        productCounts={productCounts}
        uploadsEnabled={cloudinaryConfigured()}
      />
    </div>
  );
}
