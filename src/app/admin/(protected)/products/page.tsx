import Image from "next/image";
import Link from "next/link";
import { AdminNotice } from "@/components/admin/AdminNotice";
import { ButtonLink } from "@/components/ui/Button";
import { getCatalogue } from "@/lib/catalogue";
import { formatPrice } from "@/lib/format";
import { discountPercent } from "@/lib/products";

export const metadata = { title: "Products" };

export default async function AdminProductsPage({ searchParams }: PageProps<"/admin/products">) {
  const { products, categories } = await getCatalogue();
  const params = await searchParams;

  const query = typeof params.q === "string" ? params.q.toLowerCase().trim() : "";
  const filter = typeof params.category === "string" ? params.category : "";

  const visible = products.filter((product) => {
    if (filter && product.category !== filter) return false;
    if (!query) return true;
    return (
      product.name.toLowerCase().includes(query) ||
      product.slug.includes(query) ||
      product.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  const categoryName = (slug: string) => categories.find((c) => c.slug === slug)?.name ?? slug;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Products</h1>
          <p className="mt-1 text-sm text-ink-500">
            {visible.length} of {products.length} shown
          </p>
        </div>
        <ButtonLink href="/admin/products/new">New product</ButtonLink>
      </div>

      {typeof params.saved === "string" ? (
        <AdminNotice tone="success">Saved “{params.saved}”.</AdminNotice>
      ) : null}
      {typeof params.deleted === "string" ? (
        <AdminNotice tone="success">Deleted “{params.deleted}”.</AdminNotice>
      ) : null}
      {typeof params.error === "string" ? (
        <AdminNotice tone="danger">{params.error}</AdminNotice>
      ) : null}

      <form className="flex flex-wrap gap-2 rounded-[var(--radius-card)] bg-white p-3 shadow-[var(--shadow-card)]">
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search name, slug or tag"
          className="h-10 min-w-52 flex-1 rounded-xl border border-ink-200 px-3.5 text-sm outline-none focus:border-brand-700/50"
        />
        <select
          name="category"
          defaultValue={filter}
          className="h-10 rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-brand-700/50"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="h-10 rounded-xl bg-ink-900 px-4 text-sm font-medium text-white"
        >
          Filter
        </button>
      </form>

      <div className="overflow-hidden rounded-[var(--radius-card)] bg-white shadow-[var(--shadow-card)]">
        {visible.length === 0 ? (
          <p className="p-8 text-center text-sm text-ink-500">Nothing matches that filter.</p>
        ) : (
          <ul className="divide-y divide-ink-100">
            {visible.map((product) => {
              const off = discountPercent(product);
              return (
                <li key={product.slug}>
                  <Link
                    href={`/admin/products/${product.slug}`}
                    className="flex items-center gap-3 p-3 transition-colors hover:bg-ink-50"
                  >
                    <Image
                      src={product.image}
                      alt=""
                      width={56}
                      height={56}
                      className="size-14 shrink-0 rounded-xl bg-ink-50 object-contain"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink-900">{product.name}</p>
                      <p className="truncate font-mono text-xs text-ink-400">
                        {categoryName(product.category)} · {product.slug}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold text-ink-900">
                        {formatPrice(product.price)}
                      </p>
                      <p className="mt-0.5 flex items-center justify-end gap-1.5 text-[0.6875rem]">
                        {off ? (
                          <span className="rounded-full bg-brand-50 px-1.5 py-0.5 font-semibold text-brand-800">
                            {off}% off
                          </span>
                        ) : null}
                        {product.featured ? <span className="text-ink-400">featured</span> : null}
                        {product.bestseller ? <span className="text-ink-400">bestseller</span> : null}
                        <span className="text-ink-400">{product.tags.length} tags</span>
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
