/*
 * Pure rules about where a quote is in its life. No database, no `server-only`
 * — the customer page, the owner's preview and the print route all need these,
 * and two of those can render on the client.
 *
 * lib/public-quote.ts keeps everything that actually touches the database.
 */

/** A quote past its valid_until date can be read but not accepted. */
export function isExpired(validUntil: Date | null): boolean {
  if (!validUntil) return false;
  return new Date(validUntil).getTime() < Date.now();
}

/** Statuses a customer is still allowed to act on. */
export function canAccept(status: string, validUntil: Date | null): boolean {
  if (isExpired(validUntil)) return false;
  return status === "sent" || status === "viewed";
}
