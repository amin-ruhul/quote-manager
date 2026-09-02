"use client";

import { Panel } from "@/components/panel";
import { usePushAlerts } from "@/components/pwa/use-push-alerts";
import { Button } from "@/components/ui/button";

/*
 * Dashboard nudge (SPEC §15): the owner is one tap from never hearing that a
 * customer said yes, and the dashboard is where they'd notice.
 *
 * Deliberately narrow. It shows only when there is something to say and
 * something to do about it, and it disappears for good the moment alerts are
 * on — a permanent banner on the main screen would be worse than the problem.
 * The Business screen's PushToggle is the full control, including the states
 * this one stays quiet about.
 */
export function PushNudge() {
  const alerts = usePushAlerts();
  const { environment, blocked, subscribed, busy } = alerts;

  if (!alerts.configured) return null;
  // Already getting alerts, still checking, or nothing useful to say: the
  // browser can't do push at all, or iOS needs the install first — which the
  // install card on this same screen is already asking for.
  if (environment !== "supported") return null;
  if (subscribed === null || subscribed) return null;

  if (blocked) {
    return (
      <Panel>
        <h2 className="font-semibold">Notifications are blocked</h2>
        <p className="mt-1 text-sm text-body">
          QuotePilot can&apos;t tell you when a customer opens or accepts your
          quote. Allow notifications for this site in your browser settings,
          then reload this page.
        </p>
      </Panel>
    );
  }

  return (
    <Panel className="space-y-3">
      <div>
        <h2 className="font-semibold">Know the moment they say yes</h2>
        <p className="mt-1 text-sm text-body">
          Notifications are off, so QuotePilot can&apos;t tell you when a
          customer opens or accepts your quote. Turn them on and your phone
          buzzes the moment it happens — even when the app is closed.
        </p>
      </div>

      {/* Ghost, not filled: the install card on this screen may already own the
          one blue action (DESIGN.md). */}
      <Button
        type="button"
        variant="soft"
        size="sm"
        onClick={alerts.enable}
        disabled={busy}
      >
        {busy ? "Turning on…" : "Turn on notifications"}
      </Button>
    </Panel>
  );
}
