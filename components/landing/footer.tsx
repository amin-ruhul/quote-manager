import Link from "next/link";

import { Wordmark } from "@/components/wordmark";

/**
 * The marketing footer: a midnight island the full width of the page, holding
 * every route a visitor might want after they've stopped reading.
 *
 * Every link here points somewhere real. In-page anchors are only used on the
 * landing page's own sections, so they carry a leading `/` and work from the
 * sub-pages too.
 */
const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] =
  [
    {
      heading: "Product",
      links: [
        { label: "How it works", href: "/#how-it-works" },
        { label: "Features", href: "/#features" },
        { label: "Pricing", href: "/#pricing" },
        { label: "FAQ", href: "/#faq" },
      ],
    },
    {
      heading: "Company",
      links: [
        { label: "About us", href: "/about" },
        { label: "Blog", href: "/blog" },
        { label: "Contact", href: "/contact" },
      ],
    },
    {
      heading: "Get started",
      links: [
        { label: "Start free", href: "/login" },
        { label: "Log in", href: "/login" },
        { label: "Guides", href: "/guides" },
      ],
    },
    {
      heading: "Legal",
      links: [
        { label: "Privacy policy", href: "/privacy" },
        { label: "Terms of service", href: "/terms" },
      ],
    },
  ];

export function Footer() {
  return (
    <footer className="bg-midnight text-white">
      <div className="mx-auto max-w-5xl px-5 pt-16 pb-8 sm:px-8 sm:pt-20">
        {/* Identity block, centered — the one moment the mark gets to be the
            largest thing on the row. */}
        <div className="flex flex-col items-center text-center">
          <Wordmark labelClassName="text-xl text-white" />
          {/*
            `text-indent` cancels the trailing letter-space. CSS adds the
            tracking after the final character too, so a centered, letter-spaced
            line sits half a space left of true centre — the classic reason
            centred uppercase type looks subtly off. Indenting by the same
            amount puts the visible text back on the axis.
          */}
          <p className="mt-3 max-w-xs [text-indent:0.14em] text-xs font-medium tracking-[0.14em] text-white/40 uppercase sm:max-w-none">
            Quoting software for residential electricians
          </p>
        </div>

        <div className="mt-12 h-px bg-white/10" />

        <nav
          aria-label="Footer"
          className="grid grid-cols-2 gap-x-6 gap-y-10 py-12 md:grid-cols-4"
        >
          {COLUMNS.map((column) => (
            <div key={column.heading}>
              <h2 className="text-xs font-medium tracking-[0.08em] text-white/40 uppercase">
                {column.heading}
              </h2>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label + link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/70 transition-colors duration-200 hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="h-px bg-white/10" />

        <div className="flex flex-col gap-3 py-6 text-xs text-white/40 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} QuotePilot. All rights reserved.</p>
          <p className="sm:ml-auto">
            Built for electricians who&apos;d rather be home.
          </p>
        </div>
      </div>
    </footer>
  );
}
