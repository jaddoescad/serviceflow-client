import type { QuoteStatus } from "@/types/quotes";

export const PROPOSAL_LIST_PAGE_SIZE_OPTIONS = [15, 25, 50, 100] as const;

export const PROPOSAL_STATUS_LABELS: Record<QuoteStatus, string> = {
  draft: "Draft",
  sent: "Pending",
  accepted: "Accepted",
  declined: "Declined",
};
