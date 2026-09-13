import { Lock } from "lucide-react";

import { RequestAccessButton } from "@/components/upgrade/request-access-button";
import type { UpgradeRequestSource } from "@/lib/constants";

/**
 * A feature that exists, that you can see, and that you can't have yet.
 *
 * Shown rather than hidden — the same call the quote action bar makes: an owner
 * who never sees a feature never asks for it, and asking is the entire point of
 * this phase. Dashed hairline rather than a solid card, so it reads as a
 * placeholder for something real instead of a thing that is broken.
 */
export function PremiumLock({
  title,
  description,
  source,
  requested,
  children,
}: {
  title: string;
  description: string;
  source: UpgradeRequestSource;
  requested: boolean;
  /** Anything worth keeping on screen behind the lock — a preview, a hint. */
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-dashed border-hairline-strong p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 font-semibold">
            <Lock className="size-4 text-ink-60" />
            {title}
          </h3>
          <p className="mt-1 max-w-prose text-sm text-ink-60">{description}</p>
          <p className="mt-2 inline-flex rounded-pill bg-marigold px-2.5 py-1 text-xs font-medium">
            Invite-only while we&apos;re in beta
          </p>
        </div>

        <RequestAccessButton source={source} requested={requested} />
      </div>

      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}
