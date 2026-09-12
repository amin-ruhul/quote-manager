import { ChevronDown } from "lucide-react";

/*
 * A section of a long form that answers its own question while shut.
 *
 * Native <details>, deliberately: it needs no JavaScript, it is keyboard and
 * screen-reader correct for free, and browser find-in-page opens it. A Radix
 * Collapsible would add a client component and a state hook to reimplement
 * what the element already does.
 *
 * The `summary` prop is the point of the whole thing. A collapsed header that
 * says only "Photos" forces you to open it to learn anything; one that says
 * "Photos — 3" means most sections never need opening. That is what turns a
 * flat wall of fields into something you can read at a glance.
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
    /*
     * A heading row, not a card. The content already brings its own Panel, and
     * DESIGN.md's cards sit ON the canvas — nesting one inside another gives
     * two hairlines and two radii for one idea.
     */
    <details open={defaultOpen} className="group">
      <summary className="-mx-2 flex cursor-pointer list-none items-center gap-3 rounded-md px-2 py-1.5 hover:bg-surface-2 [&::-webkit-details-marker]:hidden">
        <span className="font-semibold">{title}</span>
        {summary ? (
          <span className="min-w-0 flex-1 truncate text-sm text-ink-60">
            {summary}
          </span>
        ) : (
          <span className="flex-1" />
        )}
        <ChevronDown className="size-4 shrink-0 text-ink-60 transition-transform group-open:rotate-180" />
      </summary>

      <div className="mt-2">{children}</div>
    </details>
  );
}
