import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { CartView } from "@/components/cart/CartView";
import { SectionCard } from "@/components/ui/SectionCard";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Your Cart",
  description:
    "Review the drones and drone parts you've selected, then send the list to AgroSky on WhatsApp for a quote.",
  path: "/cart",
  noIndex: true,
});

export default function CartPage() {
  return (
    <div className="container-page space-y-2.5 py-2.5 sm:py-3">
      <Breadcrumbs crumbs={[{ name: "Cart", path: "/cart" }]} />

      <SectionCard
        as="h1"
        icon="🛒"
        title="Your cart"
        subtitle="Review what you've selected, then send the whole list to us on WhatsApp for a quote."
      >
        <CartView />
      </SectionCard>
    </div>
  );
}
