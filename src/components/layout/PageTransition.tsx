"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Lightweight route transition. Keying on the pathname restarts the CSS
 * animation on navigation without the cost of a full animation library, and the
 * global reduced-motion rule collapses it to an instant swap.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="page-enter">
      {children}
      <style>{`
        .page-enter {
          animation: pageEnter 320ms var(--ease-out-soft) both;
        }
        /* Opacity only — a transform here would make this wrapper the
           containing block for every position: fixed descendant, which sends
           the filter/sort sheets to the bottom of the document instead of the
           viewport. */
        @keyframes pageEnter {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
