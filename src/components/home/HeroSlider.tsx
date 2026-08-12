"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type UIEvent } from "react";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { StockBadge } from "@/components/ui/Badge";
import { ChevronRight, WhatsAppIcon } from "@/components/ui/Icons";
import { categoryName } from "@/lib/categories";
import { formatPrice } from "@/lib/format";
import { siteConfig, whatsappLink } from "@/lib/site";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

const ADVANCE_MS = 6000;

/**
 * The storefront's opening slot. It shows real products rather than a static
 * marketing banner, so every pixel above the fold is something that can be put
 * in the cart.
 *
 * Built on a scroll-snap track: swiping is the browser's native gesture, and
 * autoplay, arrows and dots all just script `scrollTo` on the same element.
 * The active index is derived from the scroll event, so nothing has to measure
 * during render.
 */
export function HeroSlider({ products }: { products: Product[] }) {
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
    if (paused || products.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => {
      const el = trackRef.current;
      if (!el || document.hidden) return;
      const current = Math.round(el.scrollLeft / Math.max(1, el.clientWidth));
      const next = current + 1 >= products.length ? 0 : current + 1;
      // Jumping back to the first slide is instant; wrapping with a smooth
      // scroll would rewind visibly through every slide in between.
      el.scrollTo({ left: next * el.clientWidth, behavior: next === 0 ? "auto" : "smooth" });
    }, ADVANCE_MS);

    return () => window.clearInterval(timer);
  }, [paused, products.length]);

  if (products.length === 0) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured products"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      className="relative bg-ink-950"
    >
      {/* The page still needs one real heading; the slides themselves are
          product headings below it. */}
      <h1 className="sr-only">
        {siteConfig.name} — buy agricultural drones, frames, motors and spare parts online
      </h1>

      <div
        ref={trackRef}
        onScroll={onScroll}
        className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
      >
        {products.map((product, i) => (
          <Slide key={product.id} product={product} priority={i === 0} position={i + 1} total={products.length} />
        ))}
      </div>

      {/* Controls */}
      <div className="pointer-events-none absolute inset-x-0 bottom-3 z-20 sm:bottom-5">
        <div className="container-page flex items-center justify-between gap-4">
          <div className="pointer-events-auto flex items-center gap-2" role="tablist" aria-label="Choose slide">
            {products.map((product, i) => (
              <button
                key={product.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Show ${product.shortName}`}
                onClick={() => goTo(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === index ? "w-7 bg-white" : "w-2.5 bg-white/40 hover:bg-white/70",
                )}
              />
            ))}
          </div>

          <div className="pointer-events-auto hidden gap-2 sm:flex">
            <SlideArrow
              direction="prev"
              onClick={() => goTo(index === 0 ? products.length - 1 : index - 1)}
            />
            <SlideArrow
              direction="next"
              onClick={() => goTo(index + 1 >= products.length ? 0 : index + 1)}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function Slide({
  product,
  priority,
  position,
  total,
}: {
  product: Product;
  priority: boolean;
  position: number;
  total: number;
}) {
  const enquiryOnly = product.price === null;

  return (
    <div
      role="group"
      aria-roledescription="slide"
      aria-label={`${position} of ${total}: ${product.name}`}
      className="relative w-full shrink-0 snap-start"
    >
      <div className="absolute inset-0" aria-hidden>
        <Image
          src={product.image}
          alt=""
          fill
          priority={priority}
          loading={priority ? undefined : "lazy"}
          sizes="100vw"
          className="object-cover"
        />
        {/* Two scrims: vertical for phones where the text sits over the image,
            horizontal for wide screens where the art stays visible on the right. */}
        <div className="absolute inset-0 bg-linear-to-t from-ink-950 via-ink-950/80 to-ink-950/45 sm:bg-linear-to-r sm:from-ink-950 sm:via-ink-950/85 sm:to-ink-950/25" />
      </div>

      <div className="container-page relative flex min-h-78 flex-col justify-end py-7 sm:min-h-88 sm:justify-center sm:py-10 lg:min-h-100 lg:py-14">
        <div className="max-w-xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/12 px-2.5 py-1 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-brand-200 backdrop-blur">
              {categoryName(product.category)}
            </span>
            <StockBadge availability={product.availability} />
          </div>

          <h2 className="mt-3 text-[1.5rem] font-bold leading-[1.15] text-white sm:text-[2rem] lg:text-[2.5rem]">
            <Link href={`/products/${product.slug}`} className="hover:underline">
              {product.name}
            </Link>
          </h2>

          <p className="mt-2.5 line-clamp-2-fixed max-w-lg text-[0.8125rem] leading-relaxed text-ink-300 sm:text-[0.9375rem]">
            {product.summary}
          </p>

          <p className="mt-4 flex flex-wrap items-baseline gap-2.5">
            <span className="text-xl font-bold text-white sm:text-2xl">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice ? (
              <span className="text-sm text-ink-400 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            ) : null}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2.5 pb-8 sm:pb-0">
            {enquiryOnly ? (
              <a
                href={whatsappLink(
                  `Hi ${siteConfig.name}, I'd like a quote for the ${product.name}.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-[#25d366] px-6 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition-all hover:brightness-105 motion-safe:active:scale-[0.97]"
              >
                <WhatsAppIcon className="size-4.5" />
                Get a quote
              </a>
            ) : (
              <AddToCartButton product={product} />
            )}

            <Link
              href={`/products/${product.slug}`}
              className="inline-flex h-12 items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-5 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-white/20"
            >
              View details
              <ChevronRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function SlideArrow({
  direction,
  onClick,
}: {
  direction: "prev" | "next";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === "prev" ? "Previous product" : "Next product"}
      className="flex size-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/25"
    >
      <ChevronRight className={cn("size-4.5", direction === "prev" && "rotate-180")} />
    </button>
  );
}
