import Link from "next/link";
import { getCatalogue } from "@/lib/catalogue";
import { countByCategory } from "@/lib/products";
import { CategoryIcon } from "@/components/ui/CategoryIcon";

export const metadata = { title: "Overview" };

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-[var(--radius-card)] bg-white p-5 shadow-[var(--shadow-card)]">
      <p className="font-mono text-[0.6875rem] tracking-[0.14em] text-ink-400 uppercase">{label}</p>
      <p className="mt-2 text-3xl font-bold text-ink-900">{value}</p>
      {hint ? <p className="mt-1 text-xs text-ink-500">{hint}</p> : null}
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[var(--radius-card)] bg-white p-5 shadow-[var(--shadow-card)]">
      <h2 className="text-sm font-semibold text-ink-900">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

/** Proportional bar. Widths are relative to the largest row, not the total. */
function Bar({ value, max }: { value: number; max: number }) {
  return (
    <span className="block h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
      <span
        className="block h-full rounded-full bg-brand-700"
        style={{ width: max > 0 ? `${Math.max((value / max) * 100, value > 0 ? 6 : 0)}%` : "0%" }}
      />
    </span>
  );
}

const DATE = new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" });

export default async function AdminOverviewPage() {
  const { products, categories, banners } = await getCatalogue();

  const enquiryOnly = products.filter((p) => p.price === null).length;
  const discounted = products.filter(
    (p) => p.price !== null && p.compareAtPrice && p.compareAtPrice > p.price,
  ).length;
  const priced = products.filter((p) => p.price !== null).length;
  const empty = categories.filter((c) => !products.some((p) => p.category === c.slug));
  const liveBanners = banners.filter((b) => b.active).length;

  // Recently added — the same date field that drives the storefront's New badge.
  const recent = [...products].sort((a, b) => b.addedAt.localeCompare(a.addedAt)).slice(0, 5);

  const byCategory = categories
    .map((category) => ({ category, count: countByCategory(products, category.slug) }))
    .sort((a, b) => b.count - a.count || a.category.name.localeCompare(b.category.name));
  const categoryMax = Math.max(...byCategory.map((row) => row.count));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Catalogue overview</h1>
        <p className="mt-1 text-sm text-ink-500">
          Editing the live database. Saved changes rebuild the affected pages straight away.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <Stat label="Products" value={String(products.length)} />
        <Stat label="Categories" value={String(categories.length)} hint={`${empty.length} empty`} />
        <Stat
          label="On offer"
          value={String(discounted)}
          hint={discounted === 0 ? "No compare-at prices set" : undefined}
        />
        <Stat
          label="Price on request"
          value={String(enquiryOnly)}
          hint={priced > 0 ? `${priced} priced` : undefined}
        />
        <Stat
          label="Home banners"
          value={String(liveBanners)}
          hint={
            liveBanners === 0
              ? "Showing the automatic offer carousel"
              : `${banners.length} authored in total`
          }
        />
      </div>

      <div className="grid items-start gap-3 lg:grid-cols-2">
        <Panel title="Recently added">
          <ul className="space-y-2">
            {recent.map((product) => (
              <li key={product.slug}>
                <Link
                  href={`/admin/products/${product.slug}`}
                  className="-mx-2 flex items-baseline gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-ink-50"
                >
                  <span className="min-w-0 flex-1 truncate text-sm text-ink-700">
                    {product.name}
                  </span>
                  <span className="shrink-0 font-mono text-[0.6875rem] text-ink-400">
                    {DATE.format(new Date(product.addedAt))}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/admin/products"
            className="mt-4 inline-block text-sm font-medium text-brand-800 hover:underline"
          >
            All products →
          </Link>
        </Panel>

        <Panel title="Products per category">
          <ul className="space-y-2.5">
            {byCategory.map(({ category, count }) => (
              <li key={category.slug}>
                <Link
                  href={`/admin/products?category=${category.slug}`}
                  className="-mx-2 block rounded-lg px-2 py-1 transition-colors hover:bg-ink-50"
                >
                  <div className="flex items-baseline justify-between gap-2 text-sm">
                    <span className="flex min-w-0 items-baseline gap-1.5">
                      <CategoryIcon
                        slug={category.slug}
                        className="size-3.5 shrink-0 translate-y-0.5 text-ink-300"
                      />
                      <span
                        className={`truncate ${count === 0 ? "text-ink-400" : "text-ink-700"}`}
                      >
                        {category.name}
                      </span>
                    </span>
                    <span className="shrink-0 font-mono text-xs text-ink-400">
                      {count === 0 ? "empty" : count}
                    </span>
                  </div>
                  <div className="mt-1.5">
                    <Bar value={count} max={categoryMax} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
