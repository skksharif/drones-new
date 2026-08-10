import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { categories } from "@/lib/categories";
import { countByCategory } from "@/lib/products";

/**
 * Category entry points, placed directly under the hero so products are the
 * first real thing a visitor sees.
 */
export function CategoryRail() {
  return (
    <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-4">
      {categories.map((category, index) => {
        const count = countByCategory(category.slug);
        return (
          <Reveal
            key={category.slug}
            delay={index * 45}
            className="w-36 shrink-0 snap-start sm:w-auto"
          >
            <Link
              href={`/category/${category.slug}`}
              className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-ink-200/70 bg-white shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-1 hover:border-brand-700/30 hover:shadow-[var(--shadow-lift)]"
            >
              <div className="relative aspect-16/10 overflow-hidden bg-surface-sunken">
                <Image
                  src={category.image}
                  alt={`${category.name} — ${category.description}`}
                  fill
                  sizes="(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 40vw"
                  loading="lazy"
                  className="object-cover transition-transform duration-700 ease-[var(--ease-out-soft)] motion-safe:group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-linear-to-t from-ink-950/70 via-ink-950/10 to-transparent" />
              </div>

              <div className="flex flex-1 flex-col p-3 sm:p-4">
                <h3 className="text-[0.8125rem] font-semibold leading-tight text-ink-900 transition-colors group-hover:text-brand-800 sm:text-[0.9375rem]">
                  {category.name}
                </h3>
                <p className="mt-1 font-mono text-[0.625rem] uppercase tracking-[0.12em] text-ink-400">
                  {count} {count === 1 ? "item" : "items"}
                </p>
              </div>
            </Link>
          </Reveal>
        );
      })}
    </div>
  );
}
