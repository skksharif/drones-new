"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { TagIcon } from "@/components/ui/Icons";
import { formatPrice } from "@/lib/format";
import { discountPercent } from "@/lib/products";
import type { ClientProduct } from "@/lib/types";

/** How long each card sits before the rail advances, in milliseconds. */
const STEP_MS = 3000;

/**
 * The Hot Deals rail.
 *
 * A real horizontal scroll container, not a transform track, so a swipe on
 * touch is the browser's own and the auto-advance is just a scripted
 * `scrollBy`. The list renders twice and the position wraps by exactly one
 * copy, which is what makes the loop endless — at the wrap point the two copies
 * are pixel-identical, so the instant jump back is invisible.
 *
 * The period is measured from the DOM, not derived from `scrollWidth / 2`: the
 * flex gap sits *between* the copies but not after the last card, so half the
 * scroll width is one gap short and the loop would drift a few pixels a lap.
 *
 * Pause state lives in a ref — this advances on a timer, so there is nothing
 * for a re-render to contribute.
 */
export function HotDealsRail({
  products,
  href = "/products",
}: {
  products: ClientProduct[];
  href?: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const paused = useRef(false);
  // Mouse drag-to-scroll. Touch already scrolls natively, so this is only
  // wired up for a mouse pointer.
  const drag = useRef({ active: false, startX: 0, startLeft: 0, moved: 0 });

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let period = 0;
    let stride = 0;
    let loops = false;

    /**
     * One copy's width and one card's width, plus the duplicate's visibility.
     *
     * When a single copy already fits the container there is nothing to loop
     * through, and leaving the second copy on screen would just show the list
     * twice — so it is hidden until the rail is actually wider than its box.
     *
     * Reveal before measuring: a hidden duplicate reports `offsetLeft` 0, so
     * measuring around one would latch the rail into the non-looping state and
     * it could never come back when the container shrank. Reading `offsetLeft`
     * forces the layout, so nothing paints in between.
     *
     * The observer watches the section, not the track. This writes `hidden`
     * onto the track's own children, so observing the track would feed its own
     * mutations back in — that deadlocked the page once already.
     */
    const sync = () => {
      const kids = track.children;
      const copy = kids.length / 2;

      for (let i = copy; i < kids.length; i += 1) (kids[i] as HTMLElement).hidden = false;

      const first = kids[0] as HTMLElement | undefined;
      const next = kids[1] as HTMLElement | undefined;
      const second = kids[copy] as HTMLElement | undefined;
      period = first && second ? second.offsetLeft - first.offsetLeft : 0;
      stride = first && next ? next.offsetLeft - first.offsetLeft : 0;
      loops = period > track.clientWidth;

      if (!loops) {
        for (let i = copy; i < kids.length; i += 1) (kids[i] as HTMLElement).hidden = true;
        track.scrollLeft = 0;
      }
    };

    sync();

    const observer = new ResizeObserver(sync);
    if (sectionRef.current) observer.observe(sectionRef.current);
    // A rotation that leaves the section's box unchanged still needs a
    // re-measure.
    window.addEventListener("resize", sync);

    const still = window.matchMedia("(prefers-reduced-motion: reduce)");

    const advance = () => {
      if (!loops || stride <= 0) return;
      if (paused.current || drag.current.active) return;
      // Someone who prefers less motion still gets a static, scrollable rail.
      if (still.matches) return;

      // Normalise first, instantly: a smooth scroll all the way back to zero
      // would read as the rail rewinding rather than looping.
      if (track.scrollLeft >= period) track.scrollLeft -= period;
      track.scrollBy({ left: stride, behavior: "smooth" });
    };

    const timer = window.setInterval(advance, STEP_MS);

    return () => {
      window.clearInterval(timer);
      observer.disconnect();
      window.removeEventListener("resize", sync);
    };
  }, [products]);

  if (products.length === 0) return null;

  const hold = () => {
    paused.current = true;
  };
  const release = () => {
    paused.current = false;
  };

  return (
    <section
      ref={sectionRef}
      aria-label="Hot deals"
      className="gradient-brand relative overflow-hidden rounded-[var(--radius-card)] px-3 py-3 shadow-[var(--shadow-card)] sm:px-4"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-1.5 text-sm font-bold tracking-wide text-white uppercase">
          <TagIcon className="size-4" />
          Hot Deals
        </h2>
        <Link
          href={href}
          className="shrink-0 rounded-full bg-white/15 px-2.5 py-1 text-[0.6875rem] font-medium text-white transition-colors hover:bg-white/25"
        >
          View all →
        </Link>
      </div>

      <div
        ref={trackRef}
        className="no-scrollbar mt-2.5 flex gap-2.5 overflow-x-auto overscroll-x-contain"
        onPointerEnter={hold}
        onPointerLeave={() => {
          drag.current.active = false;
          release();
        }}
        onFocusCapture={hold}
        onBlurCapture={release}
        onTouchStart={hold}
        onTouchEnd={release}
        onTouchCancel={release}
        onPointerDown={(event) => {
          if (event.pointerType !== "mouse") return;
          const el = event.currentTarget;
          drag.current = { active: true, startX: event.clientX, startLeft: el.scrollLeft, moved: 0 };
        }}
        onPointerMove={(event) => {
          if (!drag.current.active) return;
          const delta = event.clientX - drag.current.startX;
          drag.current.moved = Math.max(drag.current.moved, Math.abs(delta));
          event.currentTarget.scrollLeft = drag.current.startLeft - delta;
        }}
        onPointerUp={() => {
          drag.current.active = false;
        }}
        onClickCapture={(event) => {
          // A drag that ended on a card must not follow its link.
          if (drag.current.moved > 5) {
            event.preventDefault();
            event.stopPropagation();
          }
          drag.current.moved = 0;
        }}
      >
        {/* Rendered twice for the wrap. The second copy is decorative. */}
        {[0, 1].map((copy) =>
          products.map((product) => (
            <DealCard
              key={`${copy}-${product.slug}`}
              product={product}
              aria-hidden={copy === 1 || undefined}
              tabIndex={copy === 1 ? -1 : undefined}
            />
          )),
        )}
      </div>
    </section>
  );
}

function DealCard({
  product,
  ...rest
}: { product: ClientProduct } & Omit<React.ComponentProps<typeof Link>, "href" | "children">) {
  const off = discountPercent(product);

  return (
    <Link
      href={`/products/${product.slug}`}
      draggable={false}
      className="group flex w-40 shrink-0 flex-col overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md sm:w-44"
      {...rest}
    >
      <span className="relative block aspect-4/3 w-full overflow-hidden bg-surface-sunken">
        <Image
          src={product.image}
          alt=""
          fill
          sizes="(min-width: 640px) 176px, 160px"
          className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
          draggable={false}
        />
        {off ? (
          <span className="absolute top-1.5 left-1.5 rounded-full bg-gold-400 px-1.5 py-0.5 text-[0.625rem] leading-none font-bold text-ink-900">
            {off}% OFF
          </span>
        ) : null}
      </span>

      <span className="flex flex-1 flex-col p-2.5">
        {/* Clamped at two lines so a long name cannot stretch the card, but
            with no minimum height — reserving the second line left a visible
            hole under every name short enough to fit on one. */}
        <span className="line-clamp-2-fixed text-[0.6875rem] leading-tight font-medium text-ink-900">
          {product.name}
        </span>
        <span className="mt-1 flex items-baseline gap-1.5">
          <span className="text-sm font-bold text-brand-800">{formatPrice(product.price)}</span>
          {product.compareAtPrice ? (
            <s className="text-[0.625rem] text-ink-400">{formatPrice(product.compareAtPrice)}</s>
          ) : null}
        </span>
      </span>
    </Link>
  );
}
