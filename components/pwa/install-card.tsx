"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

import { Panel } from "@/components/panel";
import { Button } from "@/components/ui/button";

/*
 * "Add to Home Screen" nudge for the electrician (SPEC §6).
 *
 * Deliberately small: one card, one action, dismissed forever on "Not now".
 * It renders nothing at all unless the app can actually be installed, so it
 * never becomes a banner the owner has to scroll past every day.
 */

const DISMISSED_KEY = "quotepilot:install-dismissed";

/** Chrome's install prompt event — not in lib.dom, so it is described here. */
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type InstallState =
  /** Server render — the browser hasn't been asked anything yet. */
  | "unknown"
  /** Already installed, or the owner said no. */
  | "hidden"
  /** iOS: no install API, so the Share sheet has to be explained. */
  | "ios"
  /** Chrome and friends: wait for beforeinstallprompt. */
  | "promptable";

function isStandalone(): boolean {
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  // Safari's own flag, which predates display-mode and is still what iOS sets.
  return (
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/** iOS has no install API — only Safari's Share sheet can do it. */
function isIosSafari(): boolean {
  const ua = navigator.userAgent;
  return /iphone|ipad|ipod/i.test(ua) && !/crios|fxios|edgios/i.test(ua);
}

function readInstallState(): InstallState {
  try {
    if (localStorage.getItem(DISMISSED_KEY) === "1") return "hidden";
  } catch {
    // Private-mode Safari throws on localStorage; showing the card is fine.
  }

  if (isStandalone()) return "hidden";
  return isIosSafari() ? "ios" : "promptable";
}

/*
 * Whether the app can be installed is a browser fact, not React state: it is
 * unknowable on the server and fixed for the life of the page. Reading it
 * through useSyncExternalStore is what keeps the server and client renders in
 * agreement without a setState-in-effect cascade.
 */
const noSubscribe = () => () => {};
const serverState = (): InstallState => "unknown";

export function InstallCard() {
  const installState = useSyncExternalStore(
    noSubscribe,
    readInstallState,
    serverState,
  );

  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      // Without this Chrome shows its own mini-infobar instead of letting the
      // owner choose the moment.
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };

    const onInstalled = () => setClosed(true);

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // Can't persist it; hiding it for this session is still the right answer.
    }
    setClosed(true);
  }

  async function install() {
    if (!installEvent) return;

    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;

    // The event is single-use either way; a declined prompt just hides the card
    // for this session rather than nagging.
    setInstallEvent(null);
    if (outcome === "accepted") setClosed(true);
  }

  if (closed) return null;
  if (installState === "unknown" || installState === "hidden") return null;
  // Chrome hasn't offered the prompt (already installed, or criteria unmet).
  if (installState === "promptable" && !installEvent) return null;

  return (
    <Panel className="space-y-3">
      <div>
        <h2 className="font-semibold">Keep QuotePilot one tap away</h2>
        <p className="mt-1 text-sm text-body">
          {installState === "ios"
            ? "Tap Share, then Add to Home Screen. QuotePilot opens full-screen — and on iPhone that's the only way it can alert you when a customer accepts."
            : "Add it to your home screen and it opens full-screen, straight to your quotes."}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {installState === "promptable" && (
          <Button type="button" size="sm" onClick={install}>
            Add to home screen
          </Button>
        )}
        <Button type="button" variant="ghost" size="sm" onClick={dismiss}>
          Not now
        </Button>
      </div>
    </Panel>
  );
}
