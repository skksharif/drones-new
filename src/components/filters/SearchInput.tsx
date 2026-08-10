"use client";

import { useEffect, useRef, useState } from "react";
import { CloseIcon, SearchIcon } from "@/components/ui/Icons";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";

/**
 * Search field that keeps typing instant but only pushes to the URL after the
 * user pauses, so filtering doesn't thrash on every keystroke.
 */
export function SearchInput({
  value,
  onChange,
  placeholder = "Search products…",
  className,
  autoFocus = false,
  id = "product-search",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  id?: string;
}) {
  const [local, setLocal] = useState(value);
  const debounced = useDebounce(local, 280);
  const lastPushed = useRef(value);

  // Push debounced input outward.
  useEffect(() => {
    if (debounced === lastPushed.current) return;
    lastPushed.current = debounced;
    onChange(debounced);
  }, [debounced, onChange]);

  // Accept external resets (e.g. "Clear all filters").
  useEffect(() => {
    if (value === lastPushed.current) return;
    lastPushed.current = value;
    setLocal(value);
  }, [value]);

  return (
    <div className={cn("group relative", className)}>
      <label htmlFor={id} className="sr-only">
        Search products
      </label>
      <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-4.5 -translate-y-1/2 text-ink-400 transition-colors group-focus-within:text-brand-700" />
      <input
        id={id}
        type="search"
        value={local}
        autoFocus={autoFocus}
        onChange={(event) => setLocal(event.target.value)}
        placeholder={placeholder}
        enterKeyHint="search"
        autoComplete="off"
        className={cn(
          "h-12 w-full rounded-full border border-ink-200 bg-white pl-11.5 pr-11 text-sm text-ink-800",
          "outline-none transition-all duration-200 placeholder:text-ink-400",
          "focus:border-brand-600/50 focus:ring-4 focus:ring-brand-600/10",
          "[&::-webkit-search-cancel-button]:hidden",
        )}
      />
      {local ? (
        <button
          type="button"
          onClick={() => setLocal("")}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
        >
          <CloseIcon className="size-4" />
        </button>
      ) : null}
    </div>
  );
}
