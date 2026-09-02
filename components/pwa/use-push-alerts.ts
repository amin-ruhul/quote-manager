"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";

/*
 * The browser side of push alerts (SPEC §15), in one place.
 *
 * Two screens ask for this — the nudge on the dashboard and the toggle on the
 * Business page — and getting permission, subscription and platform state
 * subtly different between them is exactly how a feature starts lying to the
 * owner. So the logic lives here and the screens only choose what to say.
 */

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

export type PushEnvironment =
  /** Server render — the browser hasn't been asked anything yet. */
  | "unknown"
  /** No service worker or Push API at all. */
  | "unsupported"
  /** iOS Safari: push works, but only once the app is installed. */
  | "needs-install"
  | "supported";

function readEnvironment(): PushEnvironment {
  const hasPush =
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window;

  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;

  // Apple's rule: a home-screen install is the precondition, and Safari hides
  // the Push API entirely until then.
  if (isIos && !isStandalone) return "needs-install";
  return hasPush ? "supported" : "unsupported";
}

const noSubscribe = () => () => {};
const serverEnvironment = (): PushEnvironment => "unknown";

/**
 * The applicationServerKey has to be bytes, not the base64url string we ship.
 * Allocated rather than built with `Uint8Array.from`, which types as
 * ArrayBufferLike and so isn't accepted as a BufferSource.
 */
function decodeVapidKey(base64: string): Uint8Array<ArrayBuffer> {
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "=",
  );
  const binary = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));

  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

async function postJson(url: string, body?: unknown): Promise<void> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    const data: unknown = await response.json().catch(() => null);
    const message =
      data && typeof data === "object" && "error" in data
        ? String((data as { error: unknown }).error)
        : "Something went wrong.";
    throw new Error(message);
  }
}

export type PushAlerts = {
  environment: PushEnvironment;
  /** False when the deployment has no VAPID key — the feature hides itself. */
  configured: boolean;
  /** The owner said no, or the browser blocks us. We cannot ask again. */
  blocked: boolean;
  /** null until the browser has been asked. */
  subscribed: boolean | null;
  busy: boolean;
  enable: () => Promise<void>;
  disable: () => Promise<void>;
  sendTest: () => Promise<void>;
};

export function usePushAlerts(): PushAlerts {
  const environment = useSyncExternalStore(
    noSubscribe,
    readEnvironment,
    serverEnvironment,
  );

  const [subscribed, setSubscribed] = useState<boolean | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (environment !== "supported") return;

    let cancelled = false;

    void (async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const existing = await registration.pushManager.getSubscription();
        if (cancelled) return;

        setBlocked(Notification.permission === "denied");
        setSubscribed(existing !== null);
      } catch (error) {
        if (cancelled) return;
        console.error("Reading push subscription failed", error);
        setSubscribed(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [environment]);

  async function enable() {
    if (!VAPID_PUBLIC_KEY) return;
    setBusy(true);

    try {
      // Must happen inside the tap: browsers ignore a permission request that
      // isn't tied to a gesture.
      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        setBlocked(permission === "denied");
        toast.error("Alerts stay off until you allow notifications.");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        // Required: every push must show something to the owner.
        userVisibleOnly: true,
        applicationServerKey: decodeVapidKey(VAPID_PUBLIC_KEY),
      });

      await postJson("/api/push/subscribe", subscription.toJSON());
      setBlocked(false);
      setSubscribed(true);
      toast.success("Alerts are on for this device.");
    } catch (error) {
      console.error("Turning on push failed", error);
      toast.error(
        error instanceof Error ? error.message : "Couldn't turn on alerts.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Tell the server first: if unsubscribing locally succeeds and the
        // request fails, we'd keep pushing to an endpoint nothing listens on.
        await postJson("/api/push/unsubscribe", {
          endpoint: subscription.endpoint,
        });
        await subscription.unsubscribe();
      }

      setSubscribed(false);
      toast.success("Alerts are off for this device.");
    } catch (error) {
      console.error("Turning off push failed", error);
      toast.error(
        error instanceof Error ? error.message : "Couldn't turn off alerts.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function sendTest() {
    setBusy(true);

    try {
      await postJson("/api/push/test");
      toast.success("Sent — check your notifications.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Couldn't send the test.",
      );
    } finally {
      setBusy(false);
    }
  }

  return {
    environment,
    configured: Boolean(VAPID_PUBLIC_KEY),
    blocked,
    subscribed,
    busy,
    enable,
    disable,
    sendTest,
  };
}
