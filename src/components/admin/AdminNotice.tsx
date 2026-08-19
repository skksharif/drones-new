import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const TONES = {
  info: "border-ink-200 bg-ink-50 text-ink-600",
  success: "border-emerald-600/25 bg-emerald-50 text-emerald-900",
  warning: "border-gold-500/35 bg-gold-400/10 text-ink-800",
  danger: "border-brand-700/25 bg-brand-50 text-brand-800",
} as const;

export function AdminNotice({
  tone = "success",
  children,
}: {
  tone?: keyof typeof TONES;
  children: ReactNode;
}) {
  return (
    <p
      role="status"
      className={cn(
        "rounded-xl border px-4 py-3 text-sm [&_code]:font-mono [&_code]:text-xs",
        TONES[tone],
      )}
    >
      {children}
    </p>
  );
}
