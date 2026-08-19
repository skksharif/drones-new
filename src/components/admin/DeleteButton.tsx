"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

/**
 * Two-step delete.
 *
 * An inline confirmation rather than `window.confirm`: the native dialog
 * blocks the whole page, and on mobile it reads as a browser warning rather
 * than part of the app.
 */

function Confirm({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-brand-700 px-3.5 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800 disabled:opacity-60"
    >
      {pending ? "Deleting…" : label}
    </button>
  );
}

export function DeleteButton({
  action,
  slug,
  label,
  confirm,
}: {
  action: (formData: FormData) => void | Promise<void>;
  slug: string;
  label: string;
  confirm: string;
}) {
  const [armed, setArmed] = useState(false);

  if (!armed) {
    return (
      <button
        type="button"
        onClick={() => setArmed(true)}
        className="rounded-full border border-ink-200 px-3.5 py-1.5 text-sm font-medium text-ink-600 transition-colors hover:border-brand-700/40 hover:text-brand-800"
      >
        {label}
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-brand-700/25 bg-brand-50 p-3">
      <p className="text-sm text-brand-900">{confirm}</p>
      <form action={action} className="mt-2.5 flex items-center gap-2">
        <input type="hidden" name="slug" value={slug} />
        <Confirm label="Yes, delete" />
        <button
          type="button"
          onClick={() => setArmed(false)}
          className="px-2 text-sm text-ink-600 hover:text-ink-900"
        >
          Cancel
        </button>
      </form>
    </div>
  );
}
