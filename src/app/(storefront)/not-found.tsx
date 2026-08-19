import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { ChevronRight, SearchIcon } from "@/components/ui/Icons";
import { getCatalogue } from "@/lib/catalogue";

export const metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

/** `notFound()` from a shop route lands here, inside the full shop chrome. */
export default async function StorefrontNotFound() {
  const { categories } = await getCatalogue();

  return (
    <div className="container-page my-3.5 flex min-h-[60vh] flex-col items-center justify-center rounded-[var(--radius-card)] bg-white py-16 text-center shadow-[var(--shadow-card)]">
      <p className="font-mono text-6xl font-bold text-gradient-brand sm:text-8xl">404</p>
      <h1 className="mt-5 text-2xl font-bold sm:text-3xl">We couldn&apos;t find that page</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-500 sm:text-base">
        The link may be out of date, or the product may have been renamed. Try searching the
        catalogue or browsing a category below.
      </p>

      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/products" size="lg">
          Browse all products
          <ChevronRight className="size-4" />
        </ButtonLink>
        <ButtonLink href="/search" variant="outline" size="lg">
          <SearchIcon className="size-4" />
          Search
        </ButtonLink>
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-2">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/category/${category.slug}`}
            className="rounded-full border border-ink-200 bg-white px-3.5 py-2 text-xs font-medium text-ink-600 transition-colors hover:border-brand-700/40 hover:text-brand-800"
          >
            {category.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
