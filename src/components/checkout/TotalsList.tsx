import { formatPrice } from "@/lib/format";
import type { OrderTotals } from "@/lib/checkout";
import { cn } from "@/lib/utils";

/** Subtotal / shipping / GST / total block, shared by cart, checkout and orders. */
export function TotalsList({
  totals,
  className,
}: {
  totals: OrderTotals;
  className?: string;
}) {
  return (
    <div className={className}>
      <dl className="space-y-2.5 text-sm">
        <div className="flex justify-between">
          <dt className="text-ink-500">Subtotal</dt>
          <dd className="font-medium text-ink-900">{formatPrice(totals.subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-500">Shipping</dt>
          <dd
            className={cn(
              "font-medium",
              totals.shipping === 0 ? "text-emerald-600" : "text-ink-900",
            )}
          >
            {totals.shipping === 0 ? "Free" : formatPrice(totals.shipping)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-500">GST (included)</dt>
          <dd className="text-ink-500">{formatPrice(totals.taxIncluded)}</dd>
        </div>
      </dl>

      <div className="mt-3 flex items-end justify-between border-t border-ink-100 pt-3">
        <span className="text-sm font-semibold">Total</span>
        <span className="text-xl font-bold tracking-tight sm:text-2xl">
          {formatPrice(totals.total)}
        </span>
      </div>
    </div>
  );
}
