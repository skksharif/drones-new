import { siteConfig } from "./site";
import type { Availability } from "./types";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** Formats an INR amount, or returns the enquiry label when price is null. */
export function formatPrice(value: number | null): string {
  if (value === null) return "Price on request";
  return inr.format(value);
}

/** Plain number formatting without the currency symbol (for schema.org and inputs). */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value);
}

export function formatPriceCompact(value: number | null): string {
  if (value === null) return "On request";
  return `${siteConfig.currencySymbol}${formatNumber(value)}`;
}

export const availabilityMeta: Record<
  Availability,
  { label: string; short: string; tone: "ok" | "warn" | "info" | "off"; schema: string }
> = {
  "in-stock": {
    label: "In stock — ships in 2–4 days",
    short: "In stock",
    tone: "ok",
    schema: "https://schema.org/InStock",
  },
  "low-stock": {
    label: "Low stock — only a few left",
    short: "Low stock",
    tone: "warn",
    schema: "https://schema.org/LimitedAvailability",
  },
  "made-to-order": {
    label: "Made to order — built on confirmation",
    short: "Made to order",
    tone: "info",
    schema: "https://schema.org/PreOrder",
  },
  "out-of-stock": {
    label: "Out of stock — enquire for restock date",
    short: "Out of stock",
    tone: "off",
    schema: "https://schema.org/OutOfStock",
  },
};

export function isPurchasable(availability: Availability): boolean {
  return availability !== "out-of-stock";
}
