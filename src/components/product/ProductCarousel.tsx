"use client";

import { useCallback, useRef, useState, type UIEvent } from "react";
import { ProductCard } from "./ProductCard";
import { ChevronRight } from "@/components/ui/Icons";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

const EDGE_TOLERANCE = 12;

/**
 * Horizontal product slider used everywhere a static promo banner used to sit.
 *
 * It is a scroll-snap track rather than a transform carousel, so a swipe on
 * touch is the browser's own — no gesture handling, no dropped frames — and the
 * arrows simply script the same scroll for pointer users. Edge state comes from
 * the scroll event, never an effect, so nothing measures during render.
 */
export function ProductCarousel({
  products,
  priorityCount = 0,
  className,
  ariaLabel,
}: {
  products: Product[];
  /** Leading cards marked as LCP candidates. */
  priorityCount?: number;
  className?: string;
  ariaLabel: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const onScroll = useCallback((event: UIEvent<HTMLDivElement>) => {
    const el = event.currentTarget;
    const max = el.scrollWidth - el.clientWidth;
    setAtStart(el.scrollLeft <= EDGE_TOLERANCE);
    setAtEnd(el.scrollLeft >= max - EDGE_TOLERANCE);
  }, []);

  const scrollByCards = useCallback((direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const first = el.firstElementChild as HTMLElement | null;
    // One card plus the gap, or most of the viewport if the track is empty.
    const step = first ? first.offsetWidth + 16 : el.clientWidth * 0.8;
    const cards = Math.max(1, Math.floor(el.clientWidth / step) - 1);
    el.scrollBy({ left: direction * step * cards, behavior: "smooth" });
  }, []);

  if (products.length === 0) return null;

  return (
    <div className={cn("relative", className)}>
      <div
        ref={trackRef}
        onScroll={onScroll}
        role="region"
        aria-label={ariaLabel}
        className={cn(
          "no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pb-1",
          "sm:-mx-6 sm:gap-5 sm:px-6 lg:mx-0 lg:px-0",
        )}
      >
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            priority={index < priorityCount}
            className={cn(
              "w-[62vw] max-w-72 shrink-0 snap-start",
              "sm:w-[42vw] lg:w-[30%] xl:w-[23%]",
            )}
            sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 42vw, 62vw"
          />
        ))}
      </div>

      {/* Arrows are pointer affordances — touch users swipe the track itself. */}
      {products.length > 3 ? (
        <>
          <CarouselArrow
            direction="prev"
            disabled={atStart}
            onClick={() => scrollByCards(-1)}
          />
          <CarouselArrow direction="next" disabled={atEnd} onClick={() => scrollByCards(1)} />
        </>
      ) : null}
    </div>
  );
}

function CarouselArrow({
  direction,
  disabled,
  onClick,
}: {
  direction: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "prev" ? "Previous products" : "Next products"}
      className={cn(
        "absolute top-1/2 z-20 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full lg:flex",
        "border border-ink-200 bg-white/95 text-ink-700 shadow-[var(--shadow-soft)] backdrop-blur",
        "transition-all hover:border-brand-700/40 hover:text-brand-800",
        "disabled:pointer-events-none disabled:opacity-0",
        direction === "prev" ? "-left-5" : "-right-5",
      )}
    >
      <ChevronRight className={cn("size-4.5", direction === "prev" && "rotate-180")} />
    </button>
  );
}
