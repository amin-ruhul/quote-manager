import Link from "next/link";

import { Panel } from "@/components/panel";
import { Button } from "@/components/ui/button";

export default function CustomerNotFound() {
  return (
    <Panel>
      <h1 className="text-xl font-semibold">Customer not found</h1>
      <p className="mt-2 text-body">
        This customer doesn&apos;t exist, or they belong to another business.
      </p>
      <Button asChild size="lg" className="mt-6 w-full sm:w-auto">
        <Link href="/customers">Back to customers</Link>
      </Button>
    </Panel>
  );
}
