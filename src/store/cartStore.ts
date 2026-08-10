"use client";

import { getProduct } from "@/lib/products";

const STORAGE_KEY = "agrosky.cart.v1";

/**
 * The cart persists only slug + quantity. Product details are re-resolved from
 * the catalogue on read, so when this is swapped for a real API later the
 * stored shape stays valid.
 */
export interface CartLine {
  slug: string;
  qty: number;
}

export interface CartSnapshot {
  lines: CartLine[];
  /** False until localStorage has been read, so the UI can avoid flashing an empty cart. */
  ready: boolean;
}

const SERVER_SNAPSHOT: CartSnapshot = { lines: [], ready: false };

/**
 * A tiny external store read through `useSyncExternalStore`. Keeping cart state
 * outside React means hydration from localStorage is a plain read rather than a
 * state write inside an effect, and a future API-backed implementation only has
 * to replace `load`/`persist`.
 */
class CartStore {
  private snapshot: CartSnapshot = SERVER_SNAPSHOT;
  private listeners = new Set<() => void>();
  private loaded = false;

  subscribe = (listener: () => void): (() => void) => {
    // Lazily hydrate on the first subscription, i.e. the first client render.
    if (!this.loaded) {
      this.loaded = true;
      this.snapshot = { lines: this.load(), ready: true };
    }
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = (): CartSnapshot => this.snapshot;

  getServerSnapshot = (): CartSnapshot => SERVER_SNAPSHOT;

  private load(): CartLine[] {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      const parsed: unknown = JSON.parse(stored);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter(
          (line): line is CartLine =>
            typeof line === "object" &&
            line !== null &&
            typeof (line as CartLine).slug === "string" &&
            typeof (line as CartLine).qty === "number" &&
            (line as CartLine).qty > 0,
        )
        // Drop anything no longer in the catalogue.
        .filter((line) => Boolean(getProduct(line.slug)));
    } catch {
      // Corrupted or unavailable storage — start with an empty cart.
      return [];
    }
  }

  private persist(lines: CartLine[]): void {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // Storage full or blocked; the cart still works for this session.
    }
  }

  private commit(lines: CartLine[]): void {
    this.snapshot = { lines, ready: true };
    this.persist(lines);
    for (const listener of this.listeners) listener();
  }

  add(slug: string, qty = 1): void {
    const { lines } = this.snapshot;
    const existing = lines.find((line) => line.slug === slug);
    this.commit(
      existing
        ? lines.map((line) =>
            line.slug === slug ? { ...line, qty: Math.min(line.qty + qty, 99) } : line,
          )
        : [...lines, { slug, qty: Math.min(qty, 99) }],
    );
  }

  setQty(slug: string, qty: number): void {
    const { lines } = this.snapshot;
    if (qty <= 0) {
      this.commit(lines.filter((line) => line.slug !== slug));
      return;
    }
    this.commit(
      lines.map((line) => (line.slug === slug ? { ...line, qty: Math.min(qty, 99) } : line)),
    );
  }

  remove(slug: string): void {
    this.commit(this.snapshot.lines.filter((line) => line.slug !== slug));
  }

  clear(): void {
    this.commit([]);
  }
}

export const cartStore = new CartStore();
