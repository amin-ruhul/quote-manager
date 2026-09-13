import { Analytics } from "@vercel/analytics/next";

import { Clarity } from "@/components/analytics/clarity";
import { Footer } from "@/components/landing/footer";
import {
  LandingNav,
  type LandingAccount,
} from "@/components/landing/landing-nav";
import { getBusinessForOwner, getUser } from "@/lib/auth";
import { getPlanStatus } from "@/lib/plan";

/**
 * Marketing chrome: the landing page and the company, resource, and legal
 * pages the footer links to.
 *
 * The nav and footer live here rather than in each page so the seven marketing
 * routes cannot drift apart — the footer in particular is the only place some
 * of these pages are reachable from.
 *
 * A signed-in owner still lands here sometimes (shared link, back-button). The
 * nav swaps Log in / Start free for the same account menu the app uses, so
 * they are not offered a second account on a session they already have.
 */
export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  let account: LandingAccount | null = null;
  if (user) {
    const [business, planStatus] = await Promise.all([
      getBusinessForOwner(user.id),
      getPlanStatus(user.id),
    ]);
    account = {
      email: user.email,
      businessName: business?.name ?? null,
      plan: planStatus.plan,
    };
  }

  return (
    <>
      {/*
        The reveal wrappers server-render an inline `opacity: 0` that only
        their animation clears. Without JavaScript nothing would ever clear it,
        so the page would be blank — the worst possible failure for someone
        checking us out on a phone with one bar. `!important` is required to
        beat the inline style Framer writes.
      */}
      <noscript>
        <style>{`[data-reveal] { opacity: 1 !important; transform: none !important; }`}</style>
      </noscript>

      {/*
        Column layout so the footer sits at the bottom of the viewport on the
        short pages (blog, guides) instead of floating halfway up with canvas
        underneath it.
      */}
      <div className="flex min-h-dvh flex-col">
        <LandingNav account={account} />
        <div className="flex-1">{children}</div>
        <Footer />
      </div>

      {/*
        Both measure the marketing side only — mounted here rather than in the
        root layout on purpose. The signed-in app would spend the free event
        allowance on our own navigation, and the customer quote page (/q) must
        stay free of third-party scripts: that page loads on a homeowner's
        phone, and what we need from it is already recorded server-side as
        quote_events (SPEC §9). Clarity in particular replays the DOM, so it
        must never see a page with a customer's name or address on it.
      */}
      <Analytics />
      <Clarity />
    </>
  );
}
