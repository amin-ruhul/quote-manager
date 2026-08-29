/*
 * Phase 4 verification. Makes REAL OpenAI calls against the seeded electrician
 * pricebook, so it costs a few cents and needs OPENAI_API_KEY.
 *
 * Run with: npm run verify:phase4
 */

import { config } from "dotenv";
import { asc, eq } from "drizzle-orm";

config({ path: ".env.local" });

const { db } = await import("@/lib/db");
const { industryConfig, pricebookItems } = await import("@/db/schema");
const { draftQuote } = await import("@/lib/ai");
const { DEFAULT_INDUSTRY } = await import("@/lib/constants");

let passed = 0;
let failed = 0;

function check(label: string, condition: boolean, detail = "") {
  if (condition) {
    passed += 1;
    process.stdout.write(`  PASS  ${label}\n`);
  } else {
    failed += 1;
    process.stdout.write(`  FAIL  ${label}${detail ? ` — ${detail}` : ""}\n`);
  }
}

async function main() {
  const [config_, pricebookRows] = await Promise.all([
    db
      .select({ aiInstructions: industryConfig.aiInstructions })
      .from(industryConfig)
      .where(eq(industryConfig.industry, DEFAULT_INDUSTRY))
      .limit(1),
    db
      .select({
        id: pricebookItems.id,
        name: pricebookItems.name,
        description: pricebookItems.description,
        category: pricebookItems.category,
        unit: pricebookItems.unit,
        price: pricebookItems.price,
      })
      .from(pricebookItems)
      .orderBy(asc(pricebookItems.name))
      .limit(30),
  ]);

  const instructions = config_[0]?.aiInstructions ?? "";
  check("pricebook available to draft against", pricebookRows.length > 0);
  check("industry ai_instructions seeded", instructions.length > 0);

  const priceById = new Map(pricebookRows.map((row) => [row.id, row.price]));

  process.stdout.write("\ndrafting a matched job\n");
  const matched = await draftQuote({
    jobDescription:
      "Install six recessed lights in the kitchen ceiling and fit one dimmer switch by the door.",
    pricebook: pricebookRows,
    industryInstructions: instructions,
  });

  process.stdout.write(
    `  scope: ${matched.scopeOfWork.slice(0, 90)}…\n` +
      matched.lineItems
        .map(
          (i) =>
            `  - ${i.name} x${i.quantity} ${i.unit} ` +
            `${i.needsPrice ? "[NEEDS PRICE]" : `${i.unitPrice}c`}`,
        )
        .join("\n") +
      "\n",
  );

  check("wrote a scope of work", matched.scopeOfWork.trim().length > 20);
  check("produced line items", matched.lineItems.length > 0);

  const priced = matched.lineItems.filter((item) => !item.needsPrice);
  check("matched at least one pricebook item", priced.length > 0);

  check(
    "every priced line came from the pricebook",
    priced.every(
      (item) =>
        item.pricebookItemId !== null &&
        priceById.get(item.pricebookItemId) === item.unitPrice,
    ),
    "a price did not match the pricebook",
  );

  check(
    "every unmatched line has no price",
    matched.lineItems
      .filter((item) => item.needsPrice)
      .every(
        (item) => item.unitPrice === null && item.pricebookItemId === null,
      ),
  );

  check(
    "needs_price is exactly the unmatched set",
    matched.lineItems.every(
      (item) => item.needsPrice === (item.pricebookItemId === null),
    ),
  );

  const recessed = matched.lineItems.find((item) =>
    item.name.toLowerCase().includes("recessed"),
  );
  check(
    "understood the quantity six",
    recessed?.quantity === 6,
    `got ${recessed?.quantity}`,
  );

  process.stdout.write("\ndrafting a job with nothing in the pricebook\n");
  const unmatched = await draftQuote({
    jobDescription:
      "Install a koi pond aeration pump and a heated driveway snow-melt system.",
    pricebook: pricebookRows,
    industryInstructions: instructions,
  });

  process.stdout.write(
    unmatched.lineItems
      .map(
        (i) =>
          `  - ${i.name} ${i.needsPrice ? "[NEEDS PRICE]" : `${i.unitPrice}c`}`,
      )
      .join("\n") + "\n",
  );

  check(
    "invents no price for work it cannot match",
    unmatched.lineItems.every((item) =>
      item.pricebookItemId === null
        ? item.unitPrice === null && item.needsPrice
        : priceById.get(item.pricebookItemId) === item.unitPrice,
    ),
  );

  process.stdout.write("\nsuggested additions\n");
  const panel = await draftQuote({
    jobDescription: "Replace the main service panel with a 200A panel.",
    pricebook: pricebookRows,
    industryInstructions: instructions,
  });
  process.stdout.write(
    panel.suggestedAdditions
      .map((a) => `  - ${a.name}: ${a.reason}`)
      .join("\n") + "\n",
  );
  check("suggested additions returned", panel.suggestedAdditions.length > 0);
  check(
    "suggested additions carry no price",
    panel.suggestedAdditions.every(
      (a) => !("unit_price" in a) && !("price" in a),
    ),
  );
}

try {
  await main();
} finally {
  process.stdout.write(`\n${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}
