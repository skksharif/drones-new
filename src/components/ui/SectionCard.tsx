import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

/**
 * White panel used for every block on the storefront home page: emoji, title
 * and one line of context on the left, a "View All" escape hatch on the right,
 * and the rail of products underneath.
 */
export function SectionCard({
  icon,
  title,
  subtitle,
  href,
  viewAllLabel = "View All",
  children,
  className,
  id,
  as: Heading = "h2",
}: {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  href?: string;
  viewAllLabel?: string;
  children: ReactNode;
  className?: string;
  id?: string;
  /** `h1` when the card is the page's own subject rather than one block of it. */
  as?: "h1" | "h2";
}) {
  return (
    <section
      id={id}
      className={cn(
        "rounded-[var(--radius-card)] bg-white p-3 shadow-[var(--shadow-card)] sm:p-4",
        className,
      )}
    >
      <div className="mb-2.5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Heading
            className={cn(
              "flex items-center gap-1.5 font-bold",
              Heading === "h1" ? "text-base sm:text-lg" : "text-sm sm:text-base",
            )}
          >
            {icon ? (
              <span
                className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-800 [&>svg]:size-4"
                aria-hidden
              >
                {icon}
              </span>
            ) : null}
            {title}
          </Heading>
          {subtitle ? (
            <p className="mt-0.5 text-[0.6875rem] leading-relaxed text-ink-500 sm:text-xs">
              {subtitle}
            </p>
          ) : null}
        </div>

        {href ? (
          <Link
            href={href}
            className="flex shrink-0 items-center gap-0.5 rounded-full border border-brand-200 bg-brand-50/60 px-2.5 py-1.5 text-[0.6875rem] font-semibold text-brand-700 transition-colors hover:border-brand-300 hover:bg-brand-50"
          >
            {viewAllLabel}
            <ChevronRight className="size-3" />
          </Link>
        ) : null}
      </div>

      {children}
    </section>
  );
}
