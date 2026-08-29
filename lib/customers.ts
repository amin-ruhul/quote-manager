import type { Customer } from "@/db/schema";

/**
 * Display name for a customer. Only first_name is required, so this collapses
 * cleanly when the rest is missing.
 */
export function customerName(
  customer: Pick<Customer, "firstName" | "lastName">,
): string {
  return [customer.firstName, customer.lastName].filter(Boolean).join(" ");
}
