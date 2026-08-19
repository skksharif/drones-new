"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/admin/actions";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site";

const LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/products", label: "Products" },
  // No Categories entry: they are read-only, so there is nothing to manage.
  { href: "/admin/banners", label: "Banners" },
];

export function AdminNav({ username }: { username: string }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-ink-200 bg-white/90 backdrop-blur">
      {/* The full brand is wide, so on a phone the nav drops to its own row
          rather than being squeezed to a few scrollable pixels. */}
      <div className="container-page flex flex-wrap items-center gap-x-4 gap-y-1 py-2 sm:h-14 sm:flex-nowrap sm:py-0">
        <Link
          href="/admin"
          className="shrink-0 font-mono text-sm font-bold tracking-tight whitespace-nowrap text-brand-800"
        >
          {siteConfig.name}
          <span className="text-ink-400"> / admin</span>
        </Link>

        <nav className="no-scrollbar order-last -mx-1 flex w-full items-center gap-1 overflow-x-auto px-1 sm:order-none sm:w-auto sm:flex-1">
          {LINKS.map((link) => {
            const active =
              link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-50 text-brand-800"
                    : "text-ink-600 hover:bg-ink-100 hover:text-ink-900",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-3 sm:ml-0">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden text-sm text-ink-500 transition-colors hover:text-ink-900 sm:inline"
          >
            View shop ↗
          </a>
          <span className="hidden font-mono text-xs text-ink-400 md:inline">{username}</span>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-full border border-ink-200 px-3 py-1.5 text-sm font-medium text-ink-600 transition-colors hover:border-brand-700/40 hover:text-brand-800"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
