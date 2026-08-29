/*
 * Phase 2 verification against the real database.
 *
 * Exercises the actual server code — nextQuoteNumber, recalculateQuote,
 * getQuoteForBusiness — rather than reimplementing the maths, so a bug in
 * lib/quotes.ts fails here.
 *
 * Creates a throwaway business under a temporary auth user and deletes both at
 * the end, so it never touches real data. Run with: npx tsx scripts/verify-phase2.ts
 */

import { config } from "dotenv";
import { and, eq } from "drizzle-orm";

config({ path: ".env.local" });

const { db } = await import("@/lib/db");
const {
  businesses,
  customers,
  profiles,
  pricebookItems,
  quoteItems,
  quoteOptions,
  quotes,
} = await import("@/db/schema");
const {
  getQuoteForBusiness,
  nextQuoteNumber,
  recalculateQuote,
  generatePublicToken,
} = await import("@/lib/quotes");

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
let businessId = "";

async function main() {
  // A profile needs a matching auth.users row (FK), so create one directly.
  await db.execute(
    `insert into auth.users (id, instance_id, aud, role, email, encrypted_password, created_at, updated_at)
     values ('${userId}', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
             'verify-${userId}@example.test', '', now(), now())`,
  );
  await db
    .insert(profiles)
    .values({ id: userId, email: `verify@example.test` });

  const [business] = await db
    .insert(businesses)
    .values({
      ownerId: userId,
      name: "Verify Electric",
      defaultTaxRate: 825, // 8.25%
    })
    .returning({
      id: businesses.id,
      defaultTaxRate: businesses.defaultTaxRate,
    });
  businessId = business!.id;

  process.stdout.write("\nquote numbering\n");
  const firstNumber = await nextQuoteNumber(db, businessId);
  check("first quote number", firstNumber, "Q-0001");

  const [pricebookItem] = await db
    .insert(pricebookItems)
    .values({
      businessId,
      name: "Recessed light",
      unit: "each",
      price: 18500, // $185.00
      category: "Lighting",
    })
    .returning({ id: pricebookItems.id, price: pricebookItems.price });

  const [customer] = await db
    .insert(customers)
    .values({ businessId, firstName: "Jane", lastName: "Doe" })
    .returning({ id: customers.id });

  const [quote] = await db
    .insert(quotes)
    .values({
      businessId,
      customerId: customer!.id,
      quoteNumber: firstNumber,
      title: "Kitchen lighting",
      taxRate: business!.defaultTaxRate,
      publicToken: generatePublicToken(),
    })
    .returning({ id: quotes.id });
  const quoteId = quote!.id;

  const secondNumber = await nextQuoteNumber(db, businessId);
  check("second quote number increments", secondNumber, "Q-0002");

  process.stdout.write("\ntotals: single price\n");
  // 6 recessed lights: quantity 600 (scaled), $185.00 each.
  await db.insert(quoteItems).values({
    quoteId,
    name: "Recessed light",
    quantity: 600,
    unit: "each",
    unitPrice: pricebookItem!.price,
    total: 111000,
    type: "qty",
    position: 0,
  });
  // 2.5 hours labour at $125.00.
  await db.insert(quoteItems).values({
    quoteId,
    name: "Labour",
    quantity: 250,
    unit: "hour",
    unitPrice: 12500,
    total: 31250,
    type: "hourly",
    position: 1,
  });

  await recalculateQuote(quoteId);
  let loaded = await getQuoteForBusiness(quoteId, businessId);
  check("subtotal", loaded?.quote.subtotal, 142250);
  check("tax at 8.25%", loaded?.quote.tax, 11736);
  check("total", loaded?.quote.total, 153986);
  check(
    "every money field is an integer",
    [
      loaded?.quote.subtotal,
      loaded?.quote.discount,
      loaded?.quote.tax,
      loaded?.quote.total,
    ].every(Number.isInteger),
    true,
  );

  process.stdout.write("\ntotals: discount taxes the reduced base\n");
  await db
    .update(quotes)
    .set({ discount: 42250 })
    .where(eq(quotes.id, quoteId));
  await recalculateQuote(quoteId);
  loaded = await getQuoteForBusiness(quoteId, businessId);
  check("discount stored", loaded?.quote.discount, 42250);
  check("tax on 100000, not 142250", loaded?.quote.tax, 8250);
  check("total", loaded?.quote.total, 108250);

  process.stdout.write("\ntotals: discount larger than subtotal is clamped\n");
  await db
    .update(quotes)
    .set({ discount: 99999999 })
    .where(eq(quotes.id, quoteId));
  await recalculateQuote(quoteId);
  loaded = await getQuoteForBusiness(quoteId, businessId);
  check("discount clamped to subtotal", loaded?.quote.discount, 142250);
  check("total floors at zero", loaded?.quote.total, 0);

  await db.update(quotes).set({ discount: 0 }).where(eq(quotes.id, quoteId));

  process.stdout.write("\ngood/better/best\n");
  const [standard] = await db
    .insert(quoteOptions)
    .values({ quoteId, name: "Standard", position: 0 })
    .returning({ id: quoteOptions.id });
  const [premium] = await db
    .insert(quoteOptions)
    .values({ quoteId, name: "Premium", position: 1 })
    .returning({ id: quoteOptions.id });

  // $500 extra only in Premium.
  await db.insert(quoteItems).values({
    quoteId,
    optionId: premium!.id,
    name: "Dimmers throughout",
    quantity: 100,
    unit: "job",
    unitPrice: 50000,
    total: 50000,
    type: "fixed",
    position: 2,
  });

  await recalculateQuote(quoteId);
  loaded = await getQuoteForBusiness(quoteId, businessId);
  const standardTotal = loaded?.options.find(
    (o) => o.id === standard!.id,
  )?.total;
  const premiumTotal = loaded?.options.find((o) => o.id === premium!.id)?.total;

  check("standard = shared lines only", standardTotal, 153986);
  check("premium = shared + its own line", premiumTotal, 208111);
  check(
    "headline follows first option when none recommended",
    loaded?.quote.total,
    153986,
  );

  await db
    .update(quoteOptions)
    .set({ isRecommended: true })
    .where(eq(quoteOptions.id, premium!.id));
  await recalculateQuote(quoteId);
  loaded = await getQuoteForBusiness(quoteId, businessId);
  check("headline follows the recommended option", loaded?.quote.total, 208111);

  process.stdout.write("\ndiscount line type subtracts\n");
  await db.insert(quoteItems).values({
    quoteId,
    name: "Repeat customer discount",
    quantity: 100,
    unit: "job",
    unitPrice: 10000,
    total: -10000,
    type: "discount",
    position: 3,
  });
  await recalculateQuote(quoteId);
  loaded = await getQuoteForBusiness(quoteId, businessId);
  check("subtotal drops by the discount line", loaded?.quote.subtotal, 182250);

  process.stdout.write("\ntenant isolation\n");
  const otherBusinessId = crypto.randomUUID();
  const wrongTenant = await getQuoteForBusiness(quoteId, otherBusinessId);
  check("another business cannot load the quote", wrongTenant, null);

  process.stdout.write("\ncustomer delete keeps quote history\n");
  await db
    .delete(customers)
    .where(
      and(eq(customers.id, customer!.id), eq(customers.businessId, businessId)),
    );
  const [afterDelete] = await db
    .select({ id: quotes.id, customerId: quotes.customerId })
    .from(quotes)
    .where(eq(quotes.id, quoteId));
  check("quote survives", afterDelete?.id, quoteId);
  check("customer_id set to null", afterDelete?.customerId, null);

  process.stdout.write("\ncascade on quote delete\n");
  await db.delete(quotes).where(eq(quotes.id, quoteId));
  const orphanItems = await db
    .select({ id: quoteItems.id })
    .from(quoteItems)
    .where(eq(quoteItems.quoteId, quoteId));
  const orphanOptions = await db
    .select({ id: quoteOptions.id })
    .from(quoteOptions)
    .where(eq(quoteOptions.quoteId, quoteId));
  check("items cascade", orphanItems.length, 0);
  check("options cascade", orphanOptions.length, 0);
}

try {
  await main();
} finally {
  // Deleting the auth user cascades to profile -> business -> everything else.
  await db.execute(`delete from auth.users where id = '${userId}'`);
  process.stdout.write(`\n${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}
