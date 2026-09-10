import { type NextRequest, NextResponse } from "next/server";

import { getUser } from "@/lib/auth";
import { savePushSubscription } from "@/lib/push";
import { rateLimit } from "@/lib/rate-limit";
import { pushSubscriptionSchema } from "@/lib/schemas/push";

/*
 * Registers a device for push alerts (SPEC §15).
 *
 * A route handler rather than a server action because the service worker calls
 * it too: `pushsubscriptionchange` fires with no page open, so it needs a URL.
 * One code path for the settings toggle and the worker.
 *
 * The owner comes from the session — never from the body.
 */
export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  // Re-subscribing is normal, but not dozens of times a minute.
  const { allowed, retryAfterSeconds } = rateLimit({
    key: `push-subscribe:${user.id}`,
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

  const parsed = pushSubscriptionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid subscription." },
      { status: 400 },
    );
  }

  try {
    await savePushSubscription(user.id, {
      ...parsed.data,
      // Only so the owner can tell which device is which in settings.
      userAgent: request.headers.get("user-agent"),
    });
  } catch (error) {
    console.error("Saving push subscription failed", {
      ownerId: user.id,
      error,
    });
    return NextResponse.json(
      { error: "Couldn't turn on alerts. Try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
