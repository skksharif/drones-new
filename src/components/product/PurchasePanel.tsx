"use client";

import Link from "next/link";
import { useState } from "react";
import { AddToCartButton } from "./AddToCartButton";
import { StockBadge } from "@/components/ui/Badge";
import {
  CheckIcon,
  MinusIcon,
  PhoneIcon,
  PlusIcon,
  ShieldIcon,
  TruckIcon,
  WhatsAppIcon,
} from "@/components/ui/Icons";
import { formatPrice, isPurchasable } from "@/lib/format";
import { siteConfig, whatsappLink } from "@/lib/site";
import type { Product } from "@/lib/types";
import { clamp } from "@/lib/utils";
import { useCart } from "@/store/cart";

export function PurchasePanel({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const { qtyOf, ready } = useCart();
  const inCart = ready ? qtyOf(product.slug) : 0;
  const enquiryOnly = product.price === null;
  const purchasable = isPurchasable(product.availability) && !enquiryOnly;

  const enquiryMessage = whatsappLink(
    `Hi ${siteConfig.name}, I'd like details and a quote for: ${product.name} (${siteConfig.url}/products/${product.slug}).`,
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-3">
        <p className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
          {formatPrice(product.price)}
        </p>
        {product.compareAtPrice ? (
          <p className="pb-1 text-lg text-ink-400 line-through">
            {formatPrice(product.compareAtPrice)}
          </p>
        ) : null}
      </div>

      <p className="text-xs text-ink-400">
        {enquiryOnly
          ? "Configuration-dependent — share your requirement and we'll quote."
          : "Inclusive of applicable taxes. Shipping calculated at checkout."}
      </p>

      <StockBadge availability={product.availability} long />

      {purchasable ? (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-12 items-center rounded-full border border-ink-200 bg-white">
            <button
              type="button"
              onClick={() => setQty((q) => clamp(q - 1, 1, 99))}
              disabled={qty <= 1}
              aria-label="Decrease quantity"
              className="flex size-11 items-center justify-center rounded-full text-ink-600 transition-colors hover:bg-ink-100 disabled:opacity-30"
            >
              <MinusIcon className="size-4" />
            </button>
            <span
              className="w-9 text-center font-mono text-sm font-semibold"
              aria-live="polite"
              aria-label={`Quantity ${qty}`}
            >
              {qty}
            </span>
            <button
              type="button"
              onClick={() => setQty((q) => clamp(q + 1, 1, 99))}
              disabled={qty >= 99}
              aria-label="Increase quantity"
              className="flex size-11 items-center justify-center rounded-full text-ink-600 transition-colors hover:bg-ink-100 disabled:opacity-30"
            >
              <PlusIcon className="size-4" />
            </button>
          </div>

          <AddToCartButton product={product} qty={qty} className="flex-1 min-w-45" />
        </div>
      ) : null}

      {inCart > 0 ? (
        <p className="flex items-center gap-2 text-sm text-emerald-700">
          <CheckIcon className="size-4" />
          {inCart} in your cart ·{" "}
          <Link href="/cart" className="font-semibold underline underline-offset-2">
            View cart
          </Link>
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <a
          href={enquiryMessage}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-12 flex-1 min-w-45 items-center justify-center gap-2 rounded-full bg-[#25d366] px-6 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition-all hover:brightness-105 motion-safe:active:scale-[0.97]"
        >
          <WhatsAppIcon className="size-5" />
          {enquiryOnly ? "Get a quote" : "Enquire on WhatsApp"}
        </a>
        <a
          href={`tel:${siteConfig.contact.phone}`}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-ink-200 bg-white px-6 text-sm font-medium text-ink-700 transition-colors hover:border-brand-700/40 hover:text-brand-800"
        >
          <PhoneIcon className="size-4.5" />
          Call
        </a>
      </div>

      <ul className="grid gap-3 rounded-2xl border border-ink-200/70 bg-surface-muted p-4 sm:grid-cols-2">
        <li className="flex items-start gap-2.5 text-xs text-ink-600">
          <ShieldIcon className="mt-0.5 size-4.5 shrink-0 text-brand-700" />
          Genuine {product.brand} stock with assembly support
        </li>
        <li className="flex items-start gap-2.5 text-xs text-ink-600">
          <TruckIcon className="mt-0.5 size-4.5 shrink-0 text-brand-700" />
          Shipped across {siteConfig.contact.serviceAreas.join(" & ")}
        </li>
      </ul>
    </div>
  );
}
