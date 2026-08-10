import type { ReactNode } from "react";
import { availabilityMeta } from "@/lib/format";
import type { Availability } from "@/lib/types";
import { cn } from "@/lib/utils";

type Tone = "brand" | "gold" | "neutral" | "success" | "warn" | "muted" | "dark";

const TONES: Record<Tone, string> = {
  brand: "gradient-brand text-white",
  gold: "bg-gold-500 text-ink-950",
  neutral: "bg-ink-100 text-ink-700",
  success: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600/20",
  warn: "bg-amber-50 text-amber-800 ring-1 ring-amber-600/25",
  muted: "bg-ink-100 text-ink-500 ring-1 ring-ink-300/50",
  dark: "bg-ink-900/85 text-white backdrop-blur",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-wide",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

const STOCK_TONE: Record<Availability, Tone> = {
  "in-stock": "success",
  "low-stock": "warn",
  "made-to-order": "neutral",
  "out-of-stock": "muted",
};

const DOT: Record<Availability, string> = {
  "in-stock": "bg-emerald-500",
  "low-stock": "bg-amber-500",
  "made-to-order": "bg-brand-600",
  "out-of-stock": "bg-ink-400",
};

export function StockBadge({
  availability,
  long = false,
  className,
}: {
  availability: Availability;
  long?: boolean;
  className?: string;
}) {
  const meta = availabilityMeta[availability];
  return (
    <Badge tone={STOCK_TONE[availability]} className={cn("normal-case tracking-normal", className)}>
      <span className={cn("size-1.5 rounded-full", DOT[availability])} aria-hidden />
      {long ? meta.label : meta.short}
    </Badge>
  );
}
