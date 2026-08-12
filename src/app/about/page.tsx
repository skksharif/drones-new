import Image from "next/image";
import founderPhoto from "../../../public/images/brand/founder.jpg";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { StatsStrip } from "@/components/home/StatsStrip";
import { ButtonLink } from "@/components/ui/Button";
import { ChevronRight, DroneIcon, ShieldIcon, SparkIcon } from "@/components/ui/Icons";
import { Reveal } from "@/components/ui/Reveal";
import { Section, SectionHeading } from "@/components/ui/Section";
import { pageMetadata } from "@/lib/seo";
import { courses, siteConfig } from "@/lib/site";

export const metadata = pageMetadata({
  title: "About Us — Next-Gen Drone Technology from Vuyyuru",
  description: `${siteConfig.legalName}, founded by ${siteConfig.founder}, builds agriculture spraying drones, surveillance drones, firefighting drones and human-flying UAV systems. Learn about our mission and team.`,
  path: "/about",
  image: "/images/brand/founder.jpg",
  keywords: [
    "AgroSky Drone Aspirant about",
    "Chandhan Akunuri drone",
    "drone company Andhra Pradesh",
    "UAV manufacturer India",
  ],
});

const VALUES = [
  {
    Icon: DroneIcon,
    title: "Next-generation UAV systems",
    body: "Agriculture spraying, human-flying, surveillance and firefighting drones — engineered to enhance efficiency, safety and sustainability across sectors.",
  },
  {
    Icon: ShieldIcon,
    title: "Genuine parts, honest pricing",
    body: "We stock real EFT and Hobbywing hardware at listed prices, and we tell you when a cheaper part will do the same job.",
  },
  {
    Icon: SparkIcon,
    title: "Support past the sale",
    body: "Assembly, calibration and pilot handover are part of the deal — not an upsell after the box arrives.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-white">
      <div className="border-b border-ink-100 bg-surface-muted">
        <div className="container-page py-6 sm:py-10">
          <Breadcrumbs crumbs={[{ name: "About", path: "/about" }]} className="mb-4" />
          <h1 className="text-2xl font-bold sm:text-3xl lg:text-4xl">
            About {siteConfig.legalName}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-500 sm:text-base">
            {siteConfig.tagline} — pioneering advancements in agriculture spraying drones,
            human-flying drones, surveillance drones and firefighting drones.
          </p>
        </div>
      </div>

      <Section>
        <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-14">
          <Reveal direction="right">
            <div className="relative mx-auto max-w-lg overflow-hidden rounded-[var(--radius-card)] border border-ink-200/70 bg-surface-sunken shadow-[var(--shadow-lift)] lg:max-w-none">
              {/* Static import so Next uses the photo's real dimensions — the
                  portrait must never be cropped. */}
              <Image
                src={founderPhoto}
                alt={`${siteConfig.founder}, ${siteConfig.founderRole} of ${siteConfig.legalName}`}
                priority
                placeholder="blur"
                sizes="(min-width: 1024px) 46vw, (min-width: 640px) 32rem, 92vw"
                className="h-auto w-full"
              />
              <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-ink-950/85 to-transparent p-5 pt-16">
                <p className="text-lg font-semibold text-white">{siteConfig.founder}</p>
                <p className="mt-0.5 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-brand-300">
                  {siteConfig.founderRole}
                </p>
              </div>
            </div>
          </Reveal>

          <div>
            <Reveal>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-brand-700">
                Our story
              </p>
              <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                Welcome to AgroSky Drone Aspirant
              </h2>

              <div className="mt-5 space-y-4 text-sm leading-relaxed text-ink-600 sm:text-[0.9375rem]">
                <p>
                  {siteConfig.founder.toUpperCase()} is the Director &amp; Founder of{" "}
                  {siteConfig.legalName}, and we are proud to introduce cutting-edge drone
                  technologies that are set to revolutionize industries across the globe.
                </p>
                <p>
                  At AgroSky, we are pioneering advancements in agriculture spraying drones,
                  human-flying drones, surveillance drones, firefighting drones, and more. Our
                  mission is to build new generation UAV systems that enhance efficiency, safety and
                  sustainability across multiple sectors — from farming and security to
                  transportation and emergency response.
                </p>
                <p>
                  We believe that drones are the future of smart technology, and at AgroSky we are
                  committed to pushing the boundaries of innovation to create a world where drones
                  empower industries, improve lives, and unlock new possibilities.
                </p>
                <p className="font-medium text-ink-800">
                  Join us as we shape the future of drone technology.
                </p>
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <ButtonLink href="/products">
                  Shop our products
                  <ChevronRight className="size-4" />
                </ButtonLink>
                <ButtonLink href="/contact" variant="outline">
                  Contact us
                </ButtonLink>
              </div>
            </Reveal>
          </div>
        </div>
      </Section>

      <Section className="bg-surface-muted">
        <SectionHeading
          eyebrow="What we stand for"
          title="How we work"
          align="center"
          className="mb-8 sm:mb-10"
        />
        <div className="grid gap-4 sm:gap-5 md:grid-cols-3">
          {VALUES.map((value, index) => (
            <Reveal key={value.title} delay={index * 70}>
              <div className="h-full rounded-[var(--radius-card)] border border-ink-200/70 bg-white p-6 shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
                <div className="flex size-12 items-center justify-center rounded-2xl gradient-brand-soft text-brand-700">
                  <value.Icon className="size-6" />
                </div>
                <h3 className="mt-5 text-base font-semibold">{value.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-ink-500">{value.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section>
        <Reveal>
          <StatsStrip />
        </Reveal>
      </Section>

      <Section className="bg-surface-muted">
        <SectionHeading
          eyebrow="Training"
          title="Courses we run"
          description="Structured programmes for farmers, operators and service providers — from first principles to autonomous operations."
          className="mb-8"
        />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {courses.map((course, index) => (
            <Reveal key={course.title} delay={index * 60}>
              <div className="group h-full overflow-hidden rounded-[var(--radius-card)] border border-ink-200/70 bg-white shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
                <div className="relative aspect-4/3 overflow-hidden bg-surface-sunken">
                  <Image
                    src={course.image}
                    alt={`${course.title} course — ${course.description}`}
                    fill
                    sizes="(min-width: 1024px) 22vw, 45vw"
                    loading="lazy"
                    className="object-cover transition-transform duration-700 ease-[var(--ease-out-soft)] motion-safe:group-hover:scale-107"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold sm:text-[0.9375rem]">{course.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-ink-500">
                    {course.description}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>
    </div>
  );
}
