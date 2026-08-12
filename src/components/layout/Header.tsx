"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { CategoryChips } from "./CategoryChips";
import { MobileNav } from "./MobileNav";
import { CartIcon, MenuIcon, SearchIcon } from "@/components/ui/Icons";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";
import { useCart } from "@/store/cart";

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

/**
 * App bar. Brand, cart and account sit on the top row, the search field spans
 * the full width below it, and the category chip rail closes the block — the
 * three things a shopper reaches for, stacked in the order they reach for them.
 *
 * The block is three rows tall, so it scrolls away rather than sticking: the
 * bottom tab bar carries navigation on phones, and the shop's own toolbar
 * pins itself to the top of the viewport once the app bar is gone.
 */
export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [navOpen, setNavOpen] = useState(false);
  const [query, setQuery] = useState("");

  // Close the drawer whenever the route changes. Adjusting during render rather
  // than in an effect avoids a frame where it is still open.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setNavOpen(false);
  }

  const onSearch = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/products");
  };

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:rounded-full focus:bg-brand-700 focus:px-5 focus:py-2.5 focus:text-sm focus:font-medium focus:text-white"
      >
        Skip to content
      </a>

      <header className="relative z-40">
        <div className="gradient-app text-white">
          <div className="container-page pb-2.5 pt-2 lg:pb-3 lg:pt-2.5">
            {/* Row 1 — brand, navigation, cart */}
            <div className="flex h-11 items-center gap-3 lg:h-12 lg:gap-6">
              {/* The brand asset is a full wordmark, so it carries the name on
                  its own — no separate text lockup beside it. */}
              <Link href="/" className="flex shrink-0 items-center tap-highlight-none">
                <Image
                  src="/images/brand/logo.png"
                  alt={siteConfig.name}
                  width={1280}
                  height={853}
                  priority
                  className="h-10 w-auto rounded-md ring-1 ring-white/15 lg:h-11"
                />
              </Link>

              <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
                {NAV_LINKS.map((link) => {
                  const active =
                    link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                        active ? "bg-white/15 text-white" : "text-white/75 hover:text-white",
                      )}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="ml-auto flex items-center gap-2">
                <CartButton />

                <button
                  type="button"
                  onClick={() => setNavOpen(true)}
                  aria-label="Open menu"
                  aria-expanded={navOpen}
                  className="flex size-9 items-center justify-center rounded-full bg-white/12 text-white transition-colors hover:bg-white/20 lg:hidden"
                >
                  <MenuIcon className="size-5" />
                </button>
              </div>
            </div>

            {/* Row 2 — search */}
            <form onSubmit={onSearch} role="search" className="mt-2">
              <label htmlFor="header-search" className="sr-only">
                Search products
              </label>
              <div className="relative">
                <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-ink-400" />
                <input
                  id="header-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search drones, batteries, accessories…"
                  className="h-10 w-full rounded-xl bg-white pl-11 pr-3 text-[0.8125rem] text-ink-800 outline-none placeholder:text-ink-400 focus:ring-2 focus:ring-white/40"
                />
              </div>
            </form>

            {/* Row 3 — category chips */}
            <CategoryChips className="mt-2" />
          </div>
        </div>
      </header>

      <MobileNav open={navOpen} onClose={() => setNavOpen(false)} />
    </>
  );
}

function CartButton() {
  const { count, ready } = useCart();

  return (
    <Link
      href="/cart"
      aria-label={ready && count > 0 ? `Cart, ${count} items` : "Cart"}
      className="relative flex size-9 items-center justify-center rounded-full bg-white/12 text-white transition-colors hover:bg-white/20"
    >
      <CartIcon className="size-5" />
      {ready && count > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 flex min-w-4.5 items-center justify-center rounded-full bg-gold-500 px-1 text-[0.5625rem] font-bold text-ink-950">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}
