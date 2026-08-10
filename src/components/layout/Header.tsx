"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { MobileNav } from "./MobileNav";
import { CartIcon, MenuIcon, SearchIcon } from "@/components/ui/Icons";
import { useScrolled } from "@/hooks/useMediaQuery";
import { categories } from "@/lib/categories";
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

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const scrolled = useScrolled(8);
  const [navOpen, setNavOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [query, setQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close transient UI whenever the route changes. Adjusting during render
  // rather than in an effect avoids a frame where the drawer is still open.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setNavOpen(false);
    setCategoriesOpen(false);
  }

  useEffect(() => {
    if (!categoriesOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) setCategoriesOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setCategoriesOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [categoriesOpen]);

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

      <header
        className={cn(
          "sticky top-0 z-50 transition-[background-color,box-shadow,border-color] duration-300",
          scrolled
            ? "glass border-b border-ink-200/70 shadow-[0_1px_20px_-8px_rgb(16_17_22/0.25)]"
            : "border-b border-transparent bg-white",
        )}
      >
        {/* Announcement strip */}
        <div className="gradient-brand text-white">
          <div className="container-page flex h-9 items-center justify-between gap-4 text-[0.6875rem] sm:text-xs">
            <p className="truncate font-medium">
              Genuine EFT &amp; Hobbywing parts · Shipped across AP &amp; Telangana
            </p>
            <a
              href={`tel:${siteConfig.contact.phone}`}
              className="hidden shrink-0 font-medium underline-offset-4 hover:underline sm:block"
            >
              {siteConfig.contact.phoneDisplay}
            </a>
          </div>
        </div>

        <div className="container-page">
          <div className="flex h-16 items-center gap-3 lg:h-20 lg:gap-6">
            {/* Logo */}
            <Link
              href="/"
              className="flex shrink-0 items-center gap-2.5 tap-highlight-none"
              aria-label={`${siteConfig.name} — home`}
            >
              <Image
                src="/images/brand/logo.png"
                alt=""
                width={44}
                height={44}
                priority
                className="size-9 rounded-lg object-contain lg:size-11"
              />
              <span className="flex flex-col leading-none">
                <span className="text-[0.9375rem] font-bold tracking-tight text-ink-900 lg:text-lg">
                  Agro<span className="text-brand-700">Sky</span>
                </span>
                <span className="mt-0.5 font-mono text-[0.5625rem] uppercase tracking-[0.16em] text-ink-400 lg:text-[0.625rem]">
                  {siteConfig.wordmark}
                </span>
              </span>
            </Link>

            {/* Desktop navigation */}
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
                      "relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                      active ? "text-brand-800" : "text-ink-600 hover:text-ink-900",
                    )}
                  >
                    {link.label}
                    {active ? (
                      <span className="absolute inset-x-3.5 -bottom-0.5 h-0.5 rounded-full gradient-brand" />
                    ) : null}
                  </Link>
                );
              })}

              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setCategoriesOpen((open) => !open)}
                  aria-expanded={categoriesOpen}
                  aria-haspopup="true"
                  className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium text-ink-600 transition-colors hover:text-ink-900"
                >
                  Categories
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    className={cn(
                      "size-3.5 transition-transform duration-200",
                      categoriesOpen && "rotate-180",
                    )}
                    aria-hidden
                  >
                    <path d="m5 9 7 7 7-7" />
                  </svg>
                </button>

                {categoriesOpen ? (
                  <div
                    className="absolute left-1/2 top-full z-50 mt-3 w-[34rem] -translate-x-1/2 rounded-2xl border border-ink-200 bg-white p-2 shadow-[var(--shadow-lift)]"
                    style={{ animation: "revealDrop 180ms var(--ease-out-soft)" }}
                  >
                    <div className="grid grid-cols-2 gap-1">
                      {categories.map((category) => (
                        <Link
                          key={category.slug}
                          href={`/category/${category.slug}`}
                          className="group flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-brand-50"
                        >
                          <Image
                            src={category.image}
                            alt=""
                            width={40}
                            height={40}
                            className="size-10 shrink-0 rounded-lg object-cover"
                          />
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold text-ink-900 group-hover:text-brand-800">
                              {category.name}
                            </span>
                            <span className="mt-0.5 block truncate text-xs text-ink-500">
                              {category.types.join(" · ")}
                            </span>
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </nav>

            {/* Desktop search */}
            <form
              onSubmit={onSearch}
              role="search"
              className="ml-auto hidden max-w-xs flex-1 lg:block"
            >
              <label htmlFor="header-search" className="sr-only">
                Search products
              </label>
              <div className="group relative">
                <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-400 transition-colors group-focus-within:text-brand-700" />
                <input
                  id="header-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search drones, frames, nozzles…"
                  className="h-10 w-full rounded-full border border-ink-200 bg-surface-muted pl-10 pr-4 text-sm text-ink-800 outline-none transition-all placeholder:text-ink-400 focus:border-brand-600/50 focus:bg-white focus:ring-4 focus:ring-brand-600/10"
                />
              </div>
            </form>

            {/* Actions */}
            <div className="ml-auto flex items-center gap-1 lg:ml-0">
              <Link
                href="/search"
                aria-label="Search products"
                className="flex size-10 items-center justify-center rounded-full text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900 lg:hidden"
              >
                <SearchIcon className="size-5" />
              </Link>

              <CartButton />

              <button
                type="button"
                onClick={() => setNavOpen(true)}
                aria-label="Open menu"
                aria-expanded={navOpen}
                className="flex size-10 items-center justify-center rounded-full text-ink-700 transition-colors hover:bg-ink-100 lg:hidden"
              >
                <MenuIcon className="size-5.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileNav open={navOpen} onClose={() => setNavOpen(false)} />

      <style>{`
        @keyframes revealDrop {
          from { opacity: 0; transform: translate(-50%, -6px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </>
  );
}

function CartButton() {
  const { count, ready } = useCart();

  return (
    <Link
      href="/cart"
      aria-label={ready && count > 0 ? `Cart, ${count} items` : "Cart"}
      className="relative flex size-10 items-center justify-center rounded-full text-ink-700 transition-colors hover:bg-ink-100"
    >
      <CartIcon className="size-5.5" />
      {ready && count > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 flex min-w-5 items-center justify-center rounded-full gradient-brand px-1.5 text-[0.625rem] font-bold text-white ring-2 ring-white">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}
