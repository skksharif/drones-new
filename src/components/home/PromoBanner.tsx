"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type UIEvent } from "react";
import { ChevronRight } from "@/components/ui/Icons";
import { formatPrice } from "@/lib/format";
import { discountPercent } from "@/lib/products";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

const ADVANCE_MS = 5500;

/**
 * The banner slot at the top of the storefront. Every slide is a real product
 * on a real offer rather than a painted-on promo, so the headline can never
 * advertise a deal the catalogue doesn't have.
 *
 * Built on a scroll-snap track: swiping is the browser's own gesture, and
 * autoplay and the dots simply script `scrollTo` on the same element. The
 * active index comes from the scroll event, so nothing measures during render.
 */
export function PromoBanner({ products }: { products: Product[] }) {
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
      // Wrapping to the first slide is instant; a smooth scroll would visibly
      // rewind through every slide in between.
      el.scrollTo({ left: next * el.clientWidth, behavior: next === 0 ? "auto" : "smooth" });
    }, ADVANCE_MS);

    return () => window.clearInterval(timer);
  }, [paused, products.length]);

  if (products.length === 0) return null;

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
        {products.map((product, i) => (
          <Slide key={product.id} product={product} position={i + 1} total={products.length} />
        ))}
      </div>

      <div
        className="flex items-center justify-center gap-1.5 bg-white py-2"
        role="tablist"
        aria-label="Choose offer"
      >
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
          {discount !== null ? <>🔥 Limited time</> : <>⭐ Featured</>}
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
