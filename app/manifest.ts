import type { MetadataRoute } from "next";

import { BRAND_CANVAS } from "@/lib/brand";

/*
 * Web app manifest (SPEC §6) — served at /manifest.webmanifest.
 *
 * This exists for the electrician's app only. It makes "Add to Home Screen"
 * offer a real, full-screen app, and on iPhone it is the precondition for web
 * push: Safari only allows notifications once the app is installed.
 *
 * The customer quote page is deliberately not part of this — a homeowner is
 * never asked to install anything (SPEC §6).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "QuotePace",
    short_name: "QuotePace",
    description:
      "Describe the job, send a professional quote in minutes, and let your customer accept it on their phone.",
    // Opening the installed app should land on the day's numbers, not marketing.
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    // The owner quotes one-handed on a phone at a job site.
    orientation: "portrait",
    // Warm paper, never pure white — the splash screen matches the app (DESIGN.md).
    background_color: BRAND_CANVAS,
    theme_color: BRAND_CANVAS,
    categories: ["business", "productivity"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      // Android crops icons to the launcher's shape; this one has the padding
      // to survive it.
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
