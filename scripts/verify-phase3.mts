/*
 * Phase 3 verification against the real database.
 *
 * Exercises lib/public-quote.ts directly — the module the public page relies on
 * — plus the status/event transitions. Creates a throwaway auth user and
 * business and deletes both afterwards.
 *
 * Run with: npm run verify:phase3
 */

import { config } from "dotenv";
import { asc, eq } from "drizzle-orm";

config({ path: ".env.local" });

const { db } = await import("@/lib/db");
const {
  businesses,
  customers,
  profiles,
  quoteEvents,
  quoteItems,
  quoteOptions,
  quotes,
} = await import("@/db/schema");
const { canAccept, getQuoteByPublicToken, isExpired, recordQuoteViewed } =
  await import("@/lib/public-quote");
const { generatePublicToken } = await import("@/lib/quotes");

let passed = 0;
let failed = 0;

function check(label: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) {
    passed += 1;
    process.stdout.write(`  PASS  ${label}\n`);
  } else {
    failed += 1;
    process.stdout.write(
      `  FAIL  ${label}\n        expected ${JSON.stringify(expected)}\n        actual   ${JSON.stringify(actual)}\n`,
    );
  }
}

const userId = crypto.randomUUID();

async function main() {
  await db.execute(
    `insert into auth.users (id, instance_id, aud, role, email, encrypted_password, created_at, updated_at)
     values ('${userId}', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
             'p3-${userId}@example.test', '', now(), now())`,
  );
  await db.insert(profiles).values({ id: userId, email: "p3@example.test" });

  const [business] = await db
    .insert(businesses)
    .values({
      ownerId: userId,
      name: "Verify Electric",
      logoUrl: "https://example.test/logo.png",
      licenseNumber: "EC-9999",
      defaultTaxRate: 825,
    })
    .returning({ id: businesses.id });
  const businessId = business!.id;

  const [customer] = await db
    .insert(customers)
    .values({ businessId, firstName: "Jane", lastName: "Doe" })
    .returning({ id: customers.id });

  const token = generatePublicToken();
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 30);

  const [quote] = await db
    .insert(quotes)
    .values({
      businessId,
      customerId: customer!.id,
      quoteNumber: "Q-0001",
      title: "Kitchen lighting",
      scopeOfWork: "Install six recessed lights.",
      terms: "Valid 30 days.",
      status: "sent",
      taxRate: 825,
      subtotal: 111000,
      tax: 9158,
      total: 120158,
      publicToken: token,
      validUntil,
    })
    .returning({ id: quotes.id });
  const quoteId = quote!.id;

  await db.insert(quoteItems).values({
    quoteId,
    name: "Recessed light",
    quantity: 600,
    unit: "each",
    unitPrice: 18500,
    total: 111000,
    type: "qty",
    position: 0,
  });

  process.stdout.write("\ntoken lookup\n");
  const publicQuote = await getQuoteByPublicToken(token);
  check("quote found by token", publicQuote?.title, "Kitchen lighting");
  check("business name joined", publicQuote?.businessName, "Verify Electric");
  check(
    "logo joined",
    publicQuote?.businessLogoUrl,
    "https://example.test/logo.png",
  );
  check("customer name joined", publicQuote?.customerFirstName, "Jane");
  check("owner plan joined for the footer", publicQuote?.ownerPlan, "free");
  check("line items returned", publicQuote?.items.length, 1);

  process.stdout.write("\nno private field leaks\n");
  const exposed = Object.keys(publicQuote ?? {});
  const forbidden = [
    "businessId",
    "ownerId",
    "publicToken",
    "customerId",
    "paddleCustomerId",
    "quotesUsedThisMonth",
  ];
  for (const field of forbidden) {
    check(`${field} is not exposed`, exposed.includes(field), false);
  }

  process.stdout.write("\nunknown token\n");
  check(
    "random token returns null",
    await getQuoteByPublicToken(generatePublicToken()),
    null,
  );
  check("empty token returns null", await getQuoteByPublicToken(""), null);

  process.stdout.write("\nviewed event and status\n");
  await recordQuoteViewed(quoteId, { ip: "1.2.3.4", userAgent: "test" });
  let [afterView] = await db
    .select({ status: quotes.status })
    .from(quotes)
    .where(eq(quotes.id, quoteId));
  check("sent -> viewed", afterView?.status, "viewed");

  let events = await db
    .select({ type: quoteEvents.type })
    .from(quoteEvents)
    .where(eq(quoteEvents.quoteId, quoteId))
    .orderBy(asc(quoteEvents.createdAt));
  check(
    "viewed event recorded",
    events.map((e) => e.type),
    ["viewed"],
  );

  // A second open records another event but doesn't change status.
  await recordQuoteViewed(quoteId, { ip: "1.2.3.4", userAgent: "test" });
  events = await db
    .select({ type: quoteEvents.type })
    .from(quoteEvents)
    .where(eq(quoteEvents.quoteId, quoteId));
  check("every open is recorded", events.length, 2);

  process.stdout.write("\ndraft is not walked forward by a view\n");
  const draftToken = generatePublicToken();
  const [draft] = await db
    .insert(quotes)
    .values({
      businessId,
      quoteNumber: "Q-0002",
      title: "Draft job",
      status: "draft",
      publicToken: draftToken,
    })
    .returning({ id: quotes.id });
  await recordQuoteViewed(draft!.id, {});
  const [afterDraftView] = await db
    .select({ status: quotes.status })
    .from(quotes)
    .where(eq(quotes.id, draft!.id));
  check("draft stays draft", afterDraftView?.status, "draft");
  check("draft is not acceptable", canAccept("draft", null), false);

  process.stdout.write("\nacceptability rules\n");
  check("sent is acceptable", canAccept("sent", validUntil), true);
  check("viewed is acceptable", canAccept("viewed", validUntil), true);
  check(
    "accepted is not re-acceptable",
    canAccept("accepted", validUntil),
    false,
  );
  const past = new Date();
  past.setDate(past.getDate() - 1);
  check("expired date blocks accept", canAccept("sent", past), false);
  check("isExpired on past date", isExpired(past), true);
  check("isExpired with no date", isExpired(null), false);

  process.stdout.write("\naccept transition\n");
  await db.transaction(async (tx) => {
    await tx
      .update(quotes)
      .set({ status: "accepted" })
      .where(eq(quotes.id, quoteId));
    await tx.insert(quoteEvents).values({
      quoteId,
      type: "accepted",
      meta: { signedName: "Jane Doe", totalCents: "120158" },
    });
  });

  [afterView] = await db
    .select({ status: quotes.status })
    .from(quotes)
    .where(eq(quotes.id, quoteId));
  check("status is accepted", afterView?.status, "accepted");

  const [acceptEvent] = await db
    .select({ meta: quoteEvents.meta })
    .from(quoteEvents)
    .where(eq(quoteEvents.type, "accepted"));
  check(
    "signature captured in the event",
    (acceptEvent?.meta as Record<string, string>)?.signedName,
    "Jane Doe",
  );

  process.stdout.write("\noptions are exposed for the chooser\n");
  const [option] = await db
    .insert(quoteOptions)
    .values({ quoteId, name: "Premium", total: 208111, isRecommended: true })
    .returning({ id: quoteOptions.id });
  const withOptions = await getQuoteByPublicToken(token);
  check("option returned", withOptions?.options.length, 1);
  check(
    "recommended flag returned",
    withOptions?.options[0]?.isRecommended,
    true,
  );
  check("option total returned", withOptions?.options[0]?.total, 208111);
  check(
    "option id present for grouping",
    withOptions?.options[0]?.id,
    option!.id,
  );

  process.stdout.write("\nevents survive as the moat record\n");
  const allEvents = await db
    .select({ type: quoteEvents.type })
    .from(quoteEvents)
    .where(eq(quoteEvents.quoteId, quoteId));
  check("view + accept events retained", allEvents.length, 3);
}

try {
  await main();
} finally {
  await db.execute(`delete from auth.users where id = '${userId}'`);
  process.stdout.write(`\n${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}
