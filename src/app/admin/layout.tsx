import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

/**
 * The admin panel deliberately sits outside the `(storefront)` group: no app
 * bar, no cart, no footer, no tab bar. It renders straight onto the document
 * shell in `app/layout.tsx`.
 */
export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: `%s · ${siteConfig.name} Admin`,
  },
  // Belt and braces alongside the `/admin` rule in robots.ts.
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <div className="flex min-h-dvh flex-1 flex-col bg-ink-50">{children}</div>;
}
