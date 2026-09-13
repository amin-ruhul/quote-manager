import { NextResponse } from "next/server";

import { getUser } from "@/lib/auth";
import { isPushConfigured, sendPushToOwner } from "@/lib/push";
import { rateLimit } from "@/lib/rate-limit";

/*
 * "Send a test notification" from the settings screen (SPEC §15).
 *
 * This is how an owner confirms alerts actually reach their phone before they
 * depend on it for a real acceptance — and how we verify the whole path
 * end-to-end without waiting for a customer.
 */
export async function POST() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  // A test is a deliberate act, so a handful an hour is plenty.
  const { allowed, retryAfterSeconds } = rateLimit({
    key: `push-test:${user.id}`,
    limit: 5,
    windowMs: 10 * 60_000,
  });
  if (!allowed) {
    return NextResponse.json(
      { error: "Give it a minute before testing again." },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
    );
  }

  // Unlike the notification paths, this one owes the owner an explanation.
  if (!isPushConfigured()) {
    return NextResponse.json(
      { error: "Push isn't set up on this server yet." },
      { status: 503 },
    );
  }

  try {
    const result = await sendPushToOwner(user.id, {
      title: "QuotePace alerts are on",
      body: "This is what a quote alert will look like.",
      url: "/dashboard",
      tag: "test",
    });

    if (result.sent === 0) {
      return NextResponse.json(
        {
          error:
            "No device is registered for alerts. Turn them on again on this device.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("Test push failed", { ownerId: user.id, error });
    return NextResponse.json(
      { error: "Couldn't send the test. Try again." },
      { status: 500 },
    );
  }
}
