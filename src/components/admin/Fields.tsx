import type { ComponentProps, ReactNode } from "react";
import { ChevronDown } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

/**
 * The admin form vocabulary. Plain server components — the product form is a
 * client component only because of its live preview and repeatable rows, and
 * these render fine inside it either way.
 */

const CONTROL =
  "w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 " +
  "outline-none transition-colors placeholder:text-ink-400 focus:border-brand-700/50 " +
  "focus:ring-2 focus:ring-brand-700/15 disabled:bg-ink-50 disabled:text-ink-400";

export function Fieldset({
  legend,
  hint,
  children,
  className,
}: {
  legend: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <fieldset
      className={cn(
        "rounded-[var(--radius-card)] bg-white p-5 shadow-[var(--shadow-card)]",
        className,
      )}
    >
      <legend className="px-1 text-sm font-semibold text-ink-900">{legend}</legend>
      {hint ? <p className="mt-1 mb-4 text-xs text-ink-500">{hint}</p> : <div className="mb-4" />}
      <div className="space-y-4">{children}</div>
    </fieldset>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-ink-700">
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-brand-700">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-ink-500">{hint}</p>
      ) : null}
    </div>
  );
}

export function TextInput({ className, ...props }: ComponentProps<"input">) {
  return <input {...props} className={cn(CONTROL, className)} />;
}

export function TextArea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea {...props} className={cn(CONTROL, "min-h-24 leading-relaxed", className)} />;
}

/**
 * `appearance-none` strips the browser's own arrow, so the control has to draw
 * one back — without it the select reads as a text box that ignores typing.
 */
export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <div className="relative">
      <select {...props} className={cn(CONTROL, "appearance-none pr-9", className)}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink-400" />
    </div>
  );
}

export function Checkbox({
  label,
  hint,
  ...props
}: { label: string; hint?: string } & ComponentProps<"input">) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-ink-200 p-3 transition-colors hover:border-brand-700/30">
      <input
        type="checkbox"
        {...props}
        className="mt-0.5 size-4 shrink-0 accent-[var(--color-brand-700)]"
      />
      <span>
        <span className="block text-sm font-medium text-ink-800">{label}</span>
        {hint ? <span className="mt-0.5 block text-xs text-ink-500">{hint}</span> : null}
      </span>
    </label>
  );
}

export function Row({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("grid gap-4 sm:grid-cols-2", className)}>{children}</div>;
}
