"use client";

import { ChevronDown, SortIcon } from "@/components/ui/Icons";
import { SORT_OPTIONS, type SortValue } from "@/lib/filters";
import { cn } from "@/lib/utils";

export function SortSelect({
  value,
  onChange,
  className,
  id = "sort-select",
}: {
  value: SortValue;
  onChange: (value: SortValue) => void;
  className?: string;
  id?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <label htmlFor={id} className="sr-only">
        Sort products
      </label>
      <SortIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value as SortValue)}
        className={cn(
          "h-12 w-full appearance-none rounded-full border border-ink-200 bg-white",
          "pl-10 pr-9 text-sm font-medium text-ink-700 outline-none transition-colors",
          "hover:border-brand-700/40 focus:border-brand-600/50 focus:ring-4 focus:ring-brand-600/10",
        )}
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-400" />
    </div>
  );
}

/** Radio-list variant used inside the mobile sort sheet. */
export function SortOptionList({
  value,
  onChange,
}: {
  value: SortValue;
  onChange: (value: SortValue) => void;
}) {
  return (
    <ul className="space-y-1">
      {SORT_OPTIONS.map((option) => {
        const active = option.value === value;
        return (
          <li key={option.value}>
            <button
              type="button"
              onClick={() => onChange(option.value)}
              aria-pressed={active}
              className={cn(
                "flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left text-sm transition-colors",
                active
                  ? "bg-brand-50 font-semibold text-brand-800"
                  : "text-ink-700 active:bg-ink-100",
              )}
            >
              {option.label}
              <span
                aria-hidden
                className={cn(
                  "flex size-5 items-center justify-center rounded-full border transition-colors",
                  active ? "border-brand-700 bg-brand-700" : "border-ink-300",
                )}
              >
                {active ? <span className="size-1.5 rounded-full bg-white" /> : null}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
