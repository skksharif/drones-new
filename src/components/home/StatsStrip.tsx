"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { siteConfig } from "@/lib/site";

/** Count-up statistics, triggered once when the strip scrolls into view. */
export function StatsStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    const node = ref.current;
    if (!node) return;

    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const start = performance.now();
        const duration = 1500;
        const tick = (now: number) => {
          const t = Math.min((now - start) / duration, 1);
          // easeOutExpo
          setProgress(t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.3 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [reducedMotion]);

  // Reduced motion (and the pre-hydration render) shows the final numbers.
  const value = reducedMotion ? 1 : progress;
  const settled = value === 1;

  return (
    <div
      ref={ref}
      className="grid grid-cols-3 gap-y-8 rounded-[var(--radius-card)] border border-ink-200/70 bg-surface-muted px-4 py-8 sm:px-8 lg:grid-cols-6"
    >
      {siteConfig.stats.map((stat) => (
        <div key={stat.label} className="text-center">
          <p className="text-xl font-bold tracking-tight text-gradient-brand sm:text-2xl lg:text-3xl">
            {Math.round(stat.value * value).toLocaleString("en-IN")}
            {settled ? stat.suffix : ""}
          </p>
          <p className="mt-1 text-[0.6875rem] leading-tight text-ink-500 sm:text-xs">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}
