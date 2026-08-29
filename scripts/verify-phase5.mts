/*
 * Phase 5 verification.
 *
 * Sends REAL email through Resend, but only to delivered@resend.dev — Resend's
 * simulator address, which accepts and discards. No human is emailed.
 *
 * Run with: npm run verify:phase5
 */

import { config } from "dotenv";
import { eq } from "drizzle-orm";

config({ path: ".env.local" });

const { db } = await import("@/lib/db");
const { businesses, customers, profiles, quoteEvents, quotes } =
  await import("@/db/schema");
const { sendEmail } = await import("@/lib/email");
const { quoteSentEmail, escapeHtml } = await import("@/lib/email-templates");
const { runFollowUps, expireStaleQuotes } = await import("@/lib/follow-ups");
const { getMonthStats, getRecentQuotes, startOfThisMonth } =
  await import("@/lib/dashboard");
const { followUpDaysFor } = await import("@/lib/constants");

const SIMULATOR = "delivered@resend.dev";

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
const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

async function main() {
  await db.execute(
    `insert into auth.users (id, instance_id, aud, role, email, encrypted_password, created_at, updated_at)
     values ('${userId}', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
             'p5-${userId}@example.test', '', now(), now())`,
  );
  await db.insert(profiles).values({ id: userId, email: SIMULATOR });

  const [business] = await db
    .insert(businesses)
    .values({
      ownerId: userId,
      name: "Verify Electric",
      email: SIMULATOR,
      settings: { followUpDays: 2 },
    })
    .returning({ id: businesses.id, settings: businesses.settings });
  const businessId = business!.id;

  const [customer] = await db
    .insert(customers)
    .values({
      businessId,
      firstName: "Jane",
      lastName: "Doe",
      email: SIMULATOR,
    })
    .returning({ id: customers.id });

  process.stdout.write("\nsettings\n");
  check(
    "followUpDays read from settings",
    followUpDaysFor(business!.settings),
    2,
  );
  check("unset settings fall back to default", followUpDaysFor(null), 2);
  check("bad value falls back", followUpDaysFor({ followUpDays: 99 }), 2);
  check("off is honoured", followUpDaysFor({ followUpDays: 0 }), 0);

  process.stdout.write("\nsending a real email through Resend\n");
  const sent = await sendEmail({
    to: SIMULATOR,
    replyTo: SIMULATOR,
    content: quoteSentEmail({
      businessName: "Verify Electric",
      customerName: "Jane Doe",
      quoteTitle: "Kitchen lighting",
      totalFormatted: "$1,201.58",
      quoteUrl: "https://example.test/q/abc",
      validUntil: "30 September 2026",
    }),
  });
  check("Resend accepted the message", sent.error, null);
  process.stdout.write(`  message id: ${sent.id}\n`);

  process.stdout.write("\nhtml escaping\n");
  check(
    "markup in a business name is escaped",
    escapeHtml('<script>alert("x")</script>'),
    "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;",
  );

  process.stdout.write("\nfollow-up: due quote gets one nudge\n");
  const [dueQuote] = await db
    .insert(quotes)
    .values({
      businessId,
      customerId: customer!.id,
      quoteNumber: "Q-0001",
      title: "Due for a nudge",
      status: "sent",
      total: 120158,
      publicToken: crypto.randomUUID(),
      createdAt: daysAgo(5),
    })
    .returning({ id: quotes.id });
  await db.insert(quoteEvents).values({
    quoteId: dueQuote!.id,
    type: "sent",
    meta: {},
    createdAt: daysAgo(5),
  });

  let run = await runFollowUps();
  check("one nudge sent", run.sent, 1);

  let events = await db
    .select({ type: quoteEvents.type })
    .from(quoteEvents)
    .where(eq(quoteEvents.quoteId, dueQuote!.id));
  check(
    "follow_up_sent recorded",
    events.filter((e) => e.type === "follow_up_sent").length,
    1,
  );

  process.stdout.write("\nfollow-up: never nudges twice\n");
  run = await runFollowUps();
  check("second run sends nothing", run.sent, 0);
  events = await db
    .select({ type: quoteEvents.type })
    .from(quoteEvents)
    .where(eq(quoteEvents.quoteId, dueQuote!.id));
  check(
    "still exactly one follow_up_sent",
    events.filter((e) => e.type === "follow_up_sent").length,
    1,
  );

  process.stdout.write("\nfollow-up: not yet due\n");
  const [freshQuote] = await db
    .insert(quotes)
    .values({
      businessId,
      customerId: customer!.id,
      quoteNumber: "Q-0002",
      title: "Sent today",
      status: "sent",
      total: 50000,
      publicToken: crypto.randomUUID(),
    })
    .returning({ id: quotes.id });
  await db
    .insert(quoteEvents)
    .values({ quoteId: freshQuote!.id, type: "sent", meta: {} });

  run = await runFollowUps();
  check("today's quote is skipped", run.sent, 0);

  process.stdout.write("\nfollow-up: accepted quotes are left alone\n");
  const [acceptedQuote] = await db
    .insert(quotes)
    .values({
      businessId,
      customerId: customer!.id,
      quoteNumber: "Q-0003",
      title: "Already won",
      status: "accepted",
      total: 285000,
      publicToken: crypto.randomUUID(),
      createdAt: daysAgo(10),
    })
    .returning({ id: quotes.id });
  run = await runFollowUps();
  check("accepted quote never nudged", run.sent, 0);

  process.stdout.write("\nfollow-up: owner switched nudges off\n");
  await db
    .update(businesses)
    .set({ settings: { followUpDays: 0 } })
    .where(eq(businesses.id, businessId));
  const [offQuote] = await db
    .insert(quotes)
    .values({
      businessId,
      customerId: customer!.id,
      quoteNumber: "Q-0004",
      title: "Nudges disabled",
      status: "sent",
      total: 10000,
      publicToken: crypto.randomUUID(),
      createdAt: daysAgo(30),
    })
    .returning({ id: quotes.id });
  await db.insert(quoteEvents).values({
    quoteId: offQuote!.id,
    type: "sent",
    meta: {},
    createdAt: daysAgo(30),
  });

  run = await runFollowUps();
  check("nothing sent when set to off", run.sent, 0);
  await db
    .update(businesses)
    .set({ settings: { followUpDays: 2 } })
    .where(eq(businesses.id, businessId));

  process.stdout.write("\nexpiry\n");
  const [staleQuote] = await db
    .insert(quotes)
    .values({
      businessId,
      quoteNumber: "Q-0005",
      title: "Lapsed",
      status: "sent",
      total: 1000,
      publicToken: crypto.randomUUID(),
      validUntil: daysAgo(1),
    })
    .returning({ id: quotes.id });
  const expiredCount = await expireStaleQuotes();
  check("at least one quote expired", expiredCount >= 1, true);
  const [afterExpiry] = await db
    .select({ status: quotes.status })
    .from(quotes)
    .where(eq(quotes.id, staleQuote!.id));
  check("stale quote is now expired", afterExpiry?.status, "expired");

  process.stdout.write("\ndashboard\n");
  const stats = await getMonthStats(businessId, startOfThisMonth());
  process.stdout.write(
    `  sent=${stats.sent} accepted=${stats.accepted} rate=${stats.acceptanceRateBasisPoints}bp ` +
      `quoted=${stats.quotedCents}c won=${stats.wonCents}c\n`,
  );
  check("accepted counted", stats.accepted, 1);
  check("won equals the accepted total", stats.wonCents, 285000);
  check(
    "acceptance rate is accepted over sent",
    stats.acceptanceRateBasisPoints,
    Math.round((stats.accepted / stats.sent) * 10_000),
  );
  /*
   * Five non-draft quotes exist, but Q-0004 was created 30 days ago and so
   * falls outside this month. Counting 4 is the month boundary doing its job.
   */
  check("this month's non-draft quotes only", stats.sent, 4);

  const recent = await getRecentQuotes(businessId, 3);
  check("recent quotes limited", recent.length, 3);

  process.stdout.write("\nempty month is zero, not NaN\n");
  const emptyStats = await getMonthStats(
    crypto.randomUUID(),
    startOfThisMonth(),
  );
  check("no divide by zero", emptyStats.acceptanceRateBasisPoints, 0);
  check("no quotes", emptyStats.sent, 0);

  void acceptedQuote;
}

try {
  await main();
} finally {
  await db.execute(`delete from auth.users where id = '${userId}'`);
  process.stdout.write(`\n${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}
