"use client";

import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "./AddToCartButton";
import { WhatsAppIcon } from "@/components/ui/Icons";
import { formatPrice } from "@/lib/format";
import { discountPercent } from "@/lib/products";
import { siteConfig, whatsappLink } from "@/lib/site";
import type { ClientProduct } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useCatalogue } from "@/store/catalogue";

/**
 * Catalogue tile: image with a single corner flag, then category, name, price
 * and the saving. One flag only — stacking NEW, SALE and Bestseller on the same
 * card turns the corner into noise and stops any of them meaning anything.
 */
export function ProductCard({
  product,
  priority = false,
  className,
  /** Grid sizes hint, so Next serves an appropriately sized image. */
  sizes = "(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 47vw",
}: {
  product: ClientProduct;
  priority?: boolean;
  className?: string;
  sizes?: string;
}) {
  const { categoryName, newArrivals } = useCatalogue();
  const enquiryOnly = product.price === null;
  const discount = discountPercent(product);
  const flag = discount !== null ? "SALE" : newArrivals.has(product.slug) ? "NEW" : null;

  return (
    <article
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-xl border border-ink-200/70 bg-white",
        className,
      )}
    >
      <div className="relative aspect-4/3 overflow-hidden bg-surface-sunken">
        <Image
          src={product.image}
          alt={product.alt}
          fill
          sizes={sizes}
          priority={priority}
          loading={priority ? undefined : "lazy"}
          className="object-cover"
        />

        {flag ? (
          <span
            className={cn(
              "absolute left-1.5 top-1.5 rounded-full px-2 py-0.5 text-[0.5625rem] font-bold uppercase tracking-wide text-white",
              flag === "SALE" ? "bg-gold-500" : "gradient-brand",
            )}
          >
            {flag}
          </span>
        ) : null}

        {/* Buying action stays on the artwork so the text block below keeps the
            clean category / name / price rhythm. */}
        <div className="absolute bottom-1.5 right-1.5">
          {enquiryOnly ? (
            <a
              href={whatsappLink(`Hi ${siteConfig.name}, I'd like a quote for the ${product.name}.`)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Enquire about ${product.name} on WhatsApp`}
              className="relative z-20 flex size-8 items-center justify-center rounded-full bg-[#25d366] text-white"
            >
              <WhatsAppIcon className="size-4" />
            </a>
          ) : (
            <AddToCartButton product={product} compact />
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-2 text-center">
        <p className="font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-brand-600">
          {categoryName(product.category)}
        </p>

        <h3 className="mt-1 text-[0.75rem] font-semibold leading-tight text-ink-900">
          <Link
            href={`/products/${product.slug}`}
            className="line-clamp-2-fixed transition-colors before:absolute before:inset-0 before:z-10 hover:text-brand-800"
          >
            {product.name}
          </Link>
        </h3>

        <div className="mt-auto pt-1.5 text-left">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={cn(
                "font-bold text-brand-800",
                enquiryOnly ? "text-[0.6875rem]" : "text-[0.8125rem]",
              )}
            >
              {formatPrice(product.price)}
            </span>
            {discount !== null ? (
              <span className="rounded bg-brand-50 px-1 py-0.5 text-[0.5625rem] font-semibold text-brand-700">
                {discount}%
              </span>
            ) : null}
          </div>

          {product.compareAtPrice ? (
            <p className="text-[0.625rem] text-ink-400 line-through">
              {formatPrice(product.compareAtPrice)}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
