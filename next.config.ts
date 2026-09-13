import type { NextConfig } from "next";

/*
 * Response headers every route gets.
 *
 * `frame-ancestors 'self'` (and the older X-Frame-Options it backstops) is the
 * one that earns its place here. The public quote page takes an Accept — a
 * decision with money attached, from someone with no session and no account.
 * Framed on an attacker's page under a decoy button, that Accept can be
 * clicked by a homeowner who never saw the quote. Same-origin framing stays
 * allowed because the PDF preview iframes /q/<token>/print from the app itself.
 *
 * Deliberately not a full Content-Security-Policy. A script-src policy that
 * Next's inline bootstrap needs nonces for is easy to get subtly wrong, and a
 * CSP that has to be relaxed until it passes protects nothing. frame-ancestors
 * is unaffected by inline scripts, so it can be set correctly on its own.
 */
const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    // No `preload`: that is a one-way door submitted to browser vendors, and it
    // would apply to every subdomain including ones not serving HTTPS yet.
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        /*
         * The quote link is the credential — anyone holding /q/<token> can open
         * the quote. A Referer carrying that token to any third party the page
         * touches would hand it over, so this route sends none at all.
         */
        source: "/q/:path*",
        headers: [{ key: "Referrer-Policy", value: "no-referrer" }],
      },
      {
        /*
         * The service worker is served from public/, which Next caches
         * aggressively by default. A stale worker would keep serving an old
         * app shell — and, once push lands, would keep the old push handler.
         */
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
