import { redirect } from "next/navigation";

import { BillingView } from "@/app/(app)/billing/billing-view";
import { requireUser } from "@/lib/auth";
import { BILLING_ENABLED } from "@/lib/constants";
import { getPlanStatus } from "@/lib/plan";

export const metadata = { title: "Plan & billing · QuotePilot" };

export default async function BillingPage() {
  /*
   * Nothing is for sale during the market test, so this page — prices, plan
   * cards and all — is unreachable rather than deleted. An old bookmark lands
   * on the plan page instead of a screen quoting a price we don't charge.
   */
  if (!BILLING_ENABLED) redirect("/plan");

  const user = await requireUser();
  return <BillingView status={await getPlanStatus(user.id)} />;
}
