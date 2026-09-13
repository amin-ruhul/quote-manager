import { ChevronDown } from "lucide-react";

/*
 * The card every part of the quote builder sits in.
 *
 * One unbroken white surface with a hairline edge. No tint behind the header
 * and no rule under it: either one splits the card into what looks like two
 * stacked cards, which defeats the boundary the card exists to draw. The
 * chevron chip is what reacts to hover instead.
 *
 * The `summary` prop is the load-bearing idea. A collapsed header that says
 * only "Photos" forces you to open it to learn anything; one that says
 * "Photos — 3 attached" means most sections never need opening.
 */

const CARD = "rounded-lg border border-hairline bg-surface";
const HEADER = "flex items-center gap-3 p-4 sm:p-5";
const BODY = "px-4 pb-4 sm:px-5 sm:pb-5";

/** A section that is always open — for the one the owner always needs. */
export function Section({
  title,
  summary,
  children,
}: {
  title: string;
  summary?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className={CARD}>
      <div className={`${HEADER} pb-3 sm:pb-4`}>
        <h2 className="font-semibold">{title}</h2>
        {summary ? (
          <span className="min-w-0 flex-1 truncate text-sm text-ink-60">
            {summary}
          </span>
        ) : null}
      </div>
      <div className={BODY}>{children}</div>
    </section>
  );
}

/**
 * Native <details>, deliberately: no JavaScript, keyboard and screen-reader
 * correct for free, and browser find-in-page opens it. A Radix Collapsible
 * would add a client component and a state hook to reimplement the element.
 */
export function CollapsibleSection({
  title,
  summary,
  defaultOpen = false,
  children,
}: {
  title: string;
  /** What this section currently holds — shown when shut, so it rarely needs opening. */
  summary?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details open={defaultOpen} className={`group ${CARD}`}>
      <summary
        className={`${HEADER} cursor-pointer list-none rounded-lg group-open:pb-3 sm:group-open:pb-4 [&::-webkit-details-marker]:hidden`}
      >
        <span className="font-semibold">{title}</span>

        {summary ? (
          <span className="min-w-0 flex-1 truncate text-sm text-ink-60">
            {summary}
          </span>
        ) : (
          <span className="flex-1" />
        )}

        {/*
         * The whole row is the target, but only this reacts — tinting the
         * header on hover made the card look like two cards again. A bounded
         * chip also survives sitting at the far edge of a wide row, where a
         * bare grey chevron on white simply disappears.
         */}
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-hairline text-ink-60 transition-all group-open:rotate-180 group-hover:border-ink-40 group-hover:text-ink-90">
          <ChevronDown className="size-4" />
        </span>
      </summary>

      <div className={BODY}>{children}</div>
    </details>
  );
}
