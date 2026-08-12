import { CheckoutView } from "@/components/checkout/CheckoutView";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Checkout",
  description:
    "Confirm your delivery details and place your AgroSky order for drones, frames, motors and spare parts.",
  path: "/checkout",
  noIndex: true,
});

export default function CheckoutPage() {
  return (
    <>
      <div className="border-b border-ink-100 bg-surface-muted">
        <div className="container-page py-5 sm:py-8">
          <Breadcrumbs
            crumbs={[
              { name: "Cart", path: "/cart" },
              { name: "Checkout", path: "/checkout" },
            ]}
            className="mb-3"
          />
          <h1 className="text-2xl font-bold sm:text-3xl">Checkout</h1>
          <p className="mt-2 max-w-2xl text-sm text-ink-500">
            Tell us where it&apos;s going and how you&apos;d like to pay. We confirm stock and
            freight by phone before dispatch.
          </p>
        </div>
      </div>

      <div className="container-page py-8 sm:py-10 lg:py-12">
        <CheckoutView />
      </div>
    </>
  );
}
