"use client";

import { useEffect } from "react";

import { Panel } from "@/components/panel";
import { Button } from "@/components/ui/button";

/** Catches render/data failures on any signed-in screen. Never a blank page. */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App screen failed", error);
  }, [error]);

  return (
    <Panel>
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-body">
        We couldn&apos;t load this screen. Your data is safe — try again.
      </p>
      <Button size="lg" className="mt-6 w-full sm:w-auto" onClick={reset}>
        Try again
      </Button>
    </Panel>
  );
}
