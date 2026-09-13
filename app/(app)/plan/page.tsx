import { redirect } from "next/navigation";
import { z } from "zod";

import { PlanView } from "@/app/(app)/plan/plan-view";
import { requireUser } from "@/lib/auth";
import {
  BILLING_ENABLED,
  DEFAULT_UPGRADE_REQUEST_SOURCE,
  UPGRADE_REQUEST_SOURCES,
} from "@/lib/constants";
import { getPlanStatus } from "@/lib/plan";

export const metadata = { title: "Plan & usage · QuotePace" };

/*
 * Which lock sent them here. Anyone can type this into the address bar, so it
 * falls back rather than erroring — a wrong value costs us one imprecise row
 * in the requests table, not a broken page.
 */
const searchSchema = z.object({
  from: z.enum(UPGRADE_REQUEST_SOURCES).catch(DEFAULT_UPGRADE_REQUEST_SOURCE),
});

export default async function PlanPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string | string[] }>;
}) {
  // One screen is live at a time. When billing comes back, the price cards on
  // /billing are the truth and this page stops existing for the owner.
  if (BILLING_ENABLED) redirect("/billing");

  const user = await requireUser();
  const { from } = searchSchema.parse(await searchParams);

  return <PlanView status={await getPlanStatus(user.id)} source={from} />;
}
