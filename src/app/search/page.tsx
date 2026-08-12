import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ProductBrowser } from "@/components/product/ProductBrowser";
import { SectionCard } from "@/components/ui/SectionCard";
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
    <div className="container-page space-y-2.5 py-2.5 sm:py-3">
      <Breadcrumbs crumbs={[{ name: "Search", path: "/search" }]} />

      <SectionCard
        as="h1"
        icon="🔍"
        title="Search products"
        subtitle="Search by product name, brand, part number or specification — try “E610P”, “Hobbywing” or “nozzle”."
      >
        <ProductBrowser searchAutoFocus />
      </SectionCard>
    </div>
  );
}
