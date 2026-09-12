import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        // DESIGN.md: surface-2 fill, 8px radius, matching the Input.
        //
        // `rows` decides the height and nothing else changes it. Dropping
        // `field-sizing-content` (which grew the box as you typed) and the
        // native resize grabber keeps a form from reflowing under your thumb
        // mid-sentence — the box scrolls instead, like any other filled field.
        "flex min-h-16 w-full resize-none rounded-md border border-input bg-surface-2 px-3 py-2.5 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
