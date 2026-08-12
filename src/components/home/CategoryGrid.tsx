import Image from "next/image";
import Link from "next/link";
import { categories } from "@/lib/categories";
import { countByCategory } from "@/lib/products";
import { cn } from "@/lib/utils";

/**
 * Category tiles. Two up on a phone, widening on larger screens — used by the
 * Categories tab, where browsing by group is the whole point of the page.
 */
export function CategoryGrid({ className }: { className?: string }) {
  return (
    <div className={cn("grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-6", className)}>
      {categories.map((category) => {
        const count = countByCategory(category.slug);

        return (
          <Link
            key={category.slug}
            href={`/category/${category.slug}`}
            className="group relative flex flex-col overflow-hidden rounded-xl border border-ink-200/70 bg-white transition-shadow hover:shadow-[var(--shadow-card)]"
          >
            <div className="relative aspect-16/10 overflow-hidden bg-surface-sunken">
              <Image
                src={category.image}
                alt={`${category.name} — ${category.description}`}
                fill
                sizes="(min-width: 1024px) 16vw, (min-width: 640px) 24vw, 31vw"
                loading="lazy"
                className="object-cover"
              />
              <span className="absolute left-1.5 top-1.5 flex size-6 items-center justify-center rounded-lg bg-white/90 text-xs" aria-hidden>
                {category.icon}
              </span>
            </div>

            <div className="flex flex-1 flex-col p-2">
              <h3 className="text-[0.6875rem] font-semibold leading-tight text-ink-900 transition-colors group-hover:text-brand-800">
                {category.name}
              </h3>
              <p className="mt-0.5 font-mono text-[0.5625rem] uppercase tracking-[0.1em] text-ink-400">
                {count > 0 ? `${count} ${count === 1 ? "item" : "items"}` : "Coming soon"}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
