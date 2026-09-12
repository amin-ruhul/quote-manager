import type { Customer } from "@/db/schema";

/**
 * A phone number reduced to its digits, which is the only form two numbers can
 * be compared in — "(555) 123-4567" and "555.123.4567" are one customer.
 *
 * Used by the schema to count digits and by the duplicate check to match them,
 * so both agree on what "the same number" means. Pure, so it runs in the
 * browser and in the server action alike.
 */
export function phoneDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}

/**
 * Display name for a customer.
 *
 * Both names are required of anyone added now, but the columns are still
 * nullable and rows created before that rule may be missing one — so this keeps
 * collapsing cleanly rather than rendering a stray space.
 */
export function customerName(
  customer: Pick<Customer, "firstName" | "lastName">,
): string {
  return [customer.firstName, customer.lastName].filter(Boolean).join(" ");
}
