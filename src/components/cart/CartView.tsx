"use client";

import Image from "next/image";
import Link from "next/link";
import { Button, ButtonLink, ExternalButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  CartIcon,
  ChevronRight,
  MinusIcon,
  PlusIcon,
  ShieldIcon,
  TrashIcon,
  TruckIcon,
  WhatsAppIcon,
} from "@/components/ui/Icons";
import { Skeleton } from "@/components/ui/Skeleton";
import { categoryName } from "@/lib/categories";
import { formatPrice } from "@/lib/format";
import { siteConfig, whatsappLink } from "@/lib/site";
import { useCart, type ResolvedLine } from "@/store/cart";

export function CartView() {
  const { lines, subtotal, count, enquiryCount, ready, setQty, remove, clear } = useCart();

  if (!ready) return <CartSkeleton />;

  if (lines.length === 0) {
    return (
      <EmptyState
        icon={<CartIcon className="size-6" />}
        title="Your cart is empty"
        description="Browse our drones, frames, motors and spray hardware — or tell us what you need and we'll source it."
        action={
          <>
            <ButtonLink href="/products">
              Shop all products
              <ChevronRight className="size-4" />
            </ButtonLink>
            <ButtonLink href="/category/drones" variant="outline">
              Explore drones
            </ButtonLink>
          </>
        }
      />
    );
  }

  const quoteMessage = whatsappLink(
    `Hi ${siteConfig.name}, I'd like to order:\n\n${lines
      .map((l) => `• ${l.product.name} × ${l.qty} — ${formatPrice(l.product.price)}`)
      .join("\n")}\n\nSubtotal (priced items): ${formatPrice(subtotal)}`,
  );

  return (
    <div className="lg:grid lg:grid-cols-[1fr_22rem] lg:items-start lg:gap-10">
      <div className="min-w-0">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-ink-500">
            <span className="font-semibold text-ink-900">{count}</span>{" "}
            {count === 1 ? "item" : "items"} in your cart
          </p>
          <button
            type="button"
            onClick={clear}
            className="text-xs font-semibold text-ink-500 underline-offset-2 transition-colors hover:text-brand-700 hover:underline"
          >
            Clear cart
          </button>
        </div>

        <ul className="space-y-3">
          {lines.map((line) => (
            <CartRow
              key={line.slug}
              line={line}
              onQty={(qty) => setQty(line.slug, qty)}
              onRemove={() => remove(line.slug)}
            />
          ))}
        </ul>

        <Link
          href="/products"
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 underline-offset-4 hover:underline"
        >
          Continue shopping
          <ChevronRight className="size-3.5" />
        </Link>
      </div>

      {/* Summary */}
      <aside className="mt-8 lg:sticky lg:top-32 lg:mt-0">
        <div className="rounded-[var(--radius-card)] border border-ink-200/70 bg-white p-5 shadow-[var(--shadow-soft)] sm:p-6">
          <h2 className="text-base font-semibold">Order summary</h2>

          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-500">Subtotal</dt>
              <dd className="font-semibold text-ink-900">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-500">Shipping</dt>
              <dd className="text-ink-500">Calculated at checkout</dd>
            </div>
            {enquiryCount > 0 ? (
              <div className="flex justify-between gap-4">
                <dt className="text-ink-500">Quote items</dt>
                <dd className="text-right text-xs text-ink-500">
                  {enquiryCount} item{enquiryCount === 1 ? "" : "s"} priced on enquiry
                </dd>
              </div>
            ) : null}
          </dl>

          <div className="mt-5 flex items-end justify-between border-t border-ink-100 pt-5">
            <span className="text-sm font-semibold">Total</span>
            <span className="text-2xl font-bold tracking-tight">{formatPrice(subtotal)}</span>
          </div>

          <Button fullWidth size="lg" className="mt-5" disabled>
            Proceed to checkout
          </Button>
          <p className="mt-2 text-center text-xs text-ink-400">
            Online checkout is coming soon — confirm your order on WhatsApp or by phone.
          </p>

          <ExternalButtonLink
            href={quoteMessage}
            variant="whatsapp"
            fullWidth
            className="mt-3"
          >
            <WhatsAppIcon className="size-4.5" />
            Confirm order on WhatsApp
          </ExternalButtonLink>

          <ul className="mt-6 space-y-3 border-t border-ink-100 pt-5">
            <li className="flex items-start gap-2.5 text-xs text-ink-500">
              <ShieldIcon className="mt-0.5 size-4 shrink-0 text-brand-700" />
              Genuine parts with assembly and calibration support
            </li>
            <li className="flex items-start gap-2.5 text-xs text-ink-500">
              <TruckIcon className="mt-0.5 size-4 shrink-0 text-brand-700" />
              Shipped across {siteConfig.contact.serviceAreas.join(" & ")}
            </li>
          </ul>
        </div>
      </aside>
    </div>
  );
}

function CartRow({
  line,
  onQty,
  onRemove,
}: {
  line: ResolvedLine;
  onQty: (qty: number) => void;
  onRemove: () => void;
}) {
  const { product, qty, lineTotal } = line;

  return (
    <li className="flex gap-3 rounded-[var(--radius-card)] border border-ink-200/70 bg-white p-3 transition-shadow hover:shadow-[var(--shadow-soft)] sm:gap-4 sm:p-4">
      <Link
        href={`/products/${product.slug}`}
        className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-surface-sunken sm:size-24"
      >
        <Image
          src={product.image}
          alt={product.alt}
          fill
          sizes="96px"
          className="object-cover"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <p className="font-mono text-[0.625rem] uppercase tracking-[0.12em] text-brand-700">
          {categoryName(product.category)}
        </p>
        <h3 className="mt-0.5 text-sm font-semibold leading-snug">
          <Link href={`/products/${product.slug}`} className="hover:text-brand-800">
            {product.name}
          </Link>
        </h3>
        <p className="mt-0.5 text-xs text-ink-400">
          {formatPrice(product.price)} each
        </p>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
          <div className="flex h-9 items-center rounded-full border border-ink-200">
            <button
              type="button"
              onClick={() => onQty(qty - 1)}
              aria-label={`Decrease quantity of ${product.name}`}
              className="flex size-8 items-center justify-center rounded-full text-ink-600 transition-colors hover:bg-ink-100"
            >
              <MinusIcon className="size-3.5" />
            </button>
            <span className="w-8 text-center font-mono text-xs font-semibold">{qty}</span>
            <button
              type="button"
              onClick={() => onQty(qty + 1)}
              disabled={qty >= 99}
              aria-label={`Increase quantity of ${product.name}`}
              className="flex size-8 items-center justify-center rounded-full text-ink-600 transition-colors hover:bg-ink-100 disabled:opacity-30"
            >
              <PlusIcon className="size-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-bold">
              {lineTotal === null ? "On request" : formatPrice(lineTotal)}
            </span>
            <button
              type="button"
              onClick={onRemove}
              aria-label={`Remove ${product.name} from cart`}
              className="flex size-8 items-center justify-center rounded-full text-ink-400 transition-colors hover:bg-brand-50 hover:text-brand-700"
            >
              <TrashIcon className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}

function CartSkeleton() {
  return (
    <div className="lg:grid lg:grid-cols-[1fr_22rem] lg:items-start lg:gap-10">
      <div className="space-y-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={i}
            className="flex gap-4 rounded-[var(--radius-card)] border border-ink-200/70 bg-white p-4"
          >
            <Skeleton className="size-20 shrink-0 rounded-xl sm:size-24" />
            <div className="flex-1 space-y-2.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-9 w-32 rounded-full" />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 rounded-[var(--radius-card)] border border-ink-200/70 bg-white p-6 lg:mt-0">
        <Skeleton className="h-5 w-32" />
        <div className="mt-5 space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-12 w-full rounded-full" />
        </div>
      </div>
    </div>
  );
}
