import Link from "next/link";

import { Button } from "@/components/ui/button";

/**
 * The one ask on a blog post. After the intro, and again at the end.
 */
export function BlogCta() {
  return (
    <aside className="mt-8 rounded-lg border border-hairline bg-surface p-5">
      <p className="text-pretty text-ink-90">
        Quote this job from your phone, free. Your prices, your logo, sent
        before you leave.
      </p>
      <Button asChild size="lg" className="mt-4 w-full sm:w-auto">
        <Link href="/register">Send your first quote free</Link>
      </Button>
    </aside>
  );
}
