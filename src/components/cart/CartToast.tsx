"use client";

import Image from "next/image";
import Link from "next/link";
import { CheckIcon, ChevronRight } from "@/components/ui/Icons";
import { formatPrice } from "@/lib/format";
import { getProduct } from "@/lib/products";
import { useCart } from "@/store/cart";

/**
 * Confirmation for adds made from a card or a slider, where the cart icon is
 * off-screen on a phone and the tap would otherwise feel like nothing happened.
 * `lastAdded` already clears itself after ~1.8s, so this needs no timer.
 */
export function CartToast() {
  const { lastAdded, count } = useCart();
  const product = lastAdded ? getProduct(lastAdded) : undefined;

  if (!product) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--bottom-nav-h)+4.75rem)] z-70 flex justify-center px-4 lg:bottom-6"
    >
      <div
        className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border border-ink-200/70 bg-white p-2.5 shadow-[var(--shadow-lift)]"
        style={{ animation: "toastIn 260ms var(--ease-out-soft)" }}
      >
        <div className="relative size-11 shrink-0 overflow-hidden rounded-xl bg-surface-sunken">
          <Image src={product.image} alt="" fill sizes="44px" className="object-cover" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
            <CheckIcon className="size-3.5" strokeWidth={2.5} />
            Added to cart
          </p>
          <p className="truncate text-[0.8125rem] font-medium text-ink-800">
            {product.shortName} · {formatPrice(product.price)}
          </p>
        </div>

        <Link
          href="/cart"
          className="flex shrink-0 items-center gap-1 rounded-full gradient-brand px-3.5 py-2 text-xs font-semibold text-white"
        >
          Cart ({count})
          <ChevronRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}
