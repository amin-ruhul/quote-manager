import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser client. Uses the publishable key only — every read and write it makes
 * is constrained by Row Level Security. Never give this the secret key.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
