import { BillingView } from "@/app/(app)/billing/billing-view";
import { requireUser } from "@/lib/auth";
import { getPlanStatus } from "@/lib/plan";

export const metadata = { title: "Plan & billing · QuotePilot" };

export default async function BillingPage() {
  const user = await requireUser();
  return <BillingView status={await getPlanStatus(user.id)} />;
}
