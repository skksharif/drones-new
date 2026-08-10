import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { ChevronRight, DroneIcon, ShieldIcon, TruckIcon } from "@/components/ui/Icons";
import { Reveal } from "@/components/ui/Reveal";
import { products } from "@/lib/products";
import { siteConfig } from "@/lib/site";

const TRUST = [
  { Icon: DroneIcon, label: `${products.length} products in stock` },
  { Icon: ShieldIcon, label: "Genuine EFT & Hobbywing" },
  { Icon: TruckIcon, label: "Ships across AP & Telangana" },
];

/**
 * Compact product-first banner. Deliberately short so the category rail and
 * product grid are visible almost immediately on a phone.
 */
export function Hero() {
  return (
    <section className="gradient-dark relative overflow-hidden" aria-labelledby="hero-title">
      {/* Backdrop drone visual */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <Image
          src="/images/banners/1.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-25 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-linear-to-r from-ink-950 via-ink-950/85 to-ink-950/40" />
        <div className="absolute -right-24 -top-24 size-96 rounded-full bg-brand-600/25 blur-3xl" />
      </div>

      <div className="container-page relative py-12 sm:py-16 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3.5 py-1.5 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-brand-300 backdrop-blur">
                <span className="size-1.5 rounded-full bg-brand-400" />
                {siteConfig.tagline}
              </span>
            </Reveal>

            <Reveal delay={80}>
              <h1
                id="hero-title"
                className="mt-5 text-3xl font-bold leading-[1.1] text-white sm:text-4xl lg:text-5xl xl:text-[3.4rem]"
              >
                Agricultural drones
                <span className="block bg-linear-to-r from-brand-300 via-brand-400 to-gold-400 bg-clip-text text-transparent">
                  and every part that flies them
                </span>
              </h1>
            </Reveal>

            <Reveal delay={140}>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink-300 sm:text-base">
                Spraying platforms, EFT frames, Hobbywing motors, Pixhawk controllers and
                centrifugal nozzles — stocked, priced and supported by the team that flies them
                across Andhra Pradesh and Telangana.
              </p>
            </Reveal>

            <Reveal delay={200}>
              <div className="mt-7 flex flex-wrap gap-3">
                <ButtonLink href="/products" size="lg">
                  Shop Products
                  <ChevronRight className="size-4" />
                </ButtonLink>
                <ButtonLink href="/category/drones" variant="dark" size="lg">
                  Explore Drones
                </ButtonLink>
              </div>
            </Reveal>

            <Reveal delay={260}>
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
                {TRUST.map(({ Icon, label }) => (
                  <li key={label} className="flex items-center gap-2 text-xs text-ink-400">
                    <Icon className="size-4 text-brand-400" />
                    {label}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          {/* Floating product visual — desktop only, purely decorative */}
          <div className="relative hidden lg:col-span-5 lg:block" aria-hidden>
            <div className="relative mx-auto aspect-square w-full max-w-96 motion-safe:animate-[float_7s_ease-in-out_infinite]">
              <div className="absolute inset-6 rounded-full bg-brand-600/30 blur-3xl" />
              <Image
                src="/images/drones/drone.png"
                alt=""
                fill
                priority
                sizes="(min-width: 1024px) 24rem, 0px"
                className="object-contain drop-shadow-[0_30px_60px_rgba(161,45,51,0.45)]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Soft transition into the light content below */}
      <div className="h-8 bg-linear-to-b from-transparent to-white" aria-hidden />
    </section>
  );
}
