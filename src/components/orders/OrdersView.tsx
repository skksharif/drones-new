"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { CartIcon, CheckIcon, ChevronRight, TruckIcon } from "@/components/ui/Icons";
import { Skeleton } from "@/components/ui/Skeleton";
import { PAYMENT_METHODS, type Order } from "@/lib/checkout";
import { formatPrice } from "@/lib/format";
import { getProduct } from "@/lib/products";
import { cn } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { useOrders } from "@/store/orders";

const dateFormat = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export function OrdersView() {
  const { orders, ready } = useOrders();

  if (!ready) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 2 }, (_, i) => (
          <Skeleton key={i} className="h-44 rounded-[var(--radius-card)]" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={<CartIcon className="size-6" />}
        title="No orders yet"
        description="Once you place an order it shows up here with its reference number, items and delivery address."
        action={
          <ButtonLink href="/products">
            Start shopping
            <ChevronRight className="size-4" />
          </ButtonLink>
        }
      />
    );
  }

  return (
    <ul className="space-y-4">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </ul>
  );
}

function OrderCard({ order }: { order: Order }) {
  const { add } = useCart();
  const router = useRouter();
  const method = PAYMENT_METHODS.find((m) => m.value === order.payment);

  /** Puts everything still in the catalogue back in the cart. */
  const reorder = () => {
    for (const item of order.items) {
      if (getProduct(item.slug)) add(item.slug, item.qty);
    }
    router.push("/cart");
  };

  return (
    <li className="overflow-hidden rounded-[var(--radius-card)] border border-ink-200/70 bg-white shadow-[var(--shadow-soft)]">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-ink-100 bg-surface-muted px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <p className="font-mono text-sm font-semibold tracking-[0.06em]">{order.id}</p>
          <p className="mt-0.5 text-xs text-ink-500">
            {dateFormat.format(new Date(order.placedAt))}
          </p>
        </div>
        <StatusPill status={order.status} />
      </div>

      <ul className="divide-y divide-ink-100">
        {order.items.map((item) => (
          <li key={item.slug} className="flex items-center gap-3 px-4 py-3 sm:px-5">
            <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-surface-sunken">
              <Image src={item.image} alt="" fill sizes="56px" className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <Link
                href={`/products/${item.slug}`}
                className="line-clamp-2-fixed text-sm font-medium text-ink-800 hover:text-brand-800"
              >
                {item.name}
              </Link>
              <p className="mt-0.5 text-xs text-ink-400">
                Qty {item.qty} · {formatPrice(item.unitPrice)}
              </p>
            </div>
            <p className="shrink-0 text-sm font-semibold">
              {item.unitPrice === null ? "On request" : formatPrice(item.unitPrice * item.qty)}
            </p>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 px-4 py-3.5 sm:px-5">
        <div className="text-xs text-ink-500">
          <p>
            <span className="font-semibold text-ink-900">{formatPrice(order.totals.total)}</span>{" "}
            · {method?.label}
          </p>
          <p className="mt-0.5 truncate">
            {order.customer.city}, {order.customer.state} {order.customer.pincode}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={reorder}>
          Order again
        </Button>
      </div>
    </li>
  );
}

function StatusPill({ status }: { status: Order["status"] }) {
  const shipped = status === "shipped" || status === "delivered";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold capitalize",
        shipped ? "bg-emerald-50 text-emerald-700" : "bg-brand-50 text-brand-800",
      )}
    >
      {shipped ? <TruckIcon className="size-3.5" /> : <CheckIcon className="size-3.5" />}
      {status}
    </span>
  );
}
