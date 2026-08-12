"use client";

import { useState } from "react";
import { CartIcon, CheckIcon, PlusIcon } from "@/components/ui/Icons";
import { isPurchasable } from "@/lib/format";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useCart } from "@/store/cart";

export function AddToCartButton({
  product,
  compact = false,
  qty = 1,
  className,
}: {
  product: Product;
  /** Icon-only variant used inside product cards. */
  compact?: boolean;
  qty?: number;
  className?: string;
}) {
  const { add, lastAdded } = useCart();
  const [pressed, setPressed] = useState(false);
  const purchasable = isPurchasable(product.availability) && product.price !== null;
  const justAdded = lastAdded === product.slug;

  const onClick = () => {
    if (!purchasable) return;
    add(product.slug, qty);
    setPressed(true);
    window.setTimeout(() => setPressed(false), 260);
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={!purchasable}
        aria-label={`Add ${product.name} to cart`}
        className={cn(
          // 40px keeps the tap target comfortable on a phone without crowding
          // the price beside it.
          "relative z-20 flex size-10 shrink-0 items-center justify-center rounded-full",
          "gradient-brand text-white shadow-[var(--shadow-soft)]",
          "transition-transform duration-200 ease-[var(--ease-out-soft)]",
          "motion-safe:hover:scale-110 motion-safe:active:scale-90",
          "disabled:pointer-events-none disabled:opacity-40",
          pressed && "motion-safe:scale-90",
          className,
        )}
      >
        {justAdded ? <CheckIcon className="size-4.5" /> : <PlusIcon className="size-4.5" />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!purchasable}
      className={cn(
        "inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold",
        "gradient-brand text-white shadow-[var(--shadow-lift)]",
        "transition-all duration-200 ease-[var(--ease-out-soft)]",
        "hover:shadow-[var(--shadow-glow)] hover:brightness-110 motion-safe:active:scale-[0.97]",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
    >
      {justAdded ? (
        <>
          <CheckIcon className="size-4.5" />
          Added to cart
        </>
      ) : (
        <>
          <CartIcon className="size-4.5" />
          {purchasable ? "Add to cart" : "Currently unavailable"}
        </>
      )}
    </button>
  );
}
