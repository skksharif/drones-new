import { CategoryRail } from "@/components/home/CategoryRail";
import { HeroSlider } from "@/components/home/HeroSlider";
import { ProductBrowser } from "@/components/product/ProductBrowser";
import { ProductCarousel } from "@/components/product/ProductCarousel";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/Button";
import { ChevronRight } from "@/components/ui/Icons";
import { Section, SectionHeading } from "@/components/ui/Section";
import { itemListSchema, pageMetadata } from "@/lib/seo";
import { getBestsellers, getFeaturedProducts, products } from "@/lib/products";
import { siteConfig } from "@/lib/site";

export const metadata = pageMetadata({
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description: siteConfig.description,
  path: "/",
});

/** Most recently added products, used for the "New arrivals" slider. */
const newest = [...products]
  .sort((a, b) => b.addedAt.localeCompare(a.addedAt))
  .slice(0, 10);

export default function HomePage() {
  const spotlight = getFeaturedProducts(5);
  const bestsellers = getBestsellers(10);

  return (
    <>
      <JsonLd
        id="ld-home-products"
        data={itemListSchema(products, { name: "AgroSky Products", path: "/" })}
      />

      {/* Opening slot: real products on a slider, not a static promo banner. */}
      <HeroSlider products={spotlight} />

      <Section className="py-8 sm:py-10">
        <SectionHeading
          eyebrow="Shop by category"
          title="Find the part you're after"
          description="Complete drones, airframes, power systems, controllers and spray hardware."
          action={
            <ButtonLink href="#shop" variant="outline" size="sm">
              Shop all
              <ChevronRight className="size-3.5" />
            </ButtonLink>
          }
          className="mb-5 sm:mb-7"
        />
        <CategoryRail />
      </Section>

      <Section className="py-8 sm:py-10">
        <SectionHeading
          eyebrow="Bestsellers"
          title="What operators reorder"
          description="The frames, motors and controllers we ship most often — and keep deepest in stock."
          className="mb-5 sm:mb-7"
        />
        <ProductCarousel products={bestsellers} ariaLabel="Bestselling products" />
      </Section>

      <Section className="py-8 sm:py-10">
        <SectionHeading
          eyebrow="Just in"
          title="New arrivals"
          description="Freshly landed stock, newest first."
          action={
            <ButtonLink href="/products?sort=newest" variant="outline" size="sm">
              See all new
              <ChevronRight className="size-3.5" />
            </ButtonLink>
          }
          className="mb-5 sm:mb-7"
        />
        <ProductCarousel products={newest} ariaLabel="New arrivals" />
      </Section>

      {/* The shop itself — full catalogue with search, filters and sorting. */}
      <Section id="shop" className="border-t border-ink-100 py-10 sm:py-12">
        <SectionHeading
          eyebrow="Shop"
          title="All products"
          description={`Search, filter and sort the full catalogue — all ${products.length} drones, frames, motors, controllers, nozzles and accessories.`}
          className="mb-6 sm:mb-8"
        />
        <ProductBrowser />
      </Section>
    </>
  );
}
