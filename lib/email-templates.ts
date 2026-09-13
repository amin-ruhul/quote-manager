/*
 * Plain, table-free HTML with inline styles. Email clients strip <style> blocks
 * and know nothing about Tailwind, so DESIGN.md's tokens are written out by
 * hand here — same warm paper, same single blue, same hairlines.
 */

const CANVAS = "#F6F5F4";
const SURFACE = "#FFFFFF";
const HAIRLINE = "rgba(0,0,0,0.08)";
const INK = "rgba(0,0,0,0.90)";
const INK_60 = "rgba(0,0,0,0.60)";
const INK_40 = "rgba(0,0,0,0.40)";
const BRAND = "#0075DE";
const FONT =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Helvetica,Arial,sans-serif";

export type EmailContent = { subject: string; html: string; text: string };

function layout({
  heading,
  body,
  ctaLabel,
  ctaUrl,
  footer,
}: {
  heading: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
  footer?: string;
}): string {
  const cta =
    ctaLabel && ctaUrl
      ? `<div style="margin:28px 0 8px">
           <a href="${ctaUrl}" style="display:inline-block;background:${BRAND};color:#fff;text-decoration:none;font-weight:500;font-size:16px;padding:14px 24px;border-radius:8px">${ctaLabel}</a>
         </div>
         <p style="margin:8px 0 0;font-size:13px;color:${INK_40};word-break:break-all">${ctaUrl}</p>`
      : "";

  return `<!doctype html>
<html><body style="margin:0;padding:24px 12px;background:${CANVAS};font-family:${FONT};color:${INK}">
  <div style="max-width:520px;margin:0 auto;background:${SURFACE};border:1px solid ${HAIRLINE};border-radius:12px;padding:28px 24px">
    <h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;font-weight:600">${heading}</h1>
    ${body}
    ${cta}
  </div>
  <p style="max-width:520px;margin:16px auto 0;font-size:13px;color:${INK_40};text-align:center">${footer ?? "Made with QuotePilot"}</p>
</body></html>`;
}

function paragraph(text: string): string {
  return `<p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:${INK_60}">${text}</p>`;
}

/** Escapes user-supplied values so a business or job name can't inject markup. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function quoteSentEmail(input: {
  businessName: string;
  customerName: string | null;
  quoteTitle: string;
  totalFormatted: string;
  quoteUrl: string;
  validUntil: string | null;
}): EmailContent {
  const business = escapeHtml(input.businessName);
  const title = escapeHtml(input.quoteTitle);
  const greeting = input.customerName
    ? `Hi ${escapeHtml(input.customerName)},`
    : "Hi,";

  const validity = input.validUntil
    ? paragraph(`This quote is valid until ${escapeHtml(input.validUntil)}.`)
    : "";

  return {
    subject: `Your quote from ${input.businessName} — ${input.quoteTitle}`,
    html: layout({
      heading: `Your quote from ${business}`,
      body:
        paragraph(greeting) +
        paragraph(
          `Here's your quote for <strong style="color:${INK}">${title}</strong>, ` +
            `totalling <strong style="color:${INK}">${escapeHtml(input.totalFormatted)}</strong>.`,
        ) +
        paragraph("Open it to see the full breakdown and accept online.") +
        validity,
      ctaLabel: "View your quote",
      ctaUrl: input.quoteUrl,
    }),
    text: `${greeting}

Here's your quote from ${input.businessName} for ${input.quoteTitle}, totalling ${input.totalFormatted}.

View and accept it here:
${input.quoteUrl}
${input.validUntil ? `\nValid until ${input.validUntil}.` : ""}`,
  };
}

/** The nudge that drives the "win more jobs" promise (SPEC §12). */
export function followUpEmail(input: {
  businessName: string;
  customerName: string | null;
  quoteTitle: string;
  quoteUrl: string;
}): EmailContent {
  const business = escapeHtml(input.businessName);
  const firstName = input.customerName
    ? escapeHtml(input.customerName.split(" ")[0] ?? input.customerName)
    : null;
  const greeting = firstName ? `Hi ${firstName},` : "Hi,";

  return {
    subject: `Any questions about your quote from ${input.businessName}?`,
    html: layout({
      heading: "Any questions?",
      body:
        paragraph(greeting) +
        paragraph(
          `Just checking you got the quote for ${escapeHtml(input.quoteTitle)}. ` +
            `Happy to talk it through or adjust anything.`,
        ) +
        paragraph(`— ${business}`),
      ctaLabel: "View your quote",
      ctaUrl: input.quoteUrl,
    }),
    text: `${greeting}

Just checking you got the quote for ${input.quoteTitle}. Happy to talk it through or adjust anything.

${input.quoteUrl}

— ${input.businessName}`,
  };
}

/** Owner notification: the customer opened it. */
export function quoteViewedEmail(input: {
  customerName: string | null;
  quoteTitle: string;
  quoteNumber: string;
  builderUrl: string;
}): EmailContent {
  const who = input.customerName ? escapeHtml(input.customerName) : "Someone";

  return {
    subject: `${input.customerName ?? "Someone"} opened ${input.quoteNumber}`,
    html: layout({
      heading: "Your quote was opened",
      body:
        paragraph(
          `${who} just opened <strong style="color:${INK}">${escapeHtml(input.quoteTitle)}</strong> (${escapeHtml(input.quoteNumber)}).`,
        ) + paragraph("Good moment to follow up if you haven't heard back."),
      ctaLabel: "Open the quote",
      ctaUrl: input.builderUrl,
    }),
    text: `${input.customerName ?? "Someone"} just opened ${input.quoteTitle} (${input.quoteNumber}).

${input.builderUrl}`,
  };
}

/** Owner notification: you won the job. */
export function quoteAcceptedEmail(input: {
  customerName: string | null;
  quoteTitle: string;
  quoteNumber: string;
  totalFormatted: string;
  signedName: string | null;
  builderUrl: string;
}): EmailContent {
  const who = input.customerName
    ? escapeHtml(input.customerName)
    : "Your customer";
  const signature = input.signedName
    ? paragraph(`Signed: ${escapeHtml(input.signedName)}`)
    : "";

  return {
    subject: `Accepted — ${input.quoteNumber} for ${input.totalFormatted}`,
    html: layout({
      heading: "You won the job",
      body:
        paragraph(
          `${who} accepted <strong style="color:${INK}">${escapeHtml(input.quoteTitle)}</strong> ` +
            `for <strong style="color:${INK}">${escapeHtml(input.totalFormatted)}</strong>.`,
        ) + signature,
      ctaLabel: "Open the quote",
      ctaUrl: input.builderUrl,
    }),
    text: `${input.customerName ?? "Your customer"} accepted ${input.quoteTitle} for ${input.totalFormatted}.
${input.signedName ? `Signed: ${input.signedName}\n` : ""}
${input.builderUrl}`,
  };
}

/**
 * Operator notification: someone asked for premium access.
 *
 * Goes to us, not to a customer, which is why it reads like a work item rather
 * than a product email — the whole point is to answer it by hand the same day.
 */
export function upgradeRequestEmail(input: {
  businessName: string | null;
  ownerName: string | null;
  ownerEmail: string;
  source: string;
  note: string | null;
  totalRequests: number;
}): EmailContent {
  const who = escapeHtml(input.businessName ?? input.ownerName ?? "Someone");
  const note = input.note
    ? paragraph(`They said: “${escapeHtml(input.note)}”`)
    : "";

  return {
    subject: `Premium request #${input.totalRequests} — ${input.businessName ?? input.ownerEmail}`,
    html: layout({
      heading: "Someone asked for premium access",
      body:
        paragraph(
          `<strong style="color:${INK}">${who}</strong> (${escapeHtml(input.ownerEmail)}) ` +
            `asked from the <strong style="color:${INK}">${escapeHtml(input.source)}</strong> screen.`,
        ) +
        note +
        paragraph(
          `That's request number ${input.totalRequests} since the test started.`,
        ),
      footer: "QuotePilot — market test",
    }),
    text: `${input.businessName ?? input.ownerName ?? "Someone"} (${input.ownerEmail}) asked for premium access from the ${input.source} screen.
${input.note ? `\nThey said: "${input.note}"\n` : ""}
Request number ${input.totalRequests} since the test started.`,
  };
}
