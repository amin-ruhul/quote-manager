import Link from "next/link";

import { Panel } from "@/components/panel";
import { Button } from "@/components/ui/button";

export default function QuoteNotFound() {
  return (
    <Panel>
      <h1 className="text-xl font-semibold">Quote not found</h1>
      <p className="mt-2 text-body">
        This quote doesn&apos;t exist, or it belongs to another business.
      </p>
      <Button asChild size="lg" className="mt-6 w-full sm:w-auto">
        <Link href="/quotes">Back to quotes</Link>
      </Button>
    </Panel>
  );
}
