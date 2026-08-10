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
          animation: pageEnter 420ms var(--ease-out-soft) both;
        }
        @keyframes pageEnter {
          from { opacity: 0; transform: translate3d(0, 8px, 0); }
          to { opacity: 1; transform: translate3d(0, 0, 0); }
        }
      `}</style>
    </div>
  );
}
