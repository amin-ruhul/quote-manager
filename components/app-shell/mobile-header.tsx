"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";

import { signOut } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/wordmark";

/*
 * Phone header (below lg).
 *
 * Navigation moved to the bottom tabs, so this is down to what a header is
 * actually for: saying where you are and offering the way out. That frees the
 * wordmark to carry its name again — it was cut to the bare mark when the
 * sections were competing for the same row.
 */
export function MobileHeader() {
  return (
    <header className="sticky top-0 z-10 flex items-center gap-2 bg-canvas/85 px-4 py-2 pt-[calc(0.5rem+env(safe-area-inset-top))] shadow-nav backdrop-blur lg:hidden">
      <Link href="/dashboard" className="shrink-0">
        <Wordmark />
      </Link>

      <form action={signOut} className="ml-auto shrink-0">
        <Button
          type="submit"
          variant="ghost"
          size="icon-sm"
          aria-label="Sign out"
        >
          <LogOut />
        </Button>
      </form>
    </header>
  );
}
