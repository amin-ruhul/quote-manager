import "server-only";

import { Resend } from "resend";

import type { EmailContent } from "@/lib/email-templates";

/*
 * The only module that talks to Resend (golden rule 4). The API key is read
 * here and never leaves the server.
 */

let client: Resend | null = null;

function getClient(): Resend {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not set");
  }
  client ??= new Resend(process.env.RESEND_API_KEY);
  return client;
}

export type SendResult =
  { id: string; error: null } | { id: null; error: string };

/**
 * Sends one email.
 *
 * Returns a result rather than throwing: nothing in this app should fail an
 * owner's action because a notification bounced. Callers decide what matters —
 * sending a quote surfaces the failure, notifying the owner does not.
 *
 * `replyTo` is how a business keeps its own inbox in the loop while the
 * envelope sender stays on a domain we control (the two are different things,
 * and mail providers care about the difference).
 */
export async function sendEmail(input: {
  to: string;
  replyTo?: string | null;
  content: EmailContent;
}): Promise<SendResult> {
  const from = process.env.EMAIL_FROM;
  if (!from) return { id: null, error: "EMAIL_FROM is not set" };

  try {
    const { data, error } = await getClient().emails.send({
      from,
      to: input.to,
      replyTo: input.replyTo ?? undefined,
      subject: input.content.subject,
      html: input.content.html,
      text: input.content.text,
    });

    if (error) {
      console.error("Resend rejected an email", {
        to: input.to,
        name: error.name,
        message: error.message,
      });
      return { id: null, error: error.message };
    }

    return { id: data?.id ?? "", error: null };
  } catch (error) {
    console.error("Sending email failed", { to: input.to, error });
    return { id: null, error: "Could not reach the email service." };
  }
}

/**
 * Fire-and-forget for owner notifications. A failed "your quote was viewed"
 * email must never break the customer's page or the owner's request, so this
 * swallows the result after logging it.
 */
export async function sendEmailQuietly(input: {
  to: string;
  replyTo?: string | null;
  content: EmailContent;
}): Promise<void> {
  const result = await sendEmail(input);
  if (result.error) {
    console.error("Notification email not delivered", {
      to: input.to,
      subject: input.content.subject,
      error: result.error,
    });
  }
}

/** Absolute URL for links in email — relative paths are meaningless there. */
export function absoluteUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}${path}`;
}
