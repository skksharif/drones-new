"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CartIcon, GridIcon, HomeIcon, SupportIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";
import { useCart } from "@/store/cart";

const TABS = [
  { href: "/", label: "Home", Icon: HomeIcon, exact: true },
  { href: "/categories", label: "Categories", Icon: GridIcon, exact: false },
  { href: "/contact", label: "Support", Icon: SupportIcon, exact: false },
  { href: "/cart", label: "Cart", Icon: CartIcon, exact: false },
] as const;

/**
 * Phone/tablet tab bar. Home, categories, support and the cart stay one
 * thumb-reach away from anywhere in the app — which is what separates a
 * storefront that feels like an app from one that feels like a brochure.
 */
export function BottomNav() {
  const pathname = usePathname();
  const { count, ready } = useCart();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-ink-200/70 bg-white pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-4px_20px_-12px_rgb(16_17_22/0.35)] lg:hidden"
    >
      <ul className="flex h-15 items-stretch">
        {TABS.map(({ href, label, Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          const badge = href === "/cart" && ready && count > 0 ? count : 0;

          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-full flex-col items-center justify-center gap-1 tap-highlight-none transition-colors",
                  active ? "text-brand-700" : "text-ink-500 active:text-ink-800",
                )}
              >
                <span className="relative">
                  <Icon className="size-5.5" />
                  {badge > 0 ? (
                    <span className="absolute -right-2.5 -top-1.5 flex min-w-4.5 items-center justify-center rounded-full gradient-brand px-1 text-[0.625rem] font-bold text-white ring-2 ring-white">
                      {badge > 99 ? "99+" : badge}
                    </span>
                  ) : null}
                </span>
                <span className="text-[0.625rem] font-medium tracking-wide">{label}</span>
                {active ? (
                  <span
                    className="absolute inset-x-0 bottom-0 mx-auto h-0.5 w-9 rounded-full gradient-brand"
                    aria-hidden
                  />
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
