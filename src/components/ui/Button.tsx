import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "dark" | "whatsapp";
type Size = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium tap-highlight-none " +
  "transition-[transform,box-shadow,background-color,color,border-color] duration-200 " +
  "ease-[var(--ease-out-soft)] motion-safe:active:scale-[0.97] " +
  "disabled:pointer-events-none disabled:opacity-50 select-none whitespace-nowrap";

const VARIANTS: Record<Variant, string> = {
  primary:
    "gradient-brand text-white shadow-[var(--shadow-lift)] hover:shadow-[var(--shadow-glow)] hover:brightness-110",
  secondary:
    "bg-ink-900 text-white hover:bg-ink-800 shadow-[var(--shadow-soft)]",
  outline:
    "border border-brand-700/25 bg-white text-brand-800 hover:border-brand-700/60 hover:bg-brand-50",
  ghost:
    "text-ink-700 hover:bg-ink-100 hover:text-ink-900",
  dark:
    "border border-white/15 bg-white/10 text-white backdrop-blur hover:bg-white/20",
  whatsapp:
    "bg-[#25d366] text-white shadow-[var(--shadow-soft)] hover:brightness-105",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm sm:text-[0.9375rem]",
  lg: "h-13 px-7 text-base",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  fullWidth,
  children,
  ...props
}: CommonProps & ComponentProps<"button">) {
  return (
    <button
      className={cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && "w-full", className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  fullWidth,
  children,
  ...props
}: CommonProps & ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && "w-full", className)}
      {...props}
    >
      {children}
    </Link>
  );
}

export function ExternalButtonLink({
  variant = "primary",
  size = "md",
  className,
  fullWidth,
  children,
  ...props
}: CommonProps & ComponentProps<"a">) {
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      className={cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && "w-full", className)}
      {...props}
    >
      {children}
    </a>
  );
}
