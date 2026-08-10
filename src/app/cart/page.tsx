import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { CartView } from "@/components/cart/CartView";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Your Cart",
  description:
    "Review the drones and drone parts in your AgroSky cart before requesting a quote or placing your order.",
  path: "/cart",
  noIndex: true,
});

export default function CartPage() {
  return (
    <>
      <div className="border-b border-ink-100 bg-surface-muted">
        <div className="container-page py-6 sm:py-8">
          <Breadcrumbs crumbs={[{ name: "Cart", path: "/cart" }]} className="mb-4" />
          <h1 className="text-2xl font-bold sm:text-3xl">Your cart</h1>
        </div>
      </div>

      <div className="container-page py-8 sm:py-10 lg:py-12">
        <CartView />
      </div>
    </>
  );
}
