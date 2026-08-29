import "server-only";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { businesses, profiles } from "@/db/schema";
import type { Business } from "@/db/schema";

/*
 * Two layers protect tenant data, and both are required (golden rule 6):
 *
 * 1. Drizzle connects as the database owner, so RLS does NOT apply to it.
 *    Every Drizzle query here must therefore filter by ownerId/businessId
 *    explicitly, taken from the session — never from the client.
 * 2. RLS covers the paths Drizzle doesn't: the browser Supabase client and,
 *    later, the public quote page.
 *
 * Treat an unscoped Drizzle query as a bug.
 */

/** The signed-in user, or null. Revalidates the token with Supabase. */
export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** The signed-in user, or a redirect to /login. */
export async function requireUser() {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
}

/**
 * Every auth user gets exactly one profile row. Created on first authenticated
 * request rather than by a database trigger, so the logic stays in the repo.
 */
export async function ensureProfile(userId: string, email: string) {
  await db
    .insert(profiles)
    .values({ id: userId, email })
    .onConflictDoNothing({ target: profiles.id });
}

/** The user's business, or null when they haven't onboarded yet. */
export async function getBusinessForOwner(
  ownerId: string,
): Promise<Business | null> {
  const [business] = await db
    .select()
    .from(businesses)
    .where(eq(businesses.ownerId, ownerId))
    .limit(1);

  return business ?? null;
}

/**
 * The current user plus their business. Sends them to onboarding if they have
 * no business yet — every in-app screen needs one.
 */
export async function requireBusiness() {
  const user = await requireUser();
  const business = await getBusinessForOwner(user.id);
  if (!business) redirect("/onboarding");
  return { user, business };
}
