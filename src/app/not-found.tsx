import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { ChevronRight, SearchIcon } from "@/components/ui/Icons";
import { siteConfig } from "@/lib/site";

export const metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

/**
 * The boundary for URLs that match no route at all, outside `(storefront)`.
 *
 * Next serialises the nearest not-found boundary into the payload of every
 * route below it, so this one stays deliberately small: no catalogue, no
 * providers, no footer. Shop routes that call `notFound()` hit the richer
 * `(storefront)/not-found.tsx` instead, which renders inside chrome that page
 * is already paying for.
 */
export default function NotFound() {
  return (
    <>
      <div className="border-b border-ink-200 bg-white">
        <div className="container-page flex h-16 items-center">
          <Link href="/" className="inline-flex items-center">
            <Image
              src="/images/brand/logo.png"
              alt={siteConfig.name}
              width={1280}
              height={853}
              className="h-10 w-auto"
            />
          </Link>
        </div>
      </div>

      <main className="container-page my-3.5 flex flex-1 flex-col items-center justify-center rounded-[var(--radius-card)] bg-white py-16 text-center shadow-[var(--shadow-card)]">
        <p className="font-mono text-6xl font-bold text-gradient-brand sm:text-8xl">404</p>
        <h1 className="mt-5 text-2xl font-bold sm:text-3xl">We couldn&apos;t find that page</h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-500 sm:text-base">
          The link may be out of date, or the page may have moved. Try searching the catalogue or
          head back to the shop.
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
      </main>
    </>
  );
}
