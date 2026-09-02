/*
 * What a push alert says, mirroring lib/email-templates.ts for the other
 * channel. Kept as pure functions with no database or service imports so the
 * wording — which carries money — can be tested on its own.
 *
 * Lock-screen copy is short by necessity: the title has to survive truncation,
 * so the news goes there and the detail follows in the body.
 */

export type PushNotificationText = { title: string; body: string };

/** "Your customer opened it." */
export function viewedNotification(input: {
  customerName: string | null;
  quoteTitle: string;
  quoteNumber: string;
}): PushNotificationText {
  return {
    title: `${input.customerName ?? "Someone"} opened your quote`,
    body: `${input.quoteTitle} (${input.quoteNumber})`,
  };
}

/** "You won the job." The money is the point, so it ends the line. */
export function acceptedNotification(input: {
  customerName: string | null;
  quoteTitle: string;
  /** Already formatted from integer cents — never a raw number. */
  totalFormatted: string;
}): PushNotificationText {
  return {
    title: "You won the job",
    body: `${input.customerName ?? "Your customer"} accepted ${input.quoteTitle} — ${input.totalFormatted}`,
  };
}
