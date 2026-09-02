import "server-only";

import { and, desc, eq, notInArray } from "drizzle-orm";
import webpush, { WebPushError } from "web-push";

import { pushSubscriptions } from "@/db/schema";
import {
  MAX_PUSH_SUBSCRIPTIONS_PER_OWNER,
  PUSH_TTL_SECONDS,
} from "@/lib/constants";
import { db } from "@/lib/db";

/*
 * The only module that talks to web push (golden rule 4). VAPID keys are read
 * here and never leave the server — the public one is also exposed to the
 * browser as NEXT_PUBLIC_VAPID_PUBLIC_KEY, which is what the spec intends: it
 * is the key the browser encrypts to, and it identifies us to the push service.
 *
 * Everything here is best-effort. A notification that fails must never break
 * the customer's accept or the owner's request, so failures are logged and
 * swallowed rather than thrown.
 */

/** What the service worker receives and turns into a notification. */
export type PushPayload = {
  title: string;
  body: string;
  /** Where tapping the notification should land, e.g. /quotes/<id>. */
  url: string;
  /** Alerts sharing a tag replace each other instead of stacking. */
  tag: string;
};

/** A subscription as the browser's own `subscription.toJSON()` gives it. */
export type PushDeviceInput = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  userAgent?: string | null;
};

export type PushSendResult = { sent: number; failed: number; pruned: number };

let configured: boolean | null = null;

/**
 * True when the VAPID keys are set. Callers that owe the owner an explanation
 * (the settings screen, the test button) check this; the notification paths
 * just no-op.
 */
export function isPushConfigured(): boolean {
  if (configured !== null) return configured;

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;

  if (!publicKey || !privateKey || !subject) {
    configured = false;
    return configured;
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
  return configured;
}

/**
 * Records a device against an owner.
 *
 * Upserts on the endpoint rather than inserting: browsers re-subscribe on their
 * own, and the same endpoint may come back under a different owner if two
 * people share a phone. The row must follow the endpoint, or one owner's "quote
 * accepted" alert would land on someone else's lock screen.
 */
export async function savePushSubscription(
  ownerId: string,
  input: PushDeviceInput,
): Promise<void> {
  const now = new Date();

  await db
    .insert(pushSubscriptions)
    .values({
      ownerId,
      endpoint: input.endpoint,
      p256dh: input.keys.p256dh,
      auth: input.keys.auth,
      userAgent: input.userAgent ?? null,
      lastSeenAt: now,
    })
    .onConflictDoUpdate({
      target: pushSubscriptions.endpoint,
      set: {
        ownerId,
        p256dh: input.keys.p256dh,
        auth: input.keys.auth,
        userAgent: input.userAgent ?? null,
        lastSeenAt: now,
      },
    });

  await pruneOldestSubscriptions(ownerId);
}

/** Drops everything past the newest MAX_PUSH_SUBSCRIPTIONS_PER_OWNER devices. */
async function pruneOldestSubscriptions(ownerId: string): Promise<void> {
  const keep = db
    .select({ id: pushSubscriptions.id })
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.ownerId, ownerId))
    .orderBy(desc(pushSubscriptions.lastSeenAt))
    .limit(MAX_PUSH_SUBSCRIPTIONS_PER_OWNER);

  await db
    .delete(pushSubscriptions)
    .where(
      and(
        eq(pushSubscriptions.ownerId, ownerId),
        notInArray(pushSubscriptions.id, keep),
      ),
    );
}

/** Turns alerts off for one device. Scoped to the owner, never the endpoint alone. */
export async function deletePushSubscription(
  ownerId: string,
  endpoint: string,
): Promise<void> {
  await db
    .delete(pushSubscriptions)
    .where(
      and(
        eq(pushSubscriptions.ownerId, ownerId),
        eq(pushSubscriptions.endpoint, endpoint),
      ),
    );
}

/** How many devices this owner would be alerted on. */
export async function countPushSubscriptions(ownerId: string): Promise<number> {
  const rows = await db
    .select({ id: pushSubscriptions.id })
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.ownerId, ownerId));

  return rows.length;
}

/**
 * Sends one notification to every device the owner has registered.
 *
 * A 404 or 410 from the push service is the browser telling us the subscription
 * is dead — those rows are deleted, which is what keeps this from slowly
 * turning into a pile of doomed requests.
 */
export async function sendPushToOwner(
  ownerId: string,
  payload: PushPayload,
): Promise<PushSendResult> {
  const empty: PushSendResult = { sent: 0, failed: 0, pruned: 0 };

  if (!isPushConfigured()) {
    console.warn("Push not configured; skipping notification", { ownerId });
    return empty;
  }

  const devices = await db
    .select({
      endpoint: pushSubscriptions.endpoint,
      p256dh: pushSubscriptions.p256dh,
      auth: pushSubscriptions.auth,
    })
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.ownerId, ownerId));

  if (devices.length === 0) return empty;

  const body = JSON.stringify(payload);

  const results = await Promise.allSettled(
    devices.map((device) =>
      webpush.sendNotification(
        {
          endpoint: device.endpoint,
          keys: { p256dh: device.p256dh, auth: device.auth },
        },
        body,
        { TTL: PUSH_TTL_SECONDS },
      ),
    ),
  );

  const dead: string[] = [];
  let sent = 0;
  let failed = 0;

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      sent += 1;
      return;
    }

    failed += 1;
    const endpoint = devices[index]!.endpoint;

    if (isGone(result.reason)) {
      dead.push(endpoint);
      return;
    }

    console.error("Push delivery failed", {
      ownerId,
      statusCode:
        result.reason instanceof WebPushError
          ? result.reason.statusCode
          : undefined,
      error: result.reason,
    });
  });

  if (dead.length > 0) await pruneDeadSubscriptions(ownerId, dead);

  return { sent, failed, pruned: dead.length };
}

/** 404/410: the push service has forgotten this subscription for good. */
function isGone(error: unknown): boolean {
  return (
    error instanceof WebPushError &&
    (error.statusCode === 404 || error.statusCode === 410)
  );
}

async function pruneDeadSubscriptions(
  ownerId: string,
  endpoints: string[],
): Promise<void> {
  try {
    for (const endpoint of endpoints) {
      await deletePushSubscription(ownerId, endpoint);
    }
  } catch (error) {
    // Losing the cleanup is survivable; the next send will try again.
    console.error("Pruning dead push subscriptions failed", { ownerId, error });
  }
}
