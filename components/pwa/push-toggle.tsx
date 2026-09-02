"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";

import { Panel } from "@/components/panel";
import { Button } from "@/components/ui/button";

/*
 * "Alert me on this phone" (SPEC §15).
 *
 * Every state is spelled out rather than hidden behind a switch that quietly
 * does nothing — especially on iPhone, where notifications simply do not exist
 * until the app is on the home screen. An electrician who taps a dead toggle
 * and hears nothing has learned not to trust the feature.
 */

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

type Environment =
  /** Server render — the browser hasn't been asked anything yet. */
  | "unknown"
  /** No service worker or Push API at all.  */
  | "unsupported"
  /** iOS Safari: push works, but only once the app is installed. */
  | "needs-install"
  | "supported";

function readEnvironment(): Environment {
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
const serverEnvironment = (): Environment => "unknown";

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

export function PushToggle() {
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

  // Nothing to offer if this deployment has no VAPID keys.
  if (!VAPID_PUBLIC_KEY) return null;
  if (environment === "unknown") return null;

  return (
    // The card lives here rather than in the page, so a deployment with no
    // VAPID keys shows nothing at all instead of an empty panel.
    <Panel className="space-y-3">
      <div>
        <h2 className="font-semibold">Alerts on this device</h2>
        <p className="mt-1 text-sm text-body">{description()}</p>
      </div>

      {environment === "supported" && !blocked && subscribed !== null && (
        <div className="flex flex-wrap items-center gap-2">
          {subscribed ? (
            <>
              <Button
                type="button"
                variant="soft"
                size="sm"
                onClick={sendTest}
                disabled={busy}
              >
                Send a test notification
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={disable}
                disabled={busy}
              >
                Turn off
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="soft"
              size="sm"
              onClick={enable}
              disabled={busy}
            >
              {busy ? "Turning on…" : "Turn on alerts"}
            </Button>
          )}
        </div>
      )}
    </Panel>
  );

  function description(): string {
    if (environment === "unsupported") {
      return "This browser can't show notifications. Open QuotePilot in Chrome or Safari to turn them on.";
    }

    if (environment === "needs-install") {
      return "Add QuotePilot to your home screen first — on iPhone, notifications only work once it's installed. Tap Share, then Add to Home Screen.";
    }

    if (blocked) {
      return "Notifications are blocked for QuotePilot in your browser settings. Allow them there, then come back.";
    }

    if (subscribed === null) return "Checking…";

    return subscribed
      ? "You'll get a notification here the moment a customer opens or accepts a quote."
      : "Get a notification the moment a customer opens or accepts a quote — even when QuotePilot is closed.";
  }
}
