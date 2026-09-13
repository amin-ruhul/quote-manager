"use client";

import * as React from "react";
import { Switch as SwitchPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

/**
 * An on/off control for a setting that takes effect immediately in the form.
 *
 * A switch rather than a checkbox because these read as states, not selections
 * — "this line is taxable" is a property of the line, not something you tick
 * from a list. 44px of hit area either side of the track, so it is thumb-sized
 * on a phone even though the track itself is small.
 */
function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-6 w-10 shrink-0 items-center rounded-pill border border-transparent transition-colors outline-none",
        "focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:bg-brand data-[state=unchecked]:bg-input",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-5 rounded-pill bg-surface shadow-nav ring-0 transition-transform",
          "data-[state=checked]:translate-x-[1.125rem] data-[state=unchecked]:translate-x-0.5",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
