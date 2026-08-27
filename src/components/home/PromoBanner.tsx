"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type UIEvent } from "react";
import { ChevronRight } from "@/components/ui/Icons";
import { formatPrice } from "@/lib/format";
import { discountPercent } from "@/lib/products";
import type { BannerDef, Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { FlameIcon, StarIcon } from "@/components/ui/Icons";

const ADVANCE_MS = 5500;

/**
 * The banner slot at the top of the storefront.
 *
 * Two modes, never mixed. With no banner authored in the admin panel, every
 * slide is a real product on a real offer, so the headline can never advertise
 * a deal the catalogue doesn't have. As soon as one banner is live it takes the
 * slot over entirely — an uploaded image beside a generated gradient slide
 * looks like two different sites.
 *
 * Built on a scroll-snap track: swiping is the browser's own gesture, and
 * autoplay and the dots simply script `scrollTo` on the same element. The
 * active index comes from the scroll event, so nothing measures during render.
 */
export function PromoBanner({
  products,
  banners = [],
}: {
  products: Product[];
  banners?: BannerDef[];
}) {
  // The home page already drops inactive banners before they cross to the
  // client; this keeps the component honest if it is ever reused.
  const live = banners.filter((banner) => banner.active);
  const slides = live.length > 0 ? live.length : products.length;
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback((next: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
  }, []);

  const onScroll = useCallback((event: UIEvent<HTMLDivElement>) => {
    const el = event.currentTarget;
    setIndex(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)));
  }, []);

  useEffect(() => {
    if (paused || slides < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => {
      const el = trackRef.current;
      if (!el || document.hidden) return;
      const current = Math.round(el.scrollLeft / Math.max(1, el.clientWidth));
      const next = current + 1 >= slides ? 0 : current + 1;
      // Wrapping to the first slide is instant; a smooth scroll would visibly
      // rewind through every slide in between.
      el.scrollTo({ left: next * el.clientWidth, behavior: next === 0 ? "auto" : "smooth" });
    }, ADVANCE_MS);

    return () => window.clearInterval(timer);
  }, [paused, slides]);

  if (slides === 0) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Offers"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      className="overflow-hidden rounded-[var(--radius-card)] bg-white shadow-[var(--shadow-card)] lg:mx-auto lg:max-w-3xl"
    >
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
      >
        {live.length > 0
          ? live.map((banner, i) => (
              <BannerSlide
                key={banner.slug}
                banner={banner}
                position={i + 1}
                total={live.length}
              />
            ))
          : products.map((product, i) => (
              <Slide key={product.id} product={product} position={i + 1} total={products.length} />
            ))}
      </div>

      <div
        className="flex items-center justify-center gap-1.5 bg-white py-2"
        role="tablist"
        aria-label="Choose offer"
      >
        {Array.from({ length: slides }, (_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Show slide ${i + 1}`}
            onClick={() => goTo(i)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i === index ? "w-6 bg-brand-700" : "w-1.5 bg-ink-300 hover:bg-ink-400",
            )}
          />
        ))}
      </div>
    </section>
  );
}

function Slide({
  product,
  position,
  total,
}: {
  product: Product;
  position: number;
  total: number;
}) {
  const discount = discountPercent(product);

  return (
    <div
      role="group"
      aria-roledescription="slide"
      aria-label={`${position} of ${total}: ${product.name}`}
      className="gradient-app relative w-full shrink-0 snap-start"
    >
      <div className="flex flex-col items-center justify-center px-5 py-5 text-center sm:py-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/18 px-3 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-white">
          {discount !== null ? (
          <>
            <FlameIcon className="size-3.5" /> Limited time
          </>
        ) : (
          <>
            <StarIcon className="size-3.5" /> Featured
          </>
        )}
        </span>

        <h2 className="mt-2.5 text-xl font-bold uppercase leading-[1.1] tracking-tight text-white sm:text-2xl">
          {discount !== null ? "Sale is live" : product.shortName}
        </h2>

        <p className="mt-1.5 line-clamp-2-fixed max-w-sm text-xs text-white/80 sm:text-sm">
          {discount !== null ? `Up to ${discount}% off on ${product.shortName}` : product.summary}
        </p>

        <p className="mt-1.5 flex items-baseline justify-center gap-2 text-white">
          <span className="text-base font-bold sm:text-lg">{formatPrice(product.price)}</span>
          {product.compareAtPrice ? (
            <span className="text-xs text-white/55 line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          ) : null}
        </p>

        <Link
          href={`/products/${product.slug}`}
          className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-5 text-xs font-semibold text-brand-800"
        >
          Shop Now
          <ChevronRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}

/**
 * An admin-authored slide.
 *
 * Two backgrounds. An image fills the slide and the copy sits in a gradient
 * scrim so it stays readable over any photograph; a flat colour has nothing to
 * carry it, so the copy is centred and the scrim is dropped. `theme` decides
 * whether the copy is light or dark, because a pale colour and white text is
 * the one combination that renders the slide unreadable.
 */
function BannerSlide({
  banner,
  position,
  total,
}: {
  banner: BannerDef;
  position: number;
  total: number;
}) {
  const isImage = banner.background !== "color";
  const light = banner.theme !== "dark";
  const hasCopy = Boolean(
    banner.eyebrow || banner.headline || banner.subline || banner.ctaLabel,
  );
  const label = banner.alt || banner.headline || `Slide ${position}`;

  const content = (
    <>
      {isImage && banner.image ? (
        <Image
          src={banner.image}
          alt={banner.alt ?? ""}
          fill
          // The slot is full width on a phone and a centred column on desktop.
          sizes="(min-width: 1024px) 48rem, 100vw"
          className="object-cover"
          priority={position === 1}
        />
      ) : null}

      {hasCopy ? (
        <div
          className={cn(
            "absolute inset-0 flex flex-col items-center px-5 text-center",
            isImage
              ? "justify-end bg-gradient-to-t from-black/70 via-black/25 to-transparent pb-4"
              : "justify-center py-5",
          )}
        >
          {banner.eyebrow ? (
            <span
              className={cn(
                "inline-flex items-center rounded-full px-3 py-1 text-[0.625rem] font-semibold tracking-[0.12em] uppercase",
                light ? "bg-white/18 text-white" : "bg-ink-900/10 text-ink-800",
              )}
            >
              {banner.eyebrow}
            </span>
          ) : null}

          {banner.headline ? (
            <h2
              className={cn(
                "text-xl leading-[1.1] font-bold tracking-tight uppercase sm:text-2xl",
                banner.eyebrow ? "mt-2.5" : "",
                light ? "text-white" : "text-ink-900",
              )}
            >
              {banner.headline}
            </h2>
          ) : null}

          {banner.subline ? (
            <p
              className={cn(
                "line-clamp-2-fixed mt-1.5 max-w-sm text-xs sm:text-sm",
                light ? "text-white/85" : "text-ink-700",
              )}
            >
              {banner.subline}
            </p>
          ) : null}

          {banner.ctaLabel ? (
            <span
              className={cn(
                "mt-3 inline-flex h-9 items-center gap-1.5 rounded-full px-5 text-xs font-semibold",
                light ? "bg-white text-brand-800" : "bg-ink-900 text-white",
              )}
            >
              {banner.ctaLabel}
              <ChevronRight className="size-3.5" />
            </span>
          ) : null}
        </div>
      ) : null}
    </>
  );

  return (
    // The aspect ratio lives here rather than on the link: an anchor is inline
    // by default, so sizing it directly collapses the slide to nothing.
    <div
      role="group"
      aria-roledescription="slide"
      aria-label={`${position} of ${total}: ${label}`}
      className="relative aspect-[1920/780] w-full shrink-0 snap-start bg-ink-100"
      style={isImage ? undefined : { backgroundColor: banner.backgroundColor }}
    >
      {banner.href ? (
        <Link href={banner.href} className="absolute inset-0 block">
          {content}
        </Link>
      ) : (
        content
      )}
    </div>
  );
}
