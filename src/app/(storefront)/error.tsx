"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Replace with a real error reporter when one is wired up.
    console.error(error);
  }, [error]);

  return (
    <div className="container-page my-3.5 flex min-h-[60vh] flex-col items-center justify-center rounded-[var(--radius-card)] bg-white py-16 text-center shadow-[var(--shadow-card)]">
      <div className="flex size-16 items-center justify-center rounded-2xl gradient-brand-soft text-brand-700">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.7}
          strokeLinecap="round"
          className="size-8"
          aria-hidden
        >
          <path d="M12 8v5" />
          <circle cx="12" cy="16.5" r="0.6" fill="currentColor" />
          <path d="M10.3 3.9 2.6 17.2A2 2 0 0 0 4.3 20.2h15.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
        </svg>
      </div>

      <h1 className="mt-6 text-2xl font-bold sm:text-3xl">Something went wrong</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-500 sm:text-base">
        We hit an unexpected error loading this page. Trying again usually fixes it — if it doesn&apos;t,
        please get in touch and we&apos;ll sort it out.
      </p>
      {error.digest ? (
        <p className="mt-3 font-mono text-xs text-ink-400">Reference: {error.digest}</p>
      ) : null}

      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Button onClick={reset} size="lg">
          Try again
        </Button>
        <ButtonLink href="/" variant="outline" size="lg">
          Back to home
        </ButtonLink>
      </div>
    </div>
  );
}
