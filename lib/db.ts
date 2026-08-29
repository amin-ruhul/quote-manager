import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/db/schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.example to .env.local and add your Supabase connection string.",
  );
}

/*
 * Next.js hot-reloads modules in dev, which would open a new pool on every
 * reload and exhaust Supabase's connection limit. Reuse one client per process.
 */
const globalForDb = globalThis as unknown as {
  queryClient: ReturnType<typeof postgres> | undefined;
};

const queryClient =
  globalForDb.queryClient ?? postgres(connectionString, { prepare: false });

if (process.env.NODE_ENV !== "production") {
  globalForDb.queryClient = queryClient;
}

export const db = drizzle(queryClient, { schema });
