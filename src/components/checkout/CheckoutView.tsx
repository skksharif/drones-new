"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";
import { TotalsList } from "./TotalsList";
import { Button, ButtonLink, ExternalButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  CartIcon,
  CheckIcon,
  ChevronRight,
  ShieldIcon,
  TruckIcon,
  WhatsAppIcon,
} from "@/components/ui/Icons";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  INDIAN_STATES,
  PAYMENT_METHODS,
  computeTotals,
  createOrderId,
  emptyCustomer,
  validateCustomer,
  type CustomerErrors,
  type Order,
  type OrderCustomer,
  type PaymentMethod,
} from "@/lib/checkout";
import { formatPrice } from "@/lib/format";
import { siteConfig, whatsappLink } from "@/lib/site";
import { cn } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { ordersStore } from "@/store/orders";

export function CheckoutView() {
  const { lines, subtotal, count, ready, clear } = useCart();

  const [values, setValues] = useState<OrderCustomer>(emptyCustomer);
  const [errors, setErrors] = useState<CustomerErrors>({});
  const [payment, setPayment] = useState<PaymentMethod>("cod");
  const [placed, setPlaced] = useState<Order | null>(null);

  // Once the order exists the cart is empty by design, so this branch has to
  // come before the empty-cart check.
  if (placed) return <OrderPlaced order={placed} />;
  if (!ready) return <CheckoutSkeleton />;

  if (lines.length === 0) {
    return (
      <EmptyState
        icon={<CartIcon className="size-6" />}
        title="There's nothing to check out"
        description="Add a drone, frame, motor or nozzle to your cart and come back to complete the order."
        action={
          <ButtonLink href="/products">
            Shop all products
            <ChevronRight className="size-4" />
          </ButtonLink>
        }
      />
    );
  }

  const totals = computeTotals(subtotal);

  const set = (field: keyof OrderCustomer) => (value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    // Clear the error as soon as the field is touched again; it is re-validated
    // on submit anyway.
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const found = validateCustomer(values);
    setErrors(found);

    const firstInvalid = Object.keys(found)[0];
    if (firstInvalid) {
      document.getElementById(`checkout-${firstInvalid}`)?.focus();
      return;
    }

    const order: Order = {
      id: createOrderId(),
      placedAt: new Date().toISOString(),
      items: lines.map((line) => ({
        slug: line.slug,
        name: line.product.name,
        qty: line.qty,
        unitPrice: line.product.price,
        image: line.product.image,
      })),
      totals,
      customer: values,
      payment,
      status: "placed",
    };

    ordersStore.place(order);
    clear();
    setPlaced(order);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  return (
    <form onSubmit={onSubmit} noValidate className="lg:grid lg:grid-cols-[1fr_23rem] lg:items-start lg:gap-10">
      <div className="min-w-0 space-y-8">
        <fieldset className="space-y-4">
          <Legend step={1} title="Delivery details" />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              id="name"
              label="Full name"
              value={values.name}
              error={errors.name}
              onChange={set("name")}
              autoComplete="name"
              className="sm:col-span-2"
            />
            <Field
              id="phone"
              label="Mobile number"
              value={values.phone}
              error={errors.phone}
              onChange={set("phone")}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="9XXXXXXXXX"
            />
            <Field
              id="email"
              label="Email"
              hint="Optional"
              value={values.email}
              error={errors.email}
              onChange={set("email")}
              type="email"
              inputMode="email"
              autoComplete="email"
            />
            <Field
              id="address"
              label="Address"
              hint="House / street / landmark"
              value={values.address}
              error={errors.address}
              onChange={set("address")}
              autoComplete="street-address"
              multiline
              className="sm:col-span-2"
            />
            <Field
              id="city"
              label="City / town"
              value={values.city}
              error={errors.city}
              onChange={set("city")}
              autoComplete="address-level2"
            />
            <Field
              id="pincode"
              label="PIN code"
              value={values.pincode}
              error={errors.pincode}
              onChange={set("pincode")}
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={6}
            />

            <div className="sm:col-span-2">
              <label
                htmlFor="checkout-state"
                className="mb-1.5 block text-xs font-semibold text-ink-700"
              >
                State
              </label>
              <select
                id="checkout-state"
                value={values.state}
                onChange={(event) => set("state")(event.target.value)}
                autoComplete="address-level1"
                className="h-12 w-full rounded-xl border border-ink-200 bg-white px-3.5 text-sm text-ink-800 outline-none transition-colors focus:border-brand-600/50 focus:ring-4 focus:ring-brand-600/10"
              >
                {INDIAN_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
              {errors.state ? <FieldError>{errors.state}</FieldError> : null}
            </div>

            <Field
              id="notes"
              label="Order notes"
              hint="Optional — airframe, payload or delivery instructions"
              value={values.notes}
              onChange={set("notes")}
              multiline
              className="sm:col-span-2"
            />
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <Legend step={2} title="Payment method" />

          <div className="space-y-2.5">
            {PAYMENT_METHODS.map((method) => (
              <label
                key={method.value}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors",
                  payment === method.value
                    ? "border-brand-700/50 bg-brand-50"
                    : "border-ink-200 bg-white hover:border-ink-300",
                )}
              >
                <input
                  type="radio"
                  name="payment"
                  value={method.value}
                  checked={payment === method.value}
                  onChange={() => setPayment(method.value)}
                  className="mt-0.5 size-4.5 shrink-0 accent-[var(--color-brand-700)]"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-ink-900">{method.label}</span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-ink-500">
                    {method.hint}
                  </span>
                </span>
              </label>
            ))}
          </div>

          <p className="rounded-xl bg-surface-muted p-3.5 text-xs leading-relaxed text-ink-500">
            No card details are collected on this site. We confirm stock, freight and the final
            invoice with you on {siteConfig.contact.phoneDisplay} before anything is charged.
          </p>
        </fieldset>
      </div>

      {/* Summary */}
      <aside className="mt-8 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:mt-0">
        <div className="rounded-[var(--radius-card)] border border-ink-200/70 bg-white p-5 shadow-[var(--shadow-soft)] sm:p-6">
          <h2 className="text-base font-semibold">
            Order summary
            <span className="ml-2 font-normal text-ink-400">
              ({count} {count === 1 ? "item" : "items"})
            </span>
          </h2>

          <ul className="mt-4 space-y-3 border-b border-ink-100 pb-4">
            {lines.map((line) => (
              <li key={line.slug} className="flex items-center gap-3">
                <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-surface-sunken">
                  <Image
                    src={line.product.image}
                    alt=""
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                  <span className="absolute -right-1 -top-1 flex min-w-4.5 items-center justify-center rounded-full bg-ink-900 px-1 text-[0.625rem] font-bold text-white">
                    {line.qty}
                  </span>
                </div>
                <p className="min-w-0 flex-1 truncate text-xs font-medium text-ink-700">
                  {line.product.shortName}
                </p>
                <p className="shrink-0 text-xs font-semibold">
                  {line.lineTotal === null ? "On request" : formatPrice(line.lineTotal)}
                </p>
              </li>
            ))}
          </ul>

          <TotalsList totals={totals} className="mt-4" />

          <Button type="submit" fullWidth size="lg" className="mt-5">
            Place order
          </Button>
          <p className="mt-2 text-center text-xs text-ink-400">
            You&apos;ll get a confirmation call before dispatch.
          </p>

          <ul className="mt-5 space-y-3 border-t border-ink-100 pt-4">
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
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/* Confirmation                                                                */
/* -------------------------------------------------------------------------- */

function OrderPlaced({ order }: { order: Order }) {
  const method = PAYMENT_METHODS.find((m) => m.value === order.payment);

  const confirmLink = whatsappLink(
    `Hi ${siteConfig.name}, I've placed order ${order.id}:\n\n${order.items
      .map((item) => `• ${item.name} × ${item.qty}`)
      .join("\n")}\n\nTotal: ${formatPrice(order.totals.total)}\nDeliver to: ${order.customer.address}, ${order.customer.city}, ${order.customer.state} ${order.customer.pincode}`,
  );

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-[var(--radius-card)] border border-ink-200/70 bg-white p-6 text-center shadow-[var(--shadow-soft)] sm:p-8">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <CheckIcon className="size-7" strokeWidth={2.5} />
        </div>
        <h2 className="mt-5 text-xl font-bold sm:text-2xl">Order placed</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-500">
          Thanks {order.customer.name.split(" ")[0]} — we&apos;ve got it. Our team will call{" "}
          {order.customer.phone} to confirm stock and delivery before dispatch.
        </p>

        <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-surface-muted px-4 py-2 font-mono text-sm font-semibold tracking-[0.08em]">
          {order.id}
        </p>

        <ul className="mt-6 space-y-3 border-t border-ink-100 pt-5 text-left">
          {order.items.map((item) => (
            <li key={item.slug} className="flex items-center gap-3">
              <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-surface-sunken">
                <Image src={item.image} alt="" fill sizes="48px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/products/${item.slug}`}
                  className="line-clamp-2-fixed text-sm font-medium text-ink-800 hover:text-brand-800"
                >
                  {item.name}
                </Link>
                <p className="text-xs text-ink-400">Qty {item.qty}</p>
              </div>
              <p className="shrink-0 text-sm font-semibold">
                {item.unitPrice === null
                  ? "On request"
                  : formatPrice(item.unitPrice * item.qty)}
              </p>
            </li>
          ))}
        </ul>

        <TotalsList totals={order.totals} className="mt-5 border-t border-ink-100 pt-5 text-left" />

        <dl className="mt-5 grid gap-4 border-t border-ink-100 pt-5 text-left sm:grid-cols-2">
          <div>
            <dt className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-ink-400">
              Delivering to
            </dt>
            <dd className="mt-1.5 text-sm leading-relaxed text-ink-700">
              {order.customer.name}
              <br />
              {order.customer.address}
              <br />
              {order.customer.city}, {order.customer.state} {order.customer.pincode}
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-ink-400">
              Payment
            </dt>
            <dd className="mt-1.5 text-sm leading-relaxed text-ink-700">{method?.label}</dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <ExternalButtonLink href={confirmLink} variant="whatsapp" fullWidth>
            <WhatsAppIcon className="size-4.5" />
            Confirm on WhatsApp
          </ExternalButtonLink>
          <ButtonLink href="/orders" variant="outline" fullWidth>
            View my orders
          </ButtonLink>
        </div>

        <Link
          href="/products"
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 underline-offset-4 hover:underline"
        >
          Continue shopping
          <ChevronRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Pieces                                                                      */
/* -------------------------------------------------------------------------- */

function Legend({ step, title }: { step: number; title: string }) {
  return (
    <legend className="mb-1 flex items-center gap-2.5 text-base font-semibold">
      <span className="flex size-6 items-center justify-center rounded-full gradient-brand text-[0.6875rem] font-bold text-white">
        {step}
      </span>
      {title}
    </legend>
  );
}

function FieldError({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="mt-1.5 text-xs font-medium text-brand-700">
      {children}
    </p>
  );
}

function Field({
  id,
  label,
  hint,
  value,
  error,
  onChange,
  multiline = false,
  className,
  ...input
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  className?: string;
  type?: string;
  inputMode?: "tel" | "email" | "numeric" | "text";
  autoComplete?: string;
  placeholder?: string;
  maxLength?: number;
}) {
  const fieldId = `checkout-${id}`;
  const shared = cn(
    "w-full rounded-xl border bg-white px-3.5 text-sm text-ink-800 outline-none transition-colors",
    "placeholder:text-ink-300 focus:ring-4 focus:ring-brand-600/10",
    error ? "border-brand-500 focus:border-brand-600" : "border-ink-200 focus:border-brand-600/50",
  );

  return (
    <div className={className}>
      <label htmlFor={fieldId} className="mb-1.5 flex items-baseline gap-2 text-xs font-semibold text-ink-700">
        {label}
        {hint ? <span className="font-normal text-ink-400">{hint}</span> : null}
      </label>

      {multiline ? (
        <textarea
          id={fieldId}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={3}
          aria-invalid={Boolean(error)}
          className={cn(shared, "resize-y py-3 leading-relaxed")}
          autoComplete={input.autoComplete}
          placeholder={input.placeholder}
          maxLength={input.maxLength}
        />
      ) : (
        <input
          id={fieldId}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={Boolean(error)}
          className={cn(shared, "h-12")}
          {...input}
        />
      )}

      {error ? <FieldError>{error}</FieldError> : null}
    </div>
  );
}

function CheckoutSkeleton() {
  return (
    <div className="lg:grid lg:grid-cols-[1fr_23rem] lg:items-start lg:gap-10">
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-12 rounded-xl" />
          ))}
        </div>
      </div>
      <div className="mt-8 rounded-[var(--radius-card)] border border-ink-200/70 bg-white p-6 lg:mt-0">
        <Skeleton className="h-5 w-32" />
        <div className="mt-5 space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-13 w-full rounded-full" />
        </div>
      </div>
    </div>
  );
}
