import Image from "next/image";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink, ExternalButtonLink } from "@/components/ui/Button";
import { CheckIcon, ChevronRight, WhatsAppIcon } from "@/components/ui/Icons";
import { Reveal } from "@/components/ui/Reveal";
import { Section, SectionHeading } from "@/components/ui/Section";
import { absoluteUrl, pageMetadata } from "@/lib/seo";
import { services, siteConfig, whatsappLink } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Drone Services — Crop Spraying, Surveying & Pilot Training",
  description:
    "Drone crop spraying, aerial surveying, firefighting support, pilot training and hands-on drone experience across Andhra Pradesh and Telangana from AgroSky Drone Aspirant.",
  path: "/services",
  image: "/images/services/crop-spraying.jpg",
  keywords: [
    "drone crop spraying service",
    "aerial survey drone India",
    "drone pilot training Andhra Pradesh",
    "firefighting drone service",
    "agriculture drone service Telangana",
  ],
});

function servicesSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${siteConfig.name} Drone Services`,
    url: absoluteUrl("/services"),
    numberOfItems: services.length,
    itemListElement: services.map((service, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Service",
        name: service.title,
        description: service.summary,
        url: absoluteUrl(`/services#${service.slug}`),
        provider: { "@id": `${siteConfig.url}/#organization` },
        areaServed: siteConfig.contact.serviceAreas.map((name) => ({
          "@type": "AdministrativeArea",
          name,
        })),
      },
    })),
  };
}

export default function ServicesPage() {
  return (
    <div className="bg-white">
      <JsonLd id="ld-services" data={servicesSchema()} />

      <div className="border-b border-ink-100 bg-surface-muted">
        <div className="container-page py-6 sm:py-10">
          <Breadcrumbs crumbs={[{ name: "Services", path: "/services" }]} className="mb-4" />
          <h1 className="text-2xl font-bold sm:text-3xl lg:text-4xl">Drone Services</h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-500 sm:text-base">
            We don&apos;t only sell drones — we fly them commercially across{" "}
            {siteConfig.contact.serviceAreas.join(" and ")}. Crop spraying, aerial surveying,
            firefighting support and pilot training, run by the same team that builds our machines.
          </p>
        </div>
      </div>

      <Section>
        <div className="space-y-12 sm:space-y-16 lg:space-y-24">
          {services.map((service, index) => (
            <article
              key={service.slug}
              id={service.slug}
              className="grid items-center gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-14"
            >
              <Reveal
                direction={index % 2 === 0 ? "right" : "left"}
                className={index % 2 === 1 ? "lg:order-2" : undefined}
              >
                <div className="group relative aspect-16/10 overflow-hidden rounded-[var(--radius-card)] border border-ink-200/70 shadow-[var(--shadow-lift)]">
                  <Image
                    src={service.image}
                    alt={`${service.title} — ${service.summary}`}
                    fill
                    priority={index === 0}
                    loading={index === 0 ? undefined : "lazy"}
                    sizes="(min-width: 1024px) 46vw, 92vw"
                    className="object-cover transition-transform duration-700 ease-[var(--ease-out-soft)] motion-safe:group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-ink-950/45 to-transparent" />
                  <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-brand-800 backdrop-blur">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
              </Reveal>

              <Reveal
                delay={80}
                className={index % 2 === 1 ? "lg:order-1" : undefined}
              >
                <h2 className="text-xl font-bold sm:text-2xl lg:text-3xl">{service.title}</h2>
                <p className="mt-3 text-sm font-medium text-brand-800 sm:text-base">
                  {service.summary}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-ink-500 sm:text-[0.9375rem]">
                  {service.detail}
                </p>

                <ul className="mt-5 space-y-2.5">
                  {service.highlights.map((highlight) => (
                    <li key={highlight} className="flex gap-3 text-sm text-ink-600">
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full gradient-brand-soft text-brand-700">
                        <CheckIcon className="size-3.5" strokeWidth={2.5} />
                      </span>
                      {highlight}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex flex-wrap gap-3">
                  <ExternalButtonLink
                    href={whatsappLink(
                      `Hi ${siteConfig.name}, I'd like to enquire about your ${service.title} service.`,
                    )}
                    variant="whatsapp"
                    size="sm"
                  >
                    <WhatsAppIcon className="size-4" />
                    Enquire
                  </ExternalButtonLink>
                  <ButtonLink href="/contact" variant="outline" size="sm">
                    Request a callback
                  </ButtonLink>
                </div>
              </Reveal>
            </article>
          ))}
        </div>
      </Section>

      <Section className="gradient-dark">
        <div className="text-center">
          <SectionHeading
            eyebrow="Ready when you are"
            tone="dark"
            align="center"
            title="Book a service or buy the hardware"
            description="Tell us your acreage, crop and timeline — we'll recommend whether to hire a sortie or build your own platform."
          />
          <Reveal delay={100} className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/contact" size="lg">
              Get in touch
              <ChevronRight className="size-4" />
            </ButtonLink>
            <ButtonLink href="/products" variant="dark" size="lg">
              Shop products
            </ButtonLink>
          </Reveal>
        </div>
      </Section>
    </div>
  );
}
