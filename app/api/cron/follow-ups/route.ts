import { type NextRequest, NextResponse } from "next/server";

import { expireStaleQuotes, runFollowUps } from "@/lib/follow-ups";

/*
 * Scheduled follow-up job (SPEC §12). Run daily — see vercel.json.
 *
 * This endpoint sends email, so it is not public: it requires CRON_SECRET,
 * which Vercel Cron sends as `Authorization: Bearer <CRON_SECRET>`.
 */

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;

  // Refusing to run without a secret is safer than running unprotected.
  if (!secret) return false;

  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Expire first, so a quote that lapsed today isn't chased today.
    const expired = await expireStaleQuotes();
    const followUps = await runFollowUps();

    console.info("Follow-up cron finished", { expired, ...followUps });

    return NextResponse.json({ expired, ...followUps });
  } catch (error) {
    console.error("Follow-up cron failed", { error });
    return NextResponse.json({ error: "Cron run failed" }, { status: 500 });
  }
}
