import type { JobsListStatus } from "@/types/jobs-list";

export const JOBS_LIST_PAGE_SIZE_OPTIONS = [15, 25, 50, 100] as const;

export const JOBS_LIST_STATUS_LABELS: Record<JobsListStatus, string> = {
  none: "No Proposal",
  draft: "Draft",
  sent: "Sent",
  accepted: "Accepted",
  declined: "Declined",
};

export const JOBS_LIST_STATUS_ORDER: JobsListStatus[] = [
  "none",
  "draft",
  "sent",
  "accepted",
  "declined",
];

export const JOBS_LIST_STATUS_OPTIONS = JOBS_LIST_STATUS_ORDER.map((status) => ({
  id: status,
  label: JOBS_LIST_STATUS_LABELS[status],
}));
