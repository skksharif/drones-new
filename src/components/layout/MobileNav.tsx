"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { NAV_LINKS } from "./Header";
import { ExternalButtonLink } from "@/components/ui/Button";
import {
  ChevronRight,
  CloseIcon,
  MailIcon,
  PhoneIcon,
  SearchIcon,
  WhatsAppIcon,
} from "@/components/ui/Icons";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import { categories } from "@/lib/categories";
import { siteConfig, whatsappLink } from "@/lib/site";
import { cn } from "@/lib/utils";

export function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useLockBodyScroll(open);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      // Trap focus inside the drawer.
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const onSearch = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    onClose();
    router.push(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/products");
  };

  return (
    <div
      className={cn("fixed inset-0 z-90 lg:hidden", !open && "pointer-events-none")}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-ink-950/50 backdrop-blur-[2px] transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        className={cn(
          "absolute inset-y-0 right-0 flex w-[88%] max-w-sm flex-col bg-white shadow-2xl",
          "transition-transform duration-350 ease-[var(--ease-out-soft)]",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <Link href="/" onClick={onClose} className="flex items-center">
            <Image
              src="/images/brand/logo.png"
              alt={siteConfig.name}
              width={1280}
              height={853}
              className="h-10 w-auto rounded-md"
            />
          </Link>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex size-10 items-center justify-center rounded-full text-ink-600 transition-colors hover:bg-ink-100"
          >
            <CloseIcon className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain">
          <form onSubmit={onSearch} role="search" className="px-5 pt-5">
            <label htmlFor="mobile-search" className="sr-only">
              Search products
            </label>
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
              <input
                id="mobile-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search products…"
                className="h-12 w-full rounded-xl border border-ink-200 bg-surface-muted pl-10 pr-4 text-sm outline-none placeholder:text-ink-400 focus:border-brand-600/50 focus:bg-white focus:ring-4 focus:ring-brand-600/10"
              />
            </div>
          </form>

          <nav className="px-3 pt-4" aria-label="Mobile">
            {[
              ...NAV_LINKS,
              { href: "/categories", label: "Categories" } as const,
              { href: "/cart", label: "My cart" } as const,
            ].map((link) => {
              const active =
                link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-4 py-3.5 text-[0.9375rem] font-medium transition-colors",
                    active ? "bg-brand-50 text-brand-800" : "text-ink-700 active:bg-ink-100",
                  )}
                >
                  {link.label}
                  <ChevronRight className="size-4 text-ink-300" />
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 px-5">
            <p className="mb-2.5 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-ink-400">
              Shop by category
            </p>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/category/${category.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-2.5 rounded-xl border border-ink-200/80 p-2.5 transition-colors active:bg-brand-50"
                >
                  <Image
                    src={category.image}
                    alt=""
                    width={32}
                    height={32}
                    className="size-8 shrink-0 rounded-md object-cover"
                  />
                  <span className="truncate text-xs font-semibold text-ink-800">
                    {category.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-6 space-y-2 border-t border-ink-100 px-5 py-5">
            <a
              href={`tel:${siteConfig.contact.phone}`}
              className="flex items-center gap-3 rounded-xl px-1 py-2.5 text-sm text-ink-700"
            >
              <PhoneIcon className="size-4.5 shrink-0 text-brand-700" />
              {siteConfig.contact.phoneDisplay}
            </a>
            <a
              href={`mailto:${siteConfig.contact.email}`}
              className="flex items-center gap-3 rounded-xl px-1 py-2.5 text-sm break-all text-ink-700"
            >
              <MailIcon className="size-4.5 shrink-0 text-brand-700" />
              {siteConfig.contact.email}
            </a>
          </div>
        </div>

        <div className="border-t border-ink-100 p-5">
          <ExternalButtonLink
            href={whatsappLink(`Hi ${siteConfig.name}, I'd like to know more about your drones.`)}
            variant="whatsapp"
            fullWidth
          >
            <WhatsAppIcon className="size-4.5" />
            Chat on WhatsApp
          </ExternalButtonLink>
        </div>
      </div>
    </div>
  );
}
