"use client";

import Image from "next/image";
import Link from "next/link";
import { ButtonLink, ExternalButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  CartIcon,
  ChevronRight,
  MinusIcon,
  PhoneIcon,
  PlusIcon,
  ShieldIcon,
  TrashIcon,
  TruckIcon,
  WhatsAppIcon,
} from "@/components/ui/Icons";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatPrice } from "@/lib/format";
import { siteConfig, whatsappLink } from "@/lib/site";
import { useCart, type ResolvedLine } from "@/store/cart";
import { useCatalogue } from "@/store/catalogue";

/**
 * The cart is a shortlist, not an order. Nothing is charged here and there is
 * no checkout: the list exists so a customer can gather what they need and hand
 * the whole thing to us on WhatsApp in one message.
 */
export function CartView() {
  const { lines, subtotal, count, enquiryCount, ready, setQty, remove, clear } = useCart();

  if (!ready) return <CartSkeleton />;

  if (lines.length === 0) {
    return (
      <EmptyState
        icon={<CartIcon className="size-6" />}
        title="Your cart is empty"
        description="Add the drones, frames, motors or spray hardware you're interested in — then send us the whole cart on WhatsApp in one go."
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

  const enquiryLink = whatsappLink(
    `Hi ${siteConfig.name}, I'd like a quote for these items:\n\n${lines
      .map((line) => `• ${line.product.name} × ${line.qty} — ${formatPrice(line.product.price)}`)
      .join("\n")}\n\nListed total (priced items): ${formatPrice(
      subtotal,
    )}\n\nPlease confirm availability, final pricing and delivery.`,
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
      <aside className="mt-8 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:mt-0">
        <div className="rounded-[var(--radius-card)] border border-ink-200/70 bg-white p-5 shadow-[var(--shadow-soft)] sm:p-6">
          <h2 className="text-base font-semibold">Cart summary</h2>

          <dl className="mt-4 space-y-2.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-500">Items</dt>
              <dd className="font-medium text-ink-900">{count}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-500">Listed total</dt>
              <dd className="font-semibold text-ink-900">{formatPrice(subtotal)}</dd>
            </div>
          </dl>

          <p className="mt-3 rounded-xl bg-surface-muted p-3 text-xs leading-relaxed text-ink-500">
            {enquiryCount > 0 ? (
              <>
                {enquiryCount} item{enquiryCount === 1 ? " is" : "s are"} priced on enquiry, so the
                listed total covers the rest. We confirm final pricing, freight and availability on
                WhatsApp.
              </>
            ) : (
              <>
                Listed prices only — we confirm final pricing, freight and availability on WhatsApp
                before anything is agreed.
              </>
            )}
          </p>

          <ExternalButtonLink href={enquiryLink} variant="whatsapp" fullWidth size="lg" className="mt-4">
            <WhatsAppIcon className="size-5" />
            Enquire on WhatsApp
          </ExternalButtonLink>

          <a
            href={`tel:${siteConfig.contact.phone}`}
            className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-full border border-ink-200 bg-white text-sm font-medium text-ink-700 transition-colors hover:border-brand-700/40 hover:text-brand-800"
          >
            <PhoneIcon className="size-4.5" />
            Call {siteConfig.contact.phoneDisplay}
          </a>

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

      {/* Phone bar — the summary is a long scroll away, so the enquiry CTA
          follows the user up the page. It sits above the bottom tab bar. */}
      <div className="fixed inset-x-0 bottom-[var(--bottom-nav-h)] z-40 border-t border-ink-100 bg-white/95 px-4 py-3 shadow-[0_-6px_20px_-12px_rgb(16_17_22/0.3)] backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-ink-400">
              {count} {count === 1 ? "item" : "items"}
            </p>
            <p className="truncate text-base font-bold leading-tight">{formatPrice(subtotal)}</p>
          </div>
          <ExternalButtonLink
            href={enquiryLink}
            variant="whatsapp"
            className="ml-auto flex-1 max-w-56"
          >
            <WhatsAppIcon className="size-4.5" />
            Enquire
          </ExternalButtonLink>
        </div>
      </div>
      {/* Spacer so the last row is never hidden behind that bar. */}
      <div className="h-20 lg:hidden" aria-hidden />
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
  const { categoryName } = useCatalogue();
  const { product, qty, lineTotal } = line;

  return (
    <li className="flex gap-3 rounded-[var(--radius-card)] border border-ink-200/70 bg-white p-3 transition-shadow hover:shadow-[var(--shadow-soft)] sm:gap-4 sm:p-4">
      <Link
        href={`/products/${product.slug}`}
        className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-surface-sunken sm:size-24"
      >
        <Image src={product.image} alt={product.alt} fill sizes="96px" className="object-cover" />
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
        <p className="mt-0.5 text-xs text-ink-400">{formatPrice(product.price)} each</p>

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
