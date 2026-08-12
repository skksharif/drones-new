import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { OrdersView } from "@/components/orders/OrdersView";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "My Orders",
  description: "Track the AgroSky orders you've placed from this device.",
  path: "/orders",
  noIndex: true,
});

export default function OrdersPage() {
  return (
    <>
      <div className="border-b border-ink-100 bg-surface-muted">
        <div className="container-page py-5 sm:py-8">
          <Breadcrumbs crumbs={[{ name: "Orders", path: "/orders" }]} className="mb-3" />
          <h1 className="text-2xl font-bold sm:text-3xl">My orders</h1>
          <p className="mt-2 max-w-2xl text-sm text-ink-500">
            Orders you&apos;ve placed from this device. For anything older, call us with your
            order reference.
          </p>
        </div>
      </div>

      <div className="container-page py-8 sm:py-10 lg:py-12">
        <OrdersView />
      </div>
    </>
  );
}
