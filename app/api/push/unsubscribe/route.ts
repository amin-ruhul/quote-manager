import { type NextRequest, NextResponse } from "next/server";

import { getUser } from "@/lib/auth";
import { deletePushSubscription } from "@/lib/push";
import { rateLimit } from "@/lib/rate-limit";
import { pushUnsubscribeSchema } from "@/lib/schemas/push";

/*
 * Turns alerts off for one device (SPEC §15). The delete is scoped to the
 * session's owner, so knowing someone else's endpoint gets you nothing.
 */
export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { allowed, retryAfterSeconds } = rateLimit({
    key: `push-unsubscribe:${user.id}`,
    limit: 20,
    windowMs: 60_000,
  });
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many attempts." },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = pushUnsubscribeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid subscription." },
      { status: 400 },
    );
  }

  try {
    await deletePushSubscription(user.id, parsed.data.endpoint);
  } catch (error) {
    console.error("Removing push subscription failed", {
      ownerId: user.id,
      error,
    });
    return NextResponse.json(
      { error: "Couldn't turn off alerts. Try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
