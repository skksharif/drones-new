import type { ReactNode } from "react";
import { CartToast } from "@/components/cart/CartToast";
import { BottomNav } from "@/components/layout/BottomNav";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { PageTransition } from "@/components/layout/PageTransition";
import { WhatsAppFab } from "@/components/layout/WhatsAppFab";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCatalogue, toClientCatalogue } from "@/lib/catalogue";
import { localBusinessSchema, organizationSchema, websiteSchema } from "@/lib/seo";
import { CartProvider } from "@/store/cart";
import { CatalogueProvider } from "@/store/catalogue";

/**
 * Everything that makes a page look like the shop: providers, app bar, footer
 * and the mobile tab bar.
 *
 * It lives in a component rather than straight in the layout because the root
 * `not-found` boundary renders outside the `(storefront)` group — an unmatched
 * URL is matched by the root segment — and still has to look like the shop.
 * The admin panel deliberately renders without any of it.
 */
export async function StorefrontShell({ children }: { children: ReactNode }) {
  // Loaded once here and handed to the browser, so the cart and the product
  // filters keep working synchronously now that the catalogue lives in a
  // database rather than in the bundle.
  const catalogue = toClientCatalogue(await getCatalogue());

  return (
    <CatalogueProvider catalogue={catalogue}>
      <CartProvider>
        <JsonLd id="ld-organization" data={organizationSchema()} />
        <JsonLd id="ld-website" data={websiteSchema()} />
        <JsonLd id="ld-store" data={localBusinessSchema()} />

        {/* The padding keeps the footer clear of the fixed mobile tab bar; the
            token is 0 on desktop where that bar is hidden. */}
        <div className="flex flex-1 flex-col pb-[var(--bottom-nav-h)]">
          <Header />
          <main id="main" className="flex-1">
            <PageTransition>{children}</PageTransition>
          </main>
          <Footer categories={catalogue.categories} />
        </div>

        <WhatsAppFab />
        <CartToast />
        <BottomNav />
      </CartProvider>
    </CatalogueProvider>
  );
}
