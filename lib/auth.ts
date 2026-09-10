import "server-only";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { cache } from "react";

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

export type SessionUser = { id: string; email: string | null };

/**
 * The name typed at registration, which lives on the auth user's metadata until
 * a session exists to copy it into `profiles`. Metadata is untyped by
 * definition, so it is read defensively rather than trusted.
 */
export function fullNameFromMetadata(
  metadata: Record<string, unknown> | undefined,
): string | null {
  const value = metadata?.full_name;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

/**
 * The signed-in user, or null.
 *
 * Uses getClaims() rather than getUser(): this project signs JWTs with ES256
 * and publishes a JWKS, so the token is verified locally against the public key
 * with no network call. getUser() costs a ~500ms round trip to Supabase Auth,
 * and it was being paid three times per page load.
 *
 * Trade-off: local verification trusts the token until it expires, so a session
 * revoked server-side stays valid until the access token refreshes. That is the
 * right call for reading a pricebook; anything destructive should re-check.
 *
 * NEVER swap this for getSession(), which does no verification at all.
 *
 * cache() dedupes the call across the layout, the page and any server action in
 * the same request.
 */
export const getUser = cache(async (): Promise<SessionUser | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  const claims = data?.claims;
  if (error || !claims?.sub) return null;

  return {
    id: claims.sub,
    email: typeof claims.email === "string" ? claims.email : null,
  };
});

/** The signed-in user, or a redirect to /login. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
}

/**
 * Every auth user gets exactly one profile row. Created on first authenticated
 * request rather than by a database trigger, so the logic stays in the repo.
 *
 * The name is typed at registration, but with email confirmation switched on
 * there is no session then — so it is parked on the auth user's metadata and
 * copied down here, on the first request that actually has a session.
 */
export async function ensureProfile(
  userId: string,
  email: string,
  fullName?: string | null,
) {
  await db
    .insert(profiles)
    .values({ id: userId, email, fullName: fullName ?? null })
    .onConflictDoNothing({ target: profiles.id });
}

/**
 * The user's business, or null when they haven't onboarded yet.
 * Cached per request — generateMetadata and the page body both need it.
 */
export const getBusinessForOwner = cache(
  async (ownerId: string): Promise<Business | null> => {
    const [business] = await db
      .select()
      .from(businesses)
      .where(eq(businesses.ownerId, ownerId))
      .limit(1);

    return business ?? null;
  },
);

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
