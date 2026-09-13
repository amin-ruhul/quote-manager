/*
 * Sends one real quote email, to prove the sending domain works end to end.
 *
 * Deliberately goes through lib/email.ts and the same quoteSentEmail template a
 * customer receives, so what lands in the inbox is the real article — same
 * From, same envelope, same HTML. A hand-rolled "test" message would prove the
 * API key works and nothing else.
 *
 * Run with:  npx tsx --tsconfig scripts/tsconfig.json scripts/send-test-quote.mts you@example.com
 */

import { config } from "dotenv";

config({ path: ".env.local" });

const to = process.argv[2];
if (!to) {
  console.error("Usage: send-test-quote.mts <recipient@example.com>");
  process.exit(1);
}

const { sendEmail } = await import("@/lib/email");
const { quoteSentEmail } = await import("@/lib/email-templates");

const from = process.env.EMAIL_FROM ?? "(unset)";
console.log(`From: ${from}`);
console.log(`To:   ${to}\n`);

const result = await sendEmail({
  to,
  content: quoteSentEmail({
    businessName: "Bright Spark Electric",
    customerName: "Ruhul",
    quoteTitle: "Deliverability test — 200A panel upgrade",
    totalFormatted: "$3,200.00",
    quoteUrl: "https://quotepace.com/",
    validUntil: null,
  }),
});

if (result.error) {
  console.error(`FAILED: ${result.error}`);
  process.exit(1);
}

console.log(`Sent. Resend message id: ${result.id}`);
console.log(
  "\nOpen it in Gmail -> ... -> Show original and look for:\n" +
    "  dkim=pass   header.i=@quotepace.com\n" +
    "  spf=pass    smtp.mailfrom=send.quotepace.com\n" +
    "  dmarc=pass  header.from=quotepace.com",
);
