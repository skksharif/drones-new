import Image from "next/image";
import Link from "next/link";
import founderPhoto from "../../public/images/brand/founder.jpg";
import { CategoryRail } from "@/components/home/CategoryRail";
import { Hero } from "@/components/home/Hero";
import { StatsStrip } from "@/components/home/StatsStrip";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductRail } from "@/components/product/ProductRail";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink, ExternalButtonLink } from "@/components/ui/Button";
import {
  ChevronRight,
  MailIcon,
  PhoneIcon,
  PinIcon,
  WhatsAppIcon,
} from "@/components/ui/Icons";
import { Reveal } from "@/components/ui/Reveal";
import { Section, SectionHeading } from "@/components/ui/Section";
import { itemListSchema, pageMetadata } from "@/lib/seo";
import { getBestsellers, getFeaturedProducts, products } from "@/lib/products";
import { services, siteConfig, whatsappLink } from "@/lib/site";

export const metadata = pageMetadata({
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description: siteConfig.description,
  path: "/",
});

export default function HomePage() {
  const featured = getFeaturedProducts(8);
  const bestsellers = getBestsellers(4);
  const newest = [...products]
    .sort((a, b) => b.addedAt.localeCompare(a.addedAt))
    .slice(0, 8);

  return (
    <>
      <JsonLd
        id="ld-home-products"
        data={itemListSchema(featured, { name: "Featured Products", path: "/" })}
      />

      <Hero />

      {/* Categories — immediately below the banner */}
      <Section className="pt-8 sm:pt-10 lg:pt-12">
        <SectionHeading
          eyebrow="Shop by category"
          title="Find the part you're after"
          description="Complete drones, airframes, power systems, controllers and spray hardware — organised the way an operator actually shops."
          action={
            <ButtonLink href="/products" variant="outline" size="sm">
              All products
              <ChevronRight className="size-3.5" />
            </ButtonLink>
          }
          className="mb-6 sm:mb-8"
        />
        <CategoryRail />
      </Section>

      {/* Featured products */}
      <Section className="pt-2 sm:pt-4">
        <SectionHeading
          eyebrow="Featured"
          title="Picked by our pilots"
          description="The frames, motors and controllers we fit to most builds — and the ones we keep deepest in stock."
          action={
            <ButtonLink href="/products?featured=1" variant="outline" size="sm">
              View all featured
              <ChevronRight className="size-3.5" />
            </ButtonLink>
          }
          className="mb-6 sm:mb-8"
        />
        <ProductRail products={featured} priorityCount={2} />
      </Section>

      {/* Bestsellers band */}
      <Section className="bg-surface-muted">
        <SectionHeading
          eyebrow="Bestsellers"
          title="What operators order most"
          description="Across Andhra Pradesh and Telangana, these are the parts that move fastest off our shelves."
          className="mb-6 sm:mb-8"
        />
        <ProductGrid products={bestsellers} />
      </Section>

      {/* All / newest products */}
      <Section>
        <SectionHeading
          eyebrow="New arrivals"
          title="Latest in the catalogue"
          description={`Browse all ${products.length} products with full search, filters and sorting.`}
          action={
            <ButtonLink href="/products" size="sm">
              Browse all {products.length}
              <ChevronRight className="size-3.5" />
            </ButtonLink>
          }
          className="mb-6 sm:mb-8"
        />
        <ProductGrid products={newest} />

        <Reveal className="mt-8 flex justify-center sm:mt-10">
          <ButtonLink href="/products" size="lg">
            Shop all products
            <ChevronRight className="size-4" />
          </ButtonLink>
        </Reveal>
      </Section>

      {/* Services — compact */}
      <Section className="bg-surface-muted">
        <SectionHeading
          eyebrow="Services"
          title="More than a parts shop"
          description="We fly commercially too — spraying, surveying, firefighting support and pilot training."
          action={
            <ButtonLink href="/services" variant="outline" size="sm">
              All services
              <ChevronRight className="size-3.5" />
            </ButtonLink>
          }
          className="mb-6 sm:mb-8"
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.slice(0, 3).map((service, index) => (
            <Reveal key={service.slug} delay={index * 70}>
              <Link
                href={`/services#${service.slug}`}
                className="group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-ink-200/70 bg-white shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]"
              >
                <div className="relative aspect-16/9 overflow-hidden">
                  <Image
                    src={service.image}
                    alt={`${service.title} — ${service.summary}`}
                    fill
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
                    loading="lazy"
                    className="object-cover transition-transform duration-700 ease-[var(--ease-out-soft)] motion-safe:group-hover:scale-107"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-ink-950/75 to-transparent" />
                  <h3 className="absolute inset-x-4 bottom-3 text-base font-semibold text-white">
                    {service.title}
                  </h3>
                </div>
                <p className="flex-1 p-4 text-sm leading-relaxed text-ink-500">
                  {service.summary}
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* About — compact */}
      <Section>
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
          <Reveal direction="right">
            <div className="relative mx-auto max-w-md overflow-hidden rounded-[var(--radius-card)] border border-ink-200/70 bg-surface-sunken shadow-[var(--shadow-lift)] lg:max-w-lg">
              {/* Static import keeps the founder portrait uncropped. */}
              <Image
                src={founderPhoto}
                alt={`${siteConfig.founder}, ${siteConfig.founderRole} of ${siteConfig.legalName}`}
                sizes="(min-width: 1024px) 32rem, (min-width: 640px) 28rem, 92vw"
                loading="lazy"
                placeholder="blur"
                className="h-auto w-full"
              />
            </div>
          </Reveal>

          <div>
            <SectionHeading
              eyebrow="About us"
              title="Built by people who fly these machines"
              description={`${siteConfig.founder}, ${siteConfig.founderRole} of ${siteConfig.legalName}, started AgroSky to bring next-generation UAV systems to Indian agriculture — spraying, surveillance, firefighting and human-flying platforms.`}
              className="mb-5"
            />
            <Reveal delay={80}>
              <p className="text-sm leading-relaxed text-ink-500">
                We believe drones are the future of smart technology. That means stocking the parts
                operators actually break, pricing them honestly, and standing behind the build after
                the sale — not just shipping a box.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <ButtonLink href="/about" variant="outline">
                  Read our story
                </ButtonLink>
                <ButtonLink href="/contact" variant="ghost">
                  Talk to us
                  <ChevronRight className="size-3.5" />
                </ButtonLink>
              </div>
            </Reveal>
          </div>
        </div>

        <Reveal className="mt-12 block sm:mt-16">
          <StatsStrip />
        </Reveal>
      </Section>

      {/* Contact CTA */}
      <Section className="gradient-dark" id="contact">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="Get in touch"
              tone="dark"
              title="Not sure which part fits your build?"
              description="Send us your airframe and payload, and we'll tell you exactly what you need — no upsell."
            />
          </div>

          <Reveal delay={80} className="grid gap-3 sm:grid-cols-2">
            <a
              href={`tel:${siteConfig.contact.phone}`}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 transition-colors hover:border-brand-400/40 hover:bg-white/10"
            >
              <PhoneIcon className="size-5 shrink-0 text-brand-400" />
              <span className="min-w-0">
                <span className="block text-xs text-ink-400">Call us</span>
                <span className="block truncate text-sm font-medium text-white">
                  {siteConfig.contact.phoneDisplay}
                </span>
              </span>
            </a>

            <a
              href={`mailto:${siteConfig.contact.email}`}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 transition-colors hover:border-brand-400/40 hover:bg-white/10"
            >
              <MailIcon className="size-5 shrink-0 text-brand-400" />
              <span className="min-w-0">
                <span className="block text-xs text-ink-400">Email</span>
                <span className="block truncate text-sm font-medium text-white">
                  {siteConfig.contact.email}
                </span>
              </span>
            </a>

            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 sm:col-span-2">
              <PinIcon className="size-5 shrink-0 text-brand-400" />
              <span className="min-w-0">
                <span className="block text-xs text-ink-400">Visit us</span>
                <span className="block text-sm font-medium text-white">
                  {siteConfig.contact.address.street}, {siteConfig.contact.address.locality},{" "}
                  {siteConfig.contact.address.region}
                </span>
              </span>
            </div>

            <ExternalButtonLink
              href={whatsappLink(
                `Hi ${siteConfig.name}, I need help choosing parts for my drone build.`,
              )}
              variant="whatsapp"
              size="lg"
              className="sm:col-span-2"
              fullWidth
            >
              <WhatsAppIcon className="size-5" />
              Message us on WhatsApp
            </ExternalButtonLink>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
