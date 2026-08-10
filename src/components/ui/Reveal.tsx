"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

type Direction = "up" | "down" | "left" | "right" | "none";

const OFFSETS: Record<Direction, string> = {
  up: "translate3d(0, 24px, 0)",
  down: "translate3d(0, -24px, 0)",
  left: "translate3d(28px, 0, 0)",
  right: "translate3d(-28px, 0, 0)",
  none: "translate3d(0, 0, 0)",
};

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Stagger delay in milliseconds. */
  delay?: number;
  direction?: Direction;
  as?: ElementType;
  /** Fraction of the element that must be visible before revealing. */
  threshold?: number;
}

/**
 * IntersectionObserver-based scroll reveal. Content is always in the DOM (no
 * hidden-until-JS flash for crawlers or no-JS users) and the animation is
 * skipped entirely when the user prefers reduced motion.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  direction = "up",
  as: Tag = "div",
  threshold = 0.12,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, reducedMotion]);

  // Before hydration (and whenever motion is reduced) render the resting state.
  const hidden = !reducedMotion && !revealed;

  return (
    <Tag
      ref={ref}
      className={cn("motion-safe:will-change-[opacity,transform]", className)}
      style={{
        opacity: hidden ? 0 : 1,
        transform: hidden ? OFFSETS[direction] : "translate3d(0, 0, 0)",
        transition: reducedMotion
          ? undefined
          : `opacity 620ms var(--ease-out-soft) ${delay}ms, transform 620ms var(--ease-out-soft) ${delay}ms`,
      }}
    >
      {children}
    </Tag>
  );
}
