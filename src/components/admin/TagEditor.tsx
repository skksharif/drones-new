"use client";

import { useRef, useState } from "react";
import { parseTags } from "@/lib/admin/validate";

/**
 * Tag chips over a hidden field.
 *
 * The value posted is the plain comma-separated string `parseTags` expects, so
 * the server never has to trust this component's bookkeeping — it re-parses
 * and re-deduplicates whatever arrives.
 */
export function TagEditor({ initial }: { initial: string[] }) {
  const [tags, setTags] = useState<string[]>(initial);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function commit(raw: string) {
    const added = parseTags(raw);
    if (added.length === 0) return;
    setTags((current) => {
      const seen = new Set(current.map((t) => t.toLowerCase()));
      return [...current, ...added.filter((t) => !seen.has(t.toLowerCase()))];
    });
    setDraft("");
  }

  return (
    <div>
      <label htmlFor="tag-draft" className="mb-1.5 block text-sm font-medium text-ink-700">
        Tags
      </label>
      <input type="hidden" name="tags" value={tags.join(", ")} />

      <div
        className="flex flex-wrap gap-2 rounded-xl border border-ink-200 bg-white p-2.5 focus-within:border-brand-700/50 focus-within:ring-2 focus-within:ring-brand-700/15"
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1.5 rounded-full bg-ink-100 py-1 pl-3 pr-1.5 text-xs font-medium text-ink-700"
          >
            {tag}
            <button
              type="button"
              aria-label={`Remove ${tag}`}
              onClick={() => setTags((current) => current.filter((t) => t !== tag))}
              className="flex size-4 items-center justify-center rounded-full text-ink-400 transition-colors hover:bg-brand-700 hover:text-white"
            >
              ×
            </button>
          </span>
        ))}

        <input
          id="tag-draft"
          ref={inputRef}
          value={draft}
          onChange={(event) => {
            // A comma finishes a tag, so pasting a whole list works too.
            if (event.target.value.includes(",")) commit(event.target.value);
            else setDraft(event.target.value);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              // Otherwise Enter would submit the form mid-tag.
              event.preventDefault();
              commit(draft);
            } else if (event.key === "Backspace" && draft === "") {
              setTags((current) => current.slice(0, -1));
            }
          }}
          onBlur={() => commit(draft)}
          placeholder={tags.length === 0 ? "Type a tag and press Enter" : ""}
          className="min-w-40 flex-1 bg-transparent px-1.5 py-1 text-sm outline-none placeholder:text-ink-400"
        />
      </div>

      <p className="mt-1.5 text-xs text-ink-500">
        Tags feed search relevance. Enter or a comma adds one; Backspace on an empty box removes the
        last.
      </p>
    </div>
  );
}
