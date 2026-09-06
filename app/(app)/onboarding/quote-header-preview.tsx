"use client";

import Image from "next/image";
import { Globe, Mail, Phone } from "lucide-react";

/**
 * What the customer sees at the top of a quote, updating as the form is typed.
 *
 * Deliberately mirrors `app/q/[token]/page.tsx` — the same sizes, the same
 * "License {n}" phrasing, the same contact row. This is the whole point of the
 * page: the owner was editing a letterhead they could not see. If the real
 * quote page changes, change this with it.
 *
 * Note what is absent: the address is NOT shown to customers, so it is not
 * shown here either. Putting it in the preview would teach the wrong thing.
 */
export function QuoteHeaderPreview({
  name,
  logoUrl,
  licenseNumber,
  phone,
  email,
  website,
}: {
  name: string;
  logoUrl: string | null;
  licenseNumber: string;
  phone: string;
  email: string;
  website: string;
}) {
  const hasContact = Boolean(phone || email || website);

  return (
    <div className="rounded-lg border border-hairline bg-surface p-5 sm:p-6">
      <p className="text-xs font-medium tracking-[0.08em] text-ink-60 uppercase">
        What your customer sees
      </p>

      {/* The canvas inside the card, so the preview reads as a page rather
          than as more form. */}
      <div className="mt-4 rounded-md bg-canvas p-5">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt=""
              width={56}
              height={56}
              unoptimized
              className="size-14 shrink-0 rounded-md border border-hairline bg-surface object-contain"
            />
          ) : null}
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold">
              {name || <span className="text-ink-60">Your business name</span>}
            </p>
            {licenseNumber ? (
              <p className="truncate text-sm text-ink-60">
                License {licenseNumber}
              </p>
            ) : null}
          </div>
        </div>

        {/* A stand-in for the quote itself — enough to place the letterhead in
            context without pretending to be a real quote. */}
        <div className="mt-5 rounded-md border border-hairline bg-surface p-4 shadow-quote">
          <p className="tabular text-xs text-ink-60">Q-0007</p>
          <p className="mt-0.5 font-semibold">
            Kitchen lighting &amp; panel upgrade
          </p>
          <p className="mt-0.5 text-xs text-ink-60">
            Prepared for Sarah Mitchell
          </p>

          <ul className="mt-3 divide-y divide-hairline text-xs">
            <SampleLine name="Panel replacement (200A)" price="$2,850.00" />
            <SampleLine name="Recessed light × 6" price="$1,110.00" />
            <SampleLine name="Permit fee" price="$250.00" />
          </ul>

          <div className="mt-2 flex items-baseline justify-between border-t border-hairline pt-2">
            <span className="text-sm font-semibold">Total</span>
            <span className="tabular font-semibold">$4,541.09</span>
          </div>

          <div className="mt-3 flex h-9 items-center justify-center rounded-md bg-status-accepted text-xs font-medium text-white">
            Accept · $4,541.09
          </div>
        </div>

        {hasContact ? (
          <div className="mt-5 flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-xs text-ink-60">
            {phone ? (
              <span className="inline-flex items-center gap-1.5">
                <Phone className="size-3" aria-hidden />
                {phone}
              </span>
            ) : null}
            {email ? (
              <span className="inline-flex min-w-0 items-center gap-1.5">
                <Mail className="size-3 shrink-0" aria-hidden />
                <span className="truncate">{email}</span>
              </span>
            ) : null}
            {website ? (
              <span className="inline-flex min-w-0 items-center gap-1.5">
                <Globe className="size-3 shrink-0" aria-hidden />
                <span className="truncate">{website}</span>
              </span>
            ) : null}
          </div>
        ) : (
          <p className="mt-5 text-center text-xs text-ink-60">
            Add a phone, email, or website and it appears here.
          </p>
        )}
      </div>
    </div>
  );
}

/** A stand-in quote line. Fixed content — this illustrates, it never sends. */
function SampleLine({ name, price }: { name: string; price: string }) {
  return (
    <li className="flex items-baseline justify-between gap-3 py-1.5">
      <span className="min-w-0 truncate text-ink-90">{name}</span>
      <span className="tabular shrink-0 font-medium">{price}</span>
    </li>
  );
}
