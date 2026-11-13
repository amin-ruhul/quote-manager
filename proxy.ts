import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

/*
 * Refreshes the Supabase session cookie on every request. Without this, server
 * components see an expired token and sign the owner out mid-job.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  const { pathname } = request.nextUrl;
  const isProtected = [
    "/onboarding",
    "/pricebook",
    "/customers",
    "/quotes",
    "/dashboard",
  ].some((route) => pathname.startsWith(route));

  // Public routes still get the cookie refresh above, but skip the identity
  // check — no reason to put the landing and login pages on the auth path.
  if (!isProtected) return response;

  // getClaims() verifies the ES256 token locally against the published JWKS,
  // so it costs no network round trip. Never getSession(): that verifies
  // nothing at all.
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims?.sub) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Everything except static assets, image files, the PWA shell files, the
     * public customer quote page, and the marketing site. /q has no session by
     * design, so running the auth proxy over it would only add latency to the
     * screen that has to feel instant. The service worker and manifest are
     * fetched by the browser itself, outside any session.
     *
     * The marketing pages (the homepage — the empty `$` branch — and the named
     * sections, each ending at `/` or the end of the path so `/blogger` would
     * still match) are static and served from the CDN to every visitor. A
     * session refresh here could attach one visitor's Set-Cookie to a page
     * that is meant to be identical for everyone, and it buys nothing: the nav
     * learns about the session from /api/account, which this proxy still
     * covers. Keep this list in step with app/(marketing).
     */
    "/((?!$|(?:about|blog|contact|privacy|terms|free-electrical-quote-template|guides)(?:/|$)|_next/static|_next/image|favicon.ico|sw.js|offline.html|manifest.webmanifest|q/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
