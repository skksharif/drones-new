import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "left",
  tone = "light",
  as: Tag = "h2",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  align?: "left" | "center";
  tone?: "light" | "dark";
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "sm:flex-col sm:items-center",
        className,
      )}
    >
      <Reveal className={cn("max-w-2xl", align === "center" && "text-center")}>
        {eyebrow ? (
          <p
            className={cn(
              "mb-2 font-mono text-xs uppercase tracking-[0.18em]",
              tone === "dark" ? "text-brand-300" : "text-brand-700",
            )}
          >
            {eyebrow}
          </p>
        ) : null}
        <Tag
          className={cn(
            "text-2xl font-semibold sm:text-3xl lg:text-4xl",
            tone === "dark" && "text-white",
          )}
        >
          {title}
        </Tag>
        {description ? (
          <p
            className={cn(
              "mt-3 text-sm leading-relaxed sm:text-base",
              tone === "dark" ? "text-ink-300" : "text-ink-500",
            )}
          >
            {description}
          </p>
        ) : null}
      </Reveal>
      {action ? <Reveal delay={80} className="shrink-0">{action}</Reveal> : null}
    </div>
  );
}

export function Section({
  children,
  className,
  id,
  bleed = false,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  bleed?: boolean;
}) {
  return (
    <section id={id} className={cn("py-12 sm:py-16 lg:py-20", className)}>
      {bleed ? children : <div className="container-page">{children}</div>}
    </section>
  );
}
