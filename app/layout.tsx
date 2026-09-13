import type { Metadata, Viewport } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import { BRAND_CANVAS } from "@/lib/brand";
import "./globals.css";

// Inter for all UI; Source Serif 4 only for sparing editorial moments (DESIGN.md).
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "QuotePace — send the quote before you leave the driveway",
    template: "%s",
  },
  description:
    "Quoting software for residential electricians. Describe the job, send a professional quote in minutes, and let your customer accept it on their phone.",
  openGraph: {
    title: "Send the quote before you leave the driveway",
    description:
      "Describe the job. QuotePace builds the quote from your own prices and lets the customer accept it on their phone.",
    type: "website",
  },
  /*
   * Proves to Bing that we own the domain — which is worth more than Bing's own
   * traffic, because ChatGPT's search index is Bing's. Without this the site is
   * not eligible to be cited there at all.
   *
   * Google is the other half: Search Console is the only place that reports
   * which queries actually found the site.
   *
   * Both offered a meta tag, a file at the web root, or a DNS record, and both
   * meta tags live here for the same reason — a verification file dropped into
   * public/ reads as stray junk to whoever finds it next and gets deleted in a
   * tidy-up, silently un-verifying the site, while a DNS record is invisible to
   * anyone reading the code. Neither token is a secret; both are served in the
   * HTML of every page, which is the entire mechanism.
   *
   * Note Google's two methods do NOT share a token — the file method uses its
   * own filename, this is the meta tag's separate value. Bing's three did.
   *
   * Both re-check periodically, so these stay after verification succeeds.
   */
  verification: {
    google: "8utyLx0tu3QJ2y7tiCrO94um3n7CsANQy29z0TmyyTg",
    other: { "msvalidate.01": "66EA4F287F3D0634A9DD4E93A0EFF21E" },
  },
  applicationName: "QuotePace",
  // Home-screen launch on iOS: full-screen, with the app's own name under the
  // icon rather than the page title (SPEC §6). The icons themselves come from
  // the app/icon and app/apple-icon file conventions — setting metadata.icons
  // here would replace those generated links rather than adding to them.
  appleWebApp: {
    capable: true,
    title: "QuotePace",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  // Tints the browser and installed-app chrome to the warm canvas (DESIGN.md).
  themeColor: BRAND_CANVAS,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${sourceSerif.variable}`}>
      <body>
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
