"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useCatalogue } from "./catalogue";
import { cartStore } from "./cartStore";
import type { ClientProduct } from "@/lib/types";

export interface ResolvedLine {
  slug: string;
  qty: number;
  product: ClientProduct;
  /** Line total, or null when the product is enquiry-only. */
  lineTotal: number | null;
}

interface CartContextValue {
  lines: ResolvedLine[];
  count: number;
  /** Sum of priced lines. Enquiry-only items are excluded and counted separately. */
  subtotal: number;
  enquiryCount: number;
  /** False until localStorage has been read, so the UI can avoid flashing an empty cart. */
  ready: boolean;
  add: (slug: string, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
  qtyOf: (slug: string) => number;
  /** Slug of the most recently added product, used to flash "Added" on the button. */
  lastAdded: string | null;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { findProduct } = useCatalogue();
  const snapshot = useSyncExternalStore(
    cartStore.subscribe,
    cartStore.getSnapshot,
    cartStore.getServerSnapshot,
  );

  const [lastAdded, setLastAdded] = useState<string | null>(null);

  useEffect(() => {
    if (!lastAdded) return;
    const timer = window.setTimeout(() => setLastAdded(null), 1800);
    return () => window.clearTimeout(timer);
  }, [lastAdded]);

  const add = useCallback((slug: string, qty = 1) => {
    cartStore.add(slug, qty);
    setLastAdded(slug);
  }, []);

  const setQty = useCallback((slug: string, qty: number) => cartStore.setQty(slug, qty), []);
  const remove = useCallback((slug: string) => cartStore.remove(slug), []);
  const clear = useCallback(() => cartStore.clear(), []);

  const value = useMemo<CartContextValue>(() => {
    const lines: ResolvedLine[] = snapshot.lines.flatMap((line) => {
      const product = findProduct(line.slug);
      if (!product) return [];
      return [
        {
          ...line,
          product,
          lineTotal: product.price === null ? null : product.price * line.qty,
        },
      ];
    });

    return {
      lines,
      count: lines.reduce((sum, line) => sum + line.qty, 0),
      subtotal: lines.reduce((sum, line) => sum + (line.lineTotal ?? 0), 0),
      enquiryCount: lines.filter((line) => line.lineTotal === null).length,
      ready: snapshot.ready,
      add,
      setQty,
      remove,
      clear,
      qtyOf: (slug: string) => lines.find((line) => line.slug === slug)?.qty ?? 0,
      lastAdded,
    };
  }, [snapshot, add, setQty, remove, clear, lastAdded, findProduct]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside <CartProvider>");
  return context;
}
