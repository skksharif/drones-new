"use client";

import Image from "next/image";
import { useRef, useState, type PointerEvent } from "react";
import { Badge, StockBadge } from "@/components/ui/Badge";
import { SparkIcon } from "@/components/ui/Icons";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ProductGallery({ product }: { product: Product }) {
  const images = [product.image, ...(product.gallery ?? [])];
  const [active, setActive] = useState(0);
  const [origin, setOrigin] = useState("50% 50%");
  const [zoomed, setZoomed] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);

  // Pointer-tracked zoom origin so the cursor stays over the same detail.
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
  };

  return (
    <div className="lg:sticky lg:top-32">
      <div
        ref={frameRef}
        onPointerMove={onPointerMove}
        onPointerEnter={(e) => e.pointerType === "mouse" && setZoomed(true)}
        onPointerLeave={() => setZoomed(false)}
        className="relative aspect-4/3 overflow-hidden rounded-[var(--radius-card)] border border-ink-200/70 bg-surface-sunken"
      >
        {images.map((src, index) => (
          <Image
            key={src}
            src={src}
            alt={index === 0 ? product.alt : `${product.name} — view ${index + 1}`}
            fill
            sizes="(min-width: 1024px) 46vw, 100vw"
            priority={index === 0}
            className={cn(
              "object-cover transition-[opacity,transform] duration-500 ease-[var(--ease-out-soft)]",
              index === active ? "opacity-100" : "opacity-0",
              zoomed && index === active && "motion-safe:scale-155",
            )}
            style={{ transformOrigin: origin }}
          />
        ))}

        <div className="pointer-events-none absolute inset-x-4 top-4 flex flex-wrap gap-2">
          {product.bestseller ? <Badge tone="gold">Bestseller</Badge> : null}
          {product.featured ? (
            <Badge tone="brand">
              <SparkIcon className="size-3" />
              Featured
            </Badge>
          ) : null}
        </div>

        <div className="pointer-events-none absolute inset-x-4 bottom-4 flex justify-between gap-2">
          <StockBadge availability={product.availability} />
          <span className="hidden rounded-full bg-ink-950/70 px-3 py-1 text-[0.6875rem] font-medium text-white backdrop-blur lg:block">
            Hover to zoom
          </span>
        </div>
      </div>

      {images.length > 1 ? (
        <div className="mt-3 flex gap-2.5 sm:mt-4">
          {images.map((src, index) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Show image ${index + 1} of ${images.length}`}
              aria-current={index === active}
              className={cn(
                "relative aspect-square w-18 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200 sm:w-20",
                index === active
                  ? "border-brand-700 shadow-[var(--shadow-soft)]"
                  : "border-ink-200 opacity-70 hover:opacity-100",
              )}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
