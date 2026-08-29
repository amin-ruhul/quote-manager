import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// drizzle-kit runs outside Next, so it does not pick up .env.local on its own.
config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.example to .env.local and add your Supabase connection string.",
  );
}

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: { url: connectionString },
  strict: true,
  verbose: true,
});
