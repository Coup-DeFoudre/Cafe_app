import type { CartItem } from '@/types';

export function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
}

export function calculateTax(subtotal: number, taxRate?: number): number {
  const rate = taxRate !== undefined ? taxRate / 100 : 0.18; // Default to 18% if not provided
  return subtotal * rate;
}

export function calculateTotal(subtotal: number, tax: number, deliveryCharge: number = 0): number {
  return subtotal + tax + deliveryCharge;
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `ORD-${timestamp.slice(-6)}${random}`;
}

export function formatOrderSummary(items: CartItem[]) {
  const subtotal = calculateSubtotal(items);
  const tax = calculateTax(subtotal);
  const total = calculateTotal(subtotal, tax);

  return {
    subtotal,
    tax,
    total,
    itemCount: items.reduce((count, item) => count + item.quantity, 0),
  };
}
