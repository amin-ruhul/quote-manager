/*
 * Push plumbing verification (SPEC §15).
 *
 * Exercises the real database: the upsert that keeps one row per device, the
 * cap that stops endpoints piling up, and the owner scoping on delete. It never
 * reaches a real push service unless VAPID keys are configured, and even then
 * only with a junk endpoint that is expected to be rejected.
 *
 * Run with: npm run verify:push
 */

import { createECDH, randomBytes } from "node:crypto";

import { config } from "dotenv";
import { eq } from "drizzle-orm";

config({ path: ".env.local" });

const { db } = await import("@/lib/db");
const { profiles, pushSubscriptions } = await import("@/db/schema");
const {
  countPushSubscriptions,
  deletePushSubscription,
  isPushConfigured,
  savePushSubscription,
  sendPushToOwner,
} = await import("@/lib/push");
const { MAX_PUSH_SUBSCRIPTIONS_PER_OWNER } = await import("@/lib/constants");

let passed = 0;
let failed = 0;

function check(label: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) {
    passed += 1;
    process.stdout.write(`  PASS  ${label}\n`);
  } else {
    failed += 1;
    process.stdout.write(
      `  FAIL  ${label}\n        expected ${JSON.stringify(expected)}\n        actual   ${JSON.stringify(actual)}\n`,
    );
  }
}

const ownerA = crypto.randomUUID();
const ownerB = crypto.randomUUID();

/** A plausible push endpoint. Nothing is ever delivered to it. */
const endpoint = (suffix: string) =>
  `https://fcm.googleapis.com/fcm/send/verify-${suffix}`;

/*
 * A real P-256 keypair, not a placeholder. web-push encrypts the payload
 * locally before it sends anything, so junk keys fail here and the request
 * never leaves the machine — which would hide the pruning behaviour below.
 */
function deviceKeys() {
  const ecdh = createECDH("prime256v1");
  ecdh.generateKeys();
  return {
    p256dh: ecdh.getPublicKey().toString("base64url"),
    auth: randomBytes(16).toString("base64url"),
  };
}

const keys = deviceKeys();

async function createOwner(id: string) {
  await db.execute(
    `insert into auth.users (id, instance_id, aud, role, email, encrypted_password, created_at, updated_at)
     values ('${id}', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
             'push-${id}@example.test', '', now(), now())`,
  );
  await db.insert(profiles).values({ id, email: `push-${id}@example.test` });
}

async function main() {
  await createOwner(ownerA);
  await createOwner(ownerB);

  process.stdout.write("\none row per device\n");
  await savePushSubscription(ownerA, { endpoint: endpoint("1"), keys });
  check("device registered", await countPushSubscriptions(ownerA), 1);

  // A browser re-subscribing with the same endpoint must not create a second
  // row, or every alert would arrive twice on the same phone.
  await savePushSubscription(ownerA, {
    endpoint: endpoint("1"),
    keys: { p256dh: "rotated-p256dh", auth: "rotated-auth" },
  });
  check(
    "re-subscribing updates in place",
    await countPushSubscriptions(ownerA),
    1,
  );

  const [refreshed] = await db
    .select({ p256dh: pushSubscriptions.p256dh })
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.endpoint, endpoint("1")))
    .limit(1);
  check("rotated keys were stored", refreshed?.p256dh, "rotated-p256dh");

  process.stdout.write("\na device follows its current owner\n");
  /*
   * Two people sharing a phone is the case that matters: if the row stayed with
   * owner A, A's "quote accepted" alert would land on B's lock screen.
   */
  await savePushSubscription(ownerB, { endpoint: endpoint("1"), keys });
  check("moved to the new owner", await countPushSubscriptions(ownerB), 1);
  check("gone from the old owner", await countPushSubscriptions(ownerA), 0);

  process.stdout.write("\ndevices are capped per owner\n");
  for (let i = 0; i < MAX_PUSH_SUBSCRIPTIONS_PER_OWNER + 3; i += 1) {
    await savePushSubscription(ownerA, {
      endpoint: endpoint(`cap-${i}`),
      keys,
    });
  }
  check(
    "oldest devices dropped",
    await countPushSubscriptions(ownerA),
    MAX_PUSH_SUBSCRIPTIONS_PER_OWNER,
  );

  const survivors = await db
    .select({ endpoint: pushSubscriptions.endpoint })
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.ownerId, ownerA));
  check(
    "the newest device survived",
    survivors.some(
      (row) =>
        row.endpoint ===
        endpoint(`cap-${MAX_PUSH_SUBSCRIPTIONS_PER_OWNER + 2}`),
    ),
    true,
  );

  process.stdout.write("\ndeleting is scoped to the owner\n");
  // Owner A knows B's endpoint, and still can't remove it.
  await deletePushSubscription(ownerA, endpoint("1"));
  check(
    "another owner's device untouched",
    await countPushSubscriptions(ownerB),
    1,
  );

  await deletePushSubscription(ownerB, endpoint("1"));
  check("own device removed", await countPushSubscriptions(ownerB), 0);

  process.stdout.write("\nsending\n");
  check(
    "no devices is not an error",
    await sendPushToOwner(ownerB, {
      title: "t",
      body: "b",
      url: "/dashboard",
      tag: "verify",
    }),
    { sent: 0, failed: 0, pruned: 0 },
  );

  if (!isPushConfigured()) {
    process.stdout.write(
      "  SKIP  dead-endpoint pruning (set the VAPID vars to run it)\n",
    );
  } else {
    /*
     * The endpoints above are invented, so the push service answers 404 —
     * which is exactly the signal that should delete the row. This is the one
     * part of the script that talks to the network.
     */
    const result = await sendPushToOwner(ownerA, {
      title: "Verification",
      body: "Not delivered anywhere.",
      url: "/dashboard",
      tag: "verify",
    });
    check("nothing was delivered", result.sent, 0);
    check("dead endpoints pruned", result.pruned, result.failed);
    check("rows removed", await countPushSubscriptions(ownerA), 0);

    process.stdout.write("\na broken device is not a dead one\n");
    /*
     * Malformed keys fail during local encryption, before the push service is
     * ever asked. That is not the browser telling us the subscription is gone,
     * so the row must survive for the owner to fix by re-subscribing.
     */
    await savePushSubscription(ownerA, {
      endpoint: endpoint("broken"),
      keys: { p256dh: "not-a-real-key", auth: "nope" },
    });
    const broken = await sendPushToOwner(ownerA, {
      title: "Verification",
      body: "Never encrypted.",
      url: "/dashboard",
      tag: "verify",
    });
    check("counted as a failure", broken.failed, 1);
    check("not pruned", broken.pruned, 0);
    check("row kept", await countPushSubscriptions(ownerA), 1);
  }

  process.stdout.write("\nrls\n");
  const [rls] = await db.execute<{ relrowsecurity: boolean }>(
    `select relrowsecurity from pg_class where relname = 'push_subscriptions'`,
  );
  check("row level security is on", rls?.relrowsecurity, true);

  const policies = await db.execute<{ policyname: string }>(
    `select policyname from pg_policies where tablename = 'push_subscriptions'`,
  );
  check(
    "owner policy exists",
    policies.some((row) => row.policyname === "push_subscriptions_all_own"),
    true,
  );
}

try {
  await main();
} finally {
  await db.execute(
    `delete from auth.users where id in ('${ownerA}', '${ownerB}')`,
  );
  process.stdout.write(`\n${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}
