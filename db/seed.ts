import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { ELECTRICIAN_INDUSTRY_CONFIG } from "./seed-data/electrician";
import { industryConfig } from "./schema";

/*
 * Seeds the industry_config table. Idempotent — safe to re-run after editing
 * the default pricebook or AI instructions.
 *
 * Run with: npm run db:seed
 */

config({ path: ".env.local" });

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DIRECT_URL (or DATABASE_URL) is not set. Add your Supabase connection string to .env.local.",
  );
}

async function seed() {
  const client = postgres(connectionString!, { max: 1, prepare: false });
  const db = drizzle(client, { schema: { industryConfig } });

  try {
    await db
      .insert(industryConfig)
      .values(ELECTRICIAN_INDUSTRY_CONFIG)
      .onConflictDoUpdate({
        target: industryConfig.industry,
        set: {
          categories: ELECTRICIAN_INDUSTRY_CONFIG.categories,
          defaultPricebook: ELECTRICIAN_INDUSTRY_CONFIG.defaultPricebook,
          aiInstructions: ELECTRICIAN_INDUSTRY_CONFIG.aiInstructions,
          defaultTerms: ELECTRICIAN_INDUSTRY_CONFIG.defaultTerms,
          quoteWording: ELECTRICIAN_INDUSTRY_CONFIG.quoteWording,
        },
      });

    process.stdout.write(
      `Seeded industry_config for "${ELECTRICIAN_INDUSTRY_CONFIG.industry}" ` +
        `(${ELECTRICIAN_INDUSTRY_CONFIG.defaultPricebook.length} pricebook items).\n`,
    );
  } finally {
    await client.end();
  }
}

seed().catch((error: unknown) => {
  process.stderr.write(`Seed failed: ${String(error)}\n`);
  process.exit(1);
});
