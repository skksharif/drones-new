import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { ChevronRight } from "@/components/ui/Icons";
import { breadcrumbSchema } from "@/lib/seo";
import { cn } from "@/lib/utils";

export interface Crumb {
  name: string;
  path: string;
}

/** Renders a semantic breadcrumb trail plus the matching BreadcrumbList schema. */
export function Breadcrumbs({
  crumbs,
  className,
  tone = "light",
}: {
  crumbs: Crumb[];
  className?: string;
  tone?: "light" | "dark";
}) {
  const trail: Crumb[] = [{ name: "Home", path: "/" }, ...crumbs];

  return (
    <>
      <JsonLd id={`ld-breadcrumb-${crumbs.at(-1)?.path ?? "root"}`} data={breadcrumbSchema(trail)} />
      <nav aria-label="Breadcrumb" className={cn("min-w-0", className)}>
        <ol className="no-scrollbar flex items-center gap-1.5 overflow-x-auto whitespace-nowrap text-xs sm:text-[0.8125rem]">
          {trail.map((crumb, index) => {
            const isLast = index === trail.length - 1;
            return (
              <li key={crumb.path} className="flex items-center gap-1.5">
                {index > 0 ? (
                  <ChevronRight
                    className={cn(
                      "size-3.5 shrink-0",
                      tone === "dark" ? "text-ink-500" : "text-ink-300",
                    )}
                  />
                ) : null}
                {isLast ? (
                  <span
                    aria-current="page"
                    className={cn(
                      "font-medium",
                      tone === "dark" ? "text-white" : "text-ink-800",
                    )}
                  >
                    {crumb.name}
                  </span>
                ) : (
                  <Link
                    href={crumb.path}
                    className={cn(
                      "transition-colors",
                      tone === "dark"
                        ? "text-ink-400 hover:text-white"
                        : "text-ink-500 hover:text-brand-700",
                    )}
                  >
                    {crumb.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
