"use client";

import { Panel } from "@/components/panel";
import { usePushAlerts } from "@/components/pwa/use-push-alerts";
import { Button } from "@/components/ui/button";

/*
 * "Alert me on this phone" — the full control, on the Business screen (SPEC §15).
 *
 * Every state is spelled out rather than hidden behind a switch that quietly
 * does nothing — especially on iPhone, where notifications simply do not exist
 * until the app is on the home screen. An electrician who taps a dead toggle
 * and hears nothing has learned not to trust the feature.
 *
 * The dashboard's PushNudge is the short version of the same state.
 */
export function PushToggle() {
  const alerts = usePushAlerts();
  const { environment, blocked, subscribed, busy } = alerts;

  // Nothing to offer if this deployment has no VAPID keys.
  if (!alerts.configured) return null;
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
                onClick={alerts.sendTest}
                disabled={busy}
              >
                Send a test notification
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={alerts.disable}
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
              onClick={alerts.enable}
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
      return "This browser can't show notifications. Open QuotePace in Chrome or Safari to turn them on.";
    }

    if (environment === "needs-install") {
      return "Add QuotePace to your home screen first — on iPhone, notifications only work once it's installed. Tap Share, then Add to Home Screen.";
    }

    if (blocked) {
      return "Notifications are blocked for QuotePace in your browser settings. Allow them there, then come back.";
    }

    if (subscribed === null) return "Checking…";

    return subscribed
      ? "You'll get a notification here the moment a customer opens or accepts a quote."
      : "Get a notification the moment a customer opens or accepts a quote — even when QuotePace is closed.";
  }
}
