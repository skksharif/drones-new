/**
 * Order maths and shapes for the storefront checkout.
 *
 * Everything here is pure and frontend-only: there is no payment gateway and no
 * server. The shapes deliberately mirror what a real order API would accept, so
 * swapping `ordersStore.place()` for a POST later needs no change to the UI.
 */

export const FREE_SHIPPING_OVER = 20_000;
export const SHIPPING_FLAT = 499;
/** Listed prices already include GST; this is only broken out for the invoice line. */
export const GST_RATE = 0.18;

export interface OrderTotals {
  subtotal: number;
  shipping: number;
  /** GST contained within `subtotal`, shown for transparency — not added on top. */
  taxIncluded: number;
  total: number;
}

export function computeTotals(subtotal: number): OrderTotals {
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FLAT;
  return {
    subtotal,
    shipping,
    taxIncluded: Math.round(subtotal - subtotal / (1 + GST_RATE)),
    total: subtotal + shipping,
  };
}

/** Rupees still needed to qualify for free shipping, or 0 once qualified. */
export function amountToFreeShipping(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_OVER ? 0 : FREE_SHIPPING_OVER - subtotal;
}

export const PAYMENT_METHODS = [
  {
    value: "cod",
    label: "Cash on delivery",
    hint: "Pay the courier when the order reaches you.",
  },
  {
    value: "upi",
    label: "UPI on confirmation",
    hint: "We send a UPI request once stock and freight are confirmed.",
  },
  {
    value: "bank",
    label: "Bank transfer / NEFT",
    hint: "A GST invoice with our account details is emailed to you.",
  },
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number]["value"];

export interface OrderCustomer {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  notes: string;
}

export const emptyCustomer: OrderCustomer = {
  name: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  state: "Andhra Pradesh",
  pincode: "",
  notes: "",
};

export interface OrderItem {
  slug: string;
  name: string;
  qty: number;
  /** Unit price in INR, or null for enquiry-only products. */
  unitPrice: number | null;
  image: string;
}

export type OrderStatus = "placed" | "confirmed" | "shipped" | "delivered";

export interface Order {
  id: string;
  /** ISO timestamp. */
  placedAt: string;
  items: OrderItem[];
  totals: OrderTotals;
  customer: OrderCustomer;
  payment: PaymentMethod;
  status: OrderStatus;
}

/** Human-readable reference, e.g. `AGS-8F42QK`. Client-side only. */
export function createOrderId(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 6; i += 1) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `AGS-${suffix}`;
}

export type CustomerErrors = Partial<Record<keyof OrderCustomer, string>>;

const PHONE_RE = /^(?:\+?91[-\s]?)?[6-9]\d{9}$/;
const PINCODE_RE = /^[1-9]\d{5}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Field-level validation for the delivery form. Empty object means valid. */
export function validateCustomer(values: OrderCustomer): CustomerErrors {
  const errors: CustomerErrors = {};
  const phone = values.phone.replace(/[\s-]/g, "");

  if (values.name.trim().length < 2) errors.name = "Enter the name for delivery.";
  if (!PHONE_RE.test(phone)) errors.phone = "Enter a valid 10-digit Indian mobile number.";
  if (values.email.trim() && !EMAIL_RE.test(values.email.trim())) {
    errors.email = "Enter a valid email address, or leave it blank.";
  }
  if (values.address.trim().length < 8) {
    errors.address = "Enter the full street address, including landmark.";
  }
  if (values.city.trim().length < 2) errors.city = "Enter your city or town.";
  if (!values.state.trim()) errors.state = "Select your state.";
  if (!PINCODE_RE.test(values.pincode.trim())) errors.pincode = "Enter a valid 6-digit PIN code.";

  return errors;
}

/** Indian states and union territories, for the delivery address select. */
export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
] as const;
