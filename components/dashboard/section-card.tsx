import Link from "next/link";

import { Panel } from "@/components/panel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/*
 * The three dashboard sections — quotes, customers, prices — are the same
 * object: a short list, a way to see the rest, and a way to add one more.
 * Defining that once keeps them from drifting into three slightly different
 * cards, which is how a dashboard starts to feel assembled rather than
 * designed.
 *
 * Two affordances, deliberately separated: "See all" reads as navigation up in
 * the header, and the create action sits at the foot of the list where "add
 * another" belongs.
 */
export function SectionCard({
  title,
  seeAllHref,
  seeAllLabel = "See all",
  action,
  isEmpty,
  emptyMessage,
  children,
  className,
}: {
  title: string;
  seeAllHref: string;
  seeAllLabel?: string;
  /** The create control. Passed in because "New quote" is a button and the
   *  others are links. */
  action: React.ReactNode;
  isEmpty: boolean;
  emptyMessage: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Panel className={cn("flex flex-col p-0", className)}>
      {/* The create action sits in the header, where it is visible without
          scrolling the list first. Small, so it reads as one control beside a
          heading rather than a slab across the card. */}
      <div className="flex items-center justify-between gap-2 border-b border-hairline py-2.5 pr-3 pl-4 sm:pl-5">
        <h2 className="font-semibold">{title}</h2>
        {action}
      </div>

      {isEmpty ? (
        <p className="flex-1 px-4 py-6 text-sm text-ink-60 sm:px-5">
          {emptyMessage}
        </p>
      ) : (
        <div className="flex-1">{children}</div>
      )}

      {/* "See all" closes the list, which is where you reach for it. */}
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="w-full justify-center rounded-t-none border-t border-hairline"
      >
        <Link href={seeAllHref}>{seeAllLabel}</Link>
      </Button>
    </Panel>
  );
}
