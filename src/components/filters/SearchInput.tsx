"use client";

import { useEffect, useRef, useState } from "react";
import { CloseIcon, SearchIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

/**
 * Search field that keeps typing instant but only pushes outward after the
 * user pauses, so filtering doesn't thrash on every keystroke.
 *
 * `echo` records the last value this input emitted. When the parent comes back
 * with something else — "Clear all", a back navigation — that's an external
 * reset and the field adopts it; when it comes back with our own value we keep
 * whatever the user has typed since.
 */
export function SearchInput({
  value,
  onChange,
  placeholder = "Search products…",
  className,
  autoFocus = false,
  delay = 260,
  id = "product-search",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  delay?: number;
  id?: string;
}) {
  const [text, setText] = useState(value);
  const [echo, setEcho] = useState(value);
  const timer = useRef<number | null>(null);

  if (echo !== value) {
    setEcho(value);
    setText(value);
  }

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  const push = (next: string) => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
    setEcho(next);
    onChange(next);
  };

  const handleChange = (next: string) => {
    setText(next);
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      timer.current = null;
      push(next);
    }, delay);
  };

  return (
    <div className={cn("group relative", className)}>
      <label htmlFor={id} className="sr-only">
        Search products
      </label>
      <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-400 transition-colors group-focus-within:text-brand-700" />
      <input
        id={id}
        type="search"
        value={text}
        autoFocus={autoFocus}
        onChange={(event) => handleChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            push(text);
          }
        }}
        placeholder={placeholder}
        enterKeyHint="search"
        autoComplete="off"
        className={cn(
          "h-10 w-full rounded-xl border border-ink-200 bg-white pl-10.5 pr-10 text-[0.8125rem] text-ink-800",
          "outline-none transition-all duration-200 placeholder:text-ink-400",
          "focus:border-brand-600/50 focus:ring-2 focus:ring-brand-600/10",
          "[&::-webkit-search-cancel-button]:hidden",
        )}
      />
      {text ? (
        <button
          type="button"
          onClick={() => {
            setText("");
            push("");
          }}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
        >
          <CloseIcon className="size-4" />
        </button>
      ) : null}
    </div>
  );
}
