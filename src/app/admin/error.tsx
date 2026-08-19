"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="w-full max-w-md rounded-[var(--radius-card)] bg-white p-6 text-center shadow-[var(--shadow-card)]">
        <h1 className="text-lg font-bold text-ink-900">That didn&apos;t work</h1>
        <p className="mt-2 text-sm text-ink-500">
          The admin panel hit an error. Nothing was saved — the catalogue is unchanged.
        </p>
        {error.digest ? (
          <p className="mt-2 font-mono text-xs text-ink-400">Reference: {error.digest}</p>
        ) : null}
        <button
          type="button"
          onClick={reset}
          className="mt-5 rounded-full bg-ink-900 px-4 py-2 text-sm font-medium text-white"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
