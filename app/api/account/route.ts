import { NextResponse } from "next/server";

import type { LandingAccount } from "@/components/landing/landing-nav";
import { getBusinessForOwner, getUser } from "@/lib/auth";
import { getPlanStatus } from "@/lib/plan";

/*
 * Who is signed in, for the marketing nav.
 *
 * The marketing pages used to read the session in their layout. That one
 * cookie read made every public page dynamic and `no-store`, so the CDN could
 * never serve the homepage or a blog post from cache. The pages are now built
 * once and are identical for everyone; the nav asks this route, from the
 * browser, whether to swap "Log in" for the account menu.
 *
 * The answer is about one person, so it must never be cached anywhere shared.
 * `private, no-store` says so explicitly rather than trusting the default.
 */
const PRIVATE = { "Cache-Control": "private, no-store" };

export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ account: null }, { headers: PRIVATE });
  }

  const [business, planStatus] = await Promise.all([
    getBusinessForOwner(user.id),
    getPlanStatus(user.id),
  ]);
  const account: LandingAccount = {
    email: user.email,
    businessName: business?.name ?? null,
    plan: planStatus.plan,
  };
  return NextResponse.json({ account }, { headers: PRIVATE });
}
