"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import { CheckIcon, ChevronDown, SearchIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

export interface ComboOption {
  /** What gets posted. */
  value: string;
  /** What the editor reads. */
  label: string;
  /** Right-aligned detail, e.g. a product count. */
  hint?: string;
  icon?: ReactNode;
}

/**
 * A searchable select.
 *
 * Replaces two controls that were pulling in different directions: a native
 * `<select>` (no search, and `appearance-none` had stripped its arrow without
 * putting one back) and a `<datalist>` (invisible until you find the right
 * pixel to click, and styled by the browser rather than by us).
 *
 * Two modes:
 * - **strict** — the value must come from `options`; the field shows the
 *   chosen label and typing only filters.
 * - **`allowCustom`** — the typed text *is* the value and the list is a set of
 *   suggestions. Sub-types need this: a genuinely new one has to be typeable.
 *
 * Focus never leaves the input while the list is open (the options cancel
 * their own mousedown), so the panel closes on a real blur rather than on a
 * document-wide listener.
 */
export function Combobox({
  id,
  name,
  value,
  onChange,
  options,
  placeholder,
  allowCustom = false,
  emptyLabel = "No matches",
  invalid = false,
}: {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: ComboOption[];
  placeholder?: string;
  allowCustom?: boolean;
  emptyLabel?: string;
  invalid?: boolean;
}) {
  const listId = useId();
  const listRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const selected = options.find((option) => option.value === value);
  // In custom mode the field holds the value itself; in strict mode it holds a
  // search term while open and the chosen label the rest of the time.
  const text = allowCustom ? value : open ? query : (selected?.label ?? "");
  const term = (allowCustom ? (open ? value : "") : query).trim().toLowerCase();

  const matches = term
    ? options.filter(
        (option) =>
          option.label.toLowerCase().includes(term) || option.value.toLowerCase().includes(term),
      )
    : options;

  // An exact hit is already the value; offering to "add" it would be noise.
  const isNew =
    allowCustom &&
    value.trim().length > 0 &&
    !options.some((option) => option.label.toLowerCase() === value.trim().toLowerCase());

  function moveTo(next: number) {
    const clamped = Math.max(0, Math.min(next, matches.length - 1));
    setActive(clamped);
    // The list is already in the DOM — only the highlight changes — so this can
    // run before React re-renders.
    listRef.current?.querySelector(`[data-index="${clamped}"]`)?.scrollIntoView({
      block: "nearest",
    });
  }

  function choose(option: ComboOption) {
    onChange(allowCustom ? option.label : option.value);
    setQuery("");
    setOpen(false);
    inputRef.current?.focus();
  }

  function openList() {
    if (open) return;
    setQuery("");
    setActive(0);
    setOpen(true);
  }

  return (
    <div
      className="relative"
      onBlur={(event) => {
        if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
        setOpen(false);
        setQuery("");
      }}
    >
      {/* The posted value. The visible input is a search box, not the field. */}
      <input type="hidden" name={name} value={value} />

      <div
        className={cn(
          "flex items-center gap-2 rounded-xl border bg-white pr-2 pl-3.5 transition-colors",
          "focus-within:ring-2 focus-within:ring-brand-700/15",
          invalid
            ? "border-brand-700/60 focus-within:border-brand-700"
            : "border-ink-200 focus-within:border-brand-700/50",
        )}
      >
        {open && !allowCustom ? (
          <SearchIcon className="size-4 shrink-0 text-ink-400" />
        ) : selected?.icon ? (
          <span
            className="flex size-4 shrink-0 items-center justify-center text-ink-400"
            aria-hidden
          >
            {selected.icon}
          </span>
        ) : null}

        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          autoComplete="off"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && matches[active] ? `${listId}-${active}` : undefined}
          className="w-full min-w-0 bg-transparent py-2.5 text-sm text-ink-900 outline-none placeholder:text-ink-400"
          placeholder={!open && !allowCustom && selected ? selected.label : placeholder}
          value={text}
          onChange={(event) => {
            const next = event.target.value;
            setActive(0);
            setOpen(true);
            if (allowCustom) onChange(next);
            else setQuery(next);
          }}
          onFocus={openList}
          onClick={openList}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              if (!open) openList();
              else moveTo(active + 1);
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              moveTo(active - 1);
            } else if (event.key === "Enter") {
              // Never let the combobox submit the form by accident.
              if (open) {
                event.preventDefault();
                const option = matches[active];
                if (option) choose(option);
                else setOpen(false);
              }
            } else if (event.key === "Escape") {
              if (open) {
                event.preventDefault();
                setOpen(false);
                setQuery("");
              }
            } else if (event.key === "Tab") {
              setOpen(false);
              setQuery("");
            }
          }}
        />

        <button
          type="button"
          tabIndex={-1}
          aria-label={open ? "Close suggestions" : "Show suggestions"}
          className="flex size-7 shrink-0 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            if (open) {
              setOpen(false);
              setQuery("");
            } else {
              openList();
              inputRef.current?.focus();
            }
          }}
        >
          <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
        </button>
      </div>

      {open ? (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          // Options cancel mousedown so the input keeps focus and the panel is
          // still open by the time the click lands.
          onMouseDown={(event) => event.preventDefault()}
          className="absolute z-50 mt-1.5 max-h-64 w-full overflow-y-auto rounded-xl border border-ink-200 bg-white py-1 shadow-lg"
        >
          {matches.map((option, index) => {
            const isSelected = allowCustom ? option.label === value : option.value === value;
            return (
              <li key={option.value} role="none">
                <button
                  type="button"
                  id={`${listId}-${index}`}
                  data-index={index}
                  role="option"
                  aria-selected={isSelected}
                  tabIndex={-1}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => choose(option)}
                  className={cn(
                    "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors",
                    index === active ? "bg-brand-50 text-brand-900" : "text-ink-700",
                  )}
                >
                  {option.icon ? (
                    <span
                      className="flex size-4 shrink-0 items-center justify-center text-ink-400"
                      aria-hidden
                    >
                      {option.icon}
                    </span>
                  ) : null}
                  <span className="min-w-0 flex-1 truncate">{option.label}</span>
                  {option.hint ? (
                    <span className="shrink-0 font-mono text-[0.6875rem] text-ink-400">
                      {option.hint}
                    </span>
                  ) : null}
                  {isSelected ? <CheckIcon className="size-4 shrink-0 text-brand-700" /> : null}
                </button>
              </li>
            );
          })}

          {matches.length === 0 ? (
            <li className="px-3 py-2.5 text-sm text-ink-400">{emptyLabel}</li>
          ) : null}

          {isNew ? (
            <li className="border-t border-ink-100 px-3 py-2 text-xs text-ink-500">
              Adds a new entry: <span className="font-medium text-ink-800">{value.trim()}</span>
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
