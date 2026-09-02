"use client";

import { useEffect } from "react";

/**
 * Registers public/sw.js for the signed-in app.
 *
 * Mounted in the app shell only, never on the public quote page: registration
 * is what makes the browser offer "install", and a homeowner should never be
 * asked to install anything (SPEC §6).
 *
 * The worker needs the root scope because the app spans /dashboard, /quotes,
 * /customers and friends; it excludes /q/ itself in its fetch handler.
 */
export function RegisterServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // Registering competes with the page's own resources, so wait until the
    // screen the owner is looking at has finished loading.
    const register = () => {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(
        // Nothing here is load-bearing — a failed registration only costs the
        // install prompt, so it must never surface to the owner.
        (error: unknown) => {
          console.error("Service worker registration failed", error);
        },
      );
    };

    if (document.readyState === "complete") {
      register();
      return;
    }

    window.addEventListener("load", register);
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
