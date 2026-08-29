import { cn } from "@/lib/utils";
import type { QuoteStatus } from "@/lib/constants";

/** DESIGN.md status table — one pairing per lifecycle state. */
const STATUS_STYLES: Record<QuoteStatus, string> = {
  draft: "bg-status-draft-bg text-status-draft",
  sent: "bg-status-sent-bg text-status-sent",
  viewed: "bg-status-viewed-bg text-status-viewed",
  accepted: "bg-status-accepted-bg text-status-accepted",
  declined: "bg-status-declined-bg text-status-declined",
  expired: "bg-status-draft-bg text-status-draft",
};

const STATUS_LABELS: Record<QuoteStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  viewed: "Viewed",
  accepted: "Accepted",
  declined: "Declined",
  expired: "Expired",
};

export function QuoteStatusPill({
  status,
  className,
}: {
  status: QuoteStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-pill px-2.5 py-1 text-xs font-medium",
        STATUS_STYLES[status],
        className,
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
