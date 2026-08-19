import Image from "next/image";
import Link from "next/link";
import { AdminNotice } from "@/components/admin/AdminNotice";
import { getCatalogue } from "@/lib/catalogue";
import { CategoryIcon } from "@/components/ui/CategoryIcon";

export const metadata = { title: "Categories" };

/**
 * Read-only category reference.
 *
 * Categories are system-defined: they are the shape of the shop rather than
 * its contents, and every product, filter facet, chip and sitemap entry hangs
 * off their slugs. There is deliberately no create, edit, delete or reorder
 * here, and no server action behind this page — see `lib/admin/actions.ts`.
 */
export default async function AdminCategoriesPage() {
  const { products, categories } = await getCatalogue();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Categories</h1>
        <p className="mt-1 text-sm text-ink-500">
          The {categories.length} categories below are fixed. Order here is the order on the chip
          rail and the home page.
        </p>
      </div>

      <AdminNotice tone="info">
        Categories are system-defined and cannot be added, edited, reordered or removed. To change
        what sits in one, edit the products themselves.
      </AdminNotice>

      <div className="overflow-hidden rounded-[var(--radius-card)] bg-white shadow-[var(--shadow-card)]">
        <ul className="divide-y divide-ink-100">
          {categories.map((category, index) => {
            const count = products.filter((p) => p.category === category.slug).length;
            return (
              <li key={category.slug} className="flex items-start gap-3 p-3">
                <span
                  aria-hidden
                  className="w-6 shrink-0 pt-4 text-center font-mono text-xs text-ink-300"
                >
                  {index + 1}
                </span>

                <Image
                  src={category.image}
                  alt=""
                  width={56}
                  height={56}
                  className="size-14 shrink-0 rounded-xl bg-ink-50 object-cover"
                />

                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-sm font-medium text-ink-900">
                    <CategoryIcon slug={category.slug} className="size-4 text-ink-400" />
                    {category.name}
                    {category.short && category.short !== category.name ? (
                      <span className="ml-2 text-xs font-normal text-ink-400">
                        “{category.short}”
                      </span>
                    ) : null}
                  </p>

                  <p className="truncate font-mono text-xs text-ink-400">
                    /category/{category.slug}
                  </p>

                  <p className="mt-1 text-xs text-ink-500">{category.description}</p>

                  {category.types.length > 0 ? (
                    <ul className="mt-2 flex flex-wrap gap-1">
                      {category.types.map((type) => (
                        <li
                          key={type}
                          className="rounded-full bg-ink-50 px-2 py-0.5 text-[0.6875rem] text-ink-500"
                        >
                          {type}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-[0.6875rem] text-ink-300">No sub-types</p>
                  )}
                </div>

                <div className="shrink-0 pt-1 text-right">
                  <p
                    className={
                      count === 0 ? "text-sm text-ink-400" : "text-sm font-semibold text-ink-900"
                    }
                  >
                    {count} product{count === 1 ? "" : "s"}
                  </p>
                  <p className="mt-0.5 font-mono text-[0.6875rem] text-ink-400">
                    {category.group} · {category.types.length} sub-type
                    {category.types.length === 1 ? "" : "s"}
                  </p>
                  <Link
                    href={`/admin/products?category=${category.slug}`}
                    className="mt-1 inline-block text-xs font-medium text-brand-800 hover:underline"
                  >
                    View products →
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
