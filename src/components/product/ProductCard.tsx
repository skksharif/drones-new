"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useRef, useState, type PointerEvent } from "react";
import { AddToCartButton } from "./AddToCartButton";
import { Badge, StockBadge } from "@/components/ui/Badge";
import { SparkIcon, WhatsAppIcon } from "@/components/ui/Icons";
import { categoryName } from "@/lib/categories";
import { formatPrice } from "@/lib/format";
import { siteConfig, whatsappLink } from "@/lib/site";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

const MAX_TILT = 6;

export function ProductCard({
  product,
  priority = false,
  className,
  /** Grid sizes hint, so Next serves an appropriately sized image. */
  sizes = "(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 47vw",
}: {
  product: Product;
  priority?: boolean;
  className?: string;
  sizes?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState<{ x: number; y: number } | null>(null);

  // Pointer-driven 3D tilt. Skipped for touch (no hover) and for users who
  // prefer reduced motion; falls back to a plain lift on hover.
  const onPointerMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const node = cardRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: -py * MAX_TILT * 2, y: px * MAX_TILT * 2 });
  }, []);

  const enquiryOnly = product.price === null;

  return (
    <div className={cn("perspective-card", className)}>
      <article
        ref={cardRef}
        onPointerMove={onPointerMove}
        onPointerLeave={() => setTilt(null)}
        className={cn(
          "group/card relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)]",
          "border border-ink-200/70 bg-white",
          "shadow-[var(--shadow-soft)] transition-shadow duration-300 hover:shadow-[var(--shadow-lift)]",
        )}
        style={{
          transform: tilt
            ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translate3d(0,-4px,0)`
            : undefined,
          transition: "transform 380ms var(--ease-out-soft), box-shadow 300ms var(--ease-out-soft)",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Image */}
        <Link
          href={`/products/${product.slug}`}
          tabIndex={-1}
          aria-hidden
          className="relative block aspect-4/3 overflow-hidden bg-surface-sunken"
        >
          <Image
            src={product.image}
            alt={product.alt}
            fill
            sizes={sizes}
            priority={priority}
            loading={priority ? undefined : "lazy"}
            className={cn(
              "object-cover transition-transform duration-700 ease-[var(--ease-out-soft)]",
              "motion-safe:group-hover/card:scale-107",
            )}
          />

          {/* Gradient scrim keeps badges legible on light product shots. */}
          <div
            className="pointer-events-none absolute inset-0 bg-linear-to-b from-ink-950/25 via-transparent to-transparent opacity-70"
            aria-hidden
          />

          <div className="pointer-events-none absolute inset-x-2 top-2 flex flex-wrap items-start gap-1.5">
            {product.bestseller ? (
              <Badge tone="gold" className="shadow-sm">
                Bestseller
              </Badge>
            ) : null}
            {product.featured && !product.bestseller ? (
              <Badge tone="brand" className="shadow-sm">
                <SparkIcon className="size-3" />
                Featured
              </Badge>
            ) : null}
          </div>

          <div className="pointer-events-none absolute inset-x-2 bottom-2 flex justify-end">
            <StockBadge availability={product.availability} className="shadow-sm" />
          </div>
        </Link>

        {/* Body */}
        <div className="flex flex-1 flex-col p-3 sm:p-4" style={{ transform: "translateZ(28px)" }}>
          <p className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-brand-700">
            {categoryName(product.category)}
          </p>

          <h3 className="mt-1.5 text-[0.8125rem] font-semibold leading-snug sm:text-[0.9375rem]">
            <Link
              href={`/products/${product.slug}`}
              className="line-clamp-2-fixed transition-colors before:absolute before:inset-0 before:z-10 hover:text-brand-800"
            >
              {product.name}
            </Link>
          </h3>

          <p className="mt-1 text-[0.6875rem] text-ink-400 sm:text-xs">
            {product.brand} · {product.type}
          </p>

          <div className="mt-3 flex items-end justify-between gap-2 pt-1">
            <div className="min-w-0">
              <p
                className={cn(
                  "truncate font-semibold text-ink-900",
                  enquiryOnly ? "text-sm sm:text-[0.9375rem]" : "text-base sm:text-lg",
                )}
              >
                {formatPrice(product.price)}
              </p>
              {product.compareAtPrice ? (
                <p className="text-xs text-ink-400 line-through">
                  {formatPrice(product.compareAtPrice)}
                </p>
              ) : null}
            </div>

            {enquiryOnly ? (
              <a
                href={whatsappLink(
                  `Hi ${siteConfig.name}, I'd like a quote for the ${product.name}.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(event) => event.stopPropagation()}
                aria-label={`Enquire about ${product.name} on WhatsApp`}
                className="relative z-20 flex size-9 shrink-0 items-center justify-center rounded-full bg-[#25d366] text-white transition-transform motion-safe:hover:scale-110 motion-safe:active:scale-95"
              >
                <WhatsAppIcon className="size-4.5" />
              </a>
            ) : (
              <AddToCartButton product={product} compact />
            )}
          </div>

          <Link
            href={`/products/${product.slug}`}
            tabIndex={-1}
            aria-hidden
            className="mt-3 hidden items-center justify-center rounded-full border border-ink-200 py-2 text-xs font-medium text-ink-700 transition-colors group-hover/card:border-brand-700/40 group-hover/card:bg-brand-50 group-hover/card:text-brand-800 sm:flex"
          >
            View product
          </Link>
        </div>
      </article>
    </div>
  );
}
