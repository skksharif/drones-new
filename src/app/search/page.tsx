import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ProductBrowser } from "@/components/product/ProductBrowser";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Search Products",
  description: `Search the full ${siteConfig.name} catalogue of agricultural drones, frames, motors, propellers, flight controllers and spray nozzles by name, brand or specification.`,
  path: "/search",
  // Query-string result pages shouldn't be indexed individually.
  noIndex: true,
});

export default function SearchPage() {
  return (
    <>
      <div className="border-b border-ink-100 bg-surface-muted">
        <div className="container-page py-6 sm:py-10">
          <Breadcrumbs crumbs={[{ name: "Search", path: "/search" }]} className="mb-4" />
          <h1 className="text-2xl font-bold sm:text-3xl lg:text-4xl">Search products</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-500 sm:text-base">
            Search by product name, brand, part number or specification — try{" "}
            <span className="font-medium text-ink-700">“E610P”</span>,{" "}
            <span className="font-medium text-ink-700">“Hobbywing”</span> or{" "}
            <span className="font-medium text-ink-700">“nozzle”</span>.
          </p>
        </div>
      </div>

      <div className="container-page py-8 sm:py-10 lg:py-12">
        <ProductBrowser searchAutoFocus />
      </div>
    </>
  );
}
