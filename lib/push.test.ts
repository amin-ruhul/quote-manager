import { describe, expect, it } from "vitest";

import {
  pushSubscriptionSchema,
  pushUnsubscribeSchema,
} from "@/lib/schemas/push";

/*
 * The endpoint is the one field here that turns into a server-side request, so
 * it is the one worth pinning down: everything else is opaque key material the
 * push service validates for us.
 */

const keys = { p256dh: "BNc...key", auth: "c2VjcmV0" };

function parse(endpoint: string) {
  return pushSubscriptionSchema.safeParse({ endpoint, keys });
}

describe("push subscription endpoints", () => {
  it("accepts the real push services", () => {
    const endpoints = [
      "https://fcm.googleapis.com/fcm/send/dGhpcy1pcy1hLXRlc3Q",
      "https://web.push.apple.com/QF1nQ0hK8dGVzdA",
      "https://updates.push.services.mozilla.com/wpush/v2/gAAAA",
      "https://wns2-par02p.notify.windows.com/w/?token=abc",
    ];

    for (const endpoint of endpoints) {
      expect(parse(endpoint).success, endpoint).toBe(true);
    }
  });

  it("refuses anything that isn't https", () => {
    expect(parse("http://fcm.googleapis.com/fcm/send/abc").success).toBe(false);
    expect(parse("file:///etc/passwd").success).toBe(false);
    expect(parse("not a url").success).toBe(false);
  });

  it("refuses our own network", () => {
    // Nothing the owner's browser hands us should point back inside the
    // infrastructure — 169.254.169.254 in particular is cloud metadata.
    const internal = [
      "https://localhost/push",
      "https://app.localhost/push",
      "https://127.0.0.1/push",
      "https://[::1]/push",
      "https://10.0.0.5/push",
      "https://172.16.4.2/push",
      "https://192.168.1.10/push",
      "https://169.254.169.254/latest/meta-data/",
    ];

    for (const endpoint of internal) {
      expect(parse(endpoint).success, endpoint).toBe(false);
    }
  });

  it("keeps public addresses that merely look private", () => {
    // 172.32 is outside the private 172.16–31 block, and 11.x is public space.
    expect(parse("https://172.32.0.1/push").success).toBe(true);
    expect(parse("https://11.0.0.1/push").success).toBe(true);
  });

  it("requires both encryption keys", () => {
    const endpoint = "https://fcm.googleapis.com/fcm/send/abc";

    expect(
      pushSubscriptionSchema.safeParse({ endpoint, keys: { p256dh: "k" } })
        .success,
    ).toBe(false);
    expect(
      pushSubscriptionSchema.safeParse({
        endpoint,
        keys: { p256dh: "", auth: "a" },
      }).success,
    ).toBe(false);
  });

  it("holds the unsubscribe endpoint to the same rules", () => {
    expect(
      pushUnsubscribeSchema.safeParse({ endpoint: "https://127.0.0.1/push" })
        .success,
    ).toBe(false);
    expect(
      pushUnsubscribeSchema.safeParse({
        endpoint: "https://fcm.googleapis.com/fcm/send/abc",
      }).success,
    ).toBe(true);
  });
});
