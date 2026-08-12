"use client";

import { useSyncExternalStore } from "react";
import type { Order } from "@/lib/checkout";

const STORAGE_KEY = "agrosky.orders.v1";
const MAX_STORED = 20;

export interface OrdersSnapshot {
  orders: Order[];
  /** False until localStorage has been read, so the UI can avoid flashing "no orders". */
  ready: boolean;
}

const SERVER_SNAPSHOT: OrdersSnapshot = { orders: [], ready: false };

/**
 * Order history, persisted in localStorage. It stands in for the account/orders
 * API a backend would provide: `place` is the only writer, so replacing it with
 * a POST + refetch later leaves every consumer untouched.
 */
class OrdersStore {
  private snapshot: OrdersSnapshot = SERVER_SNAPSHOT;
  private listeners = new Set<() => void>();
  private loaded = false;

  subscribe = (listener: () => void): (() => void) => {
    this.ensureLoaded();
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  /**
   * Hydrates from storage on first touch. Checkout writes an order without ever
   * subscribing, so without this a second order placed in a fresh session would
   * commit `[order]` over the stored history instead of prepending to it.
   */
  private ensureLoaded(): void {
    if (this.loaded) return;
    this.loaded = true;
    this.snapshot = { orders: this.load(), ready: true };
  }

  getSnapshot = (): OrdersSnapshot => this.snapshot;

  getServerSnapshot = (): OrdersSnapshot => SERVER_SNAPSHOT;

  private load(): Order[] {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      const parsed: unknown = JSON.parse(stored);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(isOrder);
    } catch {
      return [];
    }
  }

  private commit(orders: Order[]): void {
    this.snapshot = { orders, ready: true };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    } catch {
      // Storage blocked or full — the order still shows for this session.
    }
    for (const listener of this.listeners) listener();
  }

  /** Records a newly placed order, newest first. */
  place(order: Order): void {
    this.ensureLoaded();
    this.commit([order, ...this.snapshot.orders].slice(0, MAX_STORED));
  }

  get(id: string): Order | undefined {
    this.ensureLoaded();
    return this.snapshot.orders.find((order) => order.id === id);
  }

  clear(): void {
    this.ensureLoaded();
    this.commit([]);
  }
}

function isOrder(value: unknown): value is Order {
  if (typeof value !== "object" || value === null) return false;
  const order = value as Partial<Order>;
  return (
    typeof order.id === "string" &&
    typeof order.placedAt === "string" &&
    Array.isArray(order.items) &&
    typeof order.totals === "object" &&
    order.totals !== null
  );
}

export const ordersStore = new OrdersStore();

export function useOrders(): OrdersSnapshot {
  return useSyncExternalStore(
    ordersStore.subscribe,
    ordersStore.getSnapshot,
    ordersStore.getServerSnapshot,
  );
}
