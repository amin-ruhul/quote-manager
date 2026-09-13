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
    /*
     * One field, on purpose.
     *
     * Nothing an owner can write for themselves is seeded any more: no starter
     * pricebook, no pre-filled terms. Prices and terms that arrived from us,
     * carrying our assumptions, read as the owner's own and get sent to a
     * customer unexamined — the quote then says something nobody chose.
     *
     * `aiInstructions` is the exception because it is not the owner's content
     * at all. It is the trade knowledge in our prompt, read by
     * app/(app)/quotes/[id]/ai-actions.ts on every draft, and it never appears
     * in a quote. Skip this and AI drafting still runs, just ignorant — which
     * is the failure nobody notices.
     *
     * The pricebook category dropdown needs nothing here either: it comes from
     * SUGGESTED_PRICEBOOK_CATEGORIES in lib/constants.ts plus whatever the
     * owner has already typed.
     */
    const row = {
      industry: ELECTRICIAN_INDUSTRY_CONFIG.industry,
      aiInstructions: ELECTRICIAN_INDUSTRY_CONFIG.aiInstructions,
    };

    await db
      .insert(industryConfig)
      .values(row)
      .onConflictDoUpdate({
        target: industryConfig.industry,
        set: { aiInstructions: row.aiInstructions },
      });

    process.stdout.write(
      `Seeded industry_config for "${row.industry}" (AI instructions only).\n`,
    );
  } finally {
    await client.end();
  }
}

seed().catch((error: unknown) => {
  process.stderr.write(`Seed failed: ${String(error)}\n`);
  process.exit(1);
});
