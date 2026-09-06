import { Footer } from "@/components/landing/footer";
import { LandingNav } from "@/components/landing/landing-nav";

/**
 * Everything a logged-out visitor sees: the landing page and the company,
 * resource, and legal pages the footer links to.
 *
 * The nav and footer live here rather than in each page so the seven marketing
 * routes cannot drift apart — the footer in particular is the only place some
 * of these pages are reachable from.
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        <LandingNav />
        <div className="flex-1">{children}</div>
        <Footer />
      </div>
    </>
  );
}
