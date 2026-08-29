import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// drizzle-kit runs outside Next, so it does not pick up .env.local on its own.
config({ path: ".env.local" });

/*
 * Migrations run DDL, which needs a real session — the transaction-mode pooler
 * on :6543 can't hold one. Prefer DIRECT_URL (:5432) and fall back to
 * DATABASE_URL for setups that only have the one connection string.
 */
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DIRECT_URL (or DATABASE_URL) is not set. Copy .env.example to .env.local and add your Supabase connection string.",
  );
}

export default defineConfig({
  schema: "./db/schema/*.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: { url: connectionString },
  strict: true,
  verbose: true,
});
