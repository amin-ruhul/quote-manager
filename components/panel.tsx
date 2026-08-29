import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

/**
 * The card from DESIGN.md: white surface on the warm canvas, separated by a 1px
 * hairline and NOT a shadow, 12px radius, 24px padding (20px on phones).
 *
 * One definition on purpose — every panel in the app uses this, so the card
 * look can never drift screen to screen.
 */
export function Panel({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "div";

  return (
    <Comp
      className={cn(
        "rounded-lg border border-hairline bg-surface p-5 sm:p-6",
        className,
      )}
      {...props}
    />
  );
}
