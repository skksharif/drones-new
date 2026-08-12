"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { categories } from "@/lib/categories";
import { cn } from "@/lib/utils";

/**
 * The chip rail that sits under the search bar. It is the primary way around
 * the catalogue on a phone: one horizontal swipe reaches every category, and
 * the active chip inverts to white so the current section is never in doubt.
 */
export function CategoryChips({ className }: { className?: string }) {
  const pathname = usePathname();
  const activeSlug = pathname.startsWith("/category/") ? pathname.split("/")[2] : null;
  const allActive = activeSlug === null && pathname !== "/cart";

  return (
    <div
      className={cn(
        "no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0",
        className,
      )}
    >
      <Chip href="/products" label="All" icon="🏪" active={allActive} />

      {categories.map((category) => (
        <Chip
          key={category.slug}
          href={`/category/${category.slug}`}
          label={category.short}
          icon={category.icon}
          active={activeSlug === category.slug}
        />
      ))}
    </div>
  );
}

function Chip({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex min-w-18 shrink-0 flex-col items-center justify-center gap-1 rounded-xl px-2.5 py-1.5",
        "tap-highlight-none transition-colors duration-200",
        active
          ? "bg-white text-brand-800 ring-1 ring-white/70"
          : "bg-white/12 text-white hover:bg-white/20",
      )}
    >
      <span className="text-base leading-none" aria-hidden>
        {icon}
      </span>
      <span className="whitespace-nowrap text-[0.625rem] font-medium leading-none">{label}</span>
    </Link>
  );
}
