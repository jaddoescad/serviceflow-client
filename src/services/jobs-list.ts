import { JOBS_DEAL_STAGE_OPTIONS } from "@/features/deals";
import type { DealRecord, JobsDealStageId } from "@/features/deals";
import { apiClient } from "@/services/api";
import type { JobsListRow, JobsListSummary } from "@/types/jobs-list";

const JOB_STAGE_ID_SET = new Set<JobsDealStageId>(JOBS_DEAL_STAGE_OPTIONS.map((stage) => stage.id));
const JOB_STAGE_LABELS = JOBS_DEAL_STAGE_OPTIONS.reduce(
  (acc, stage) => {
    acc[stage.id] = stage.label;
    return acc;
  },
  {} as Record<JobsDealStageId, string>
);

const isJobStage = (stage: string): stage is JobsDealStageId =>
  JOB_STAGE_ID_SET.has(stage as JobsDealStageId);

export const fetchJobsListData = async (
  companyId: string,
  options?: { salespersonName?: string | null }
) => {
  // Fetch deals in jobs pipeline
  const deals = await apiClient<DealRecord[]>("/deals", {
    params: { company_id: companyId, pipeline: "jobs" },
  });

  const jobDeals = deals.filter(
    (deal): deal is DealRecord & { stage: JobsDealStageId } => isJobStage(deal.stage)
  );

  // Filter and map... assuming backend should do this but we are mocking service
  const rows: JobsListRow[] = jobDeals.map((d) => {
    const contactName = `${d.first_name ?? ""} ${d.last_name ?? ""}`.trim();
    const customerName = contactName || d.email || d.phone || "Unknown";

    return {
      dealId: d.id,
      dealName: customerName,
      customerName,
      firstName: d.first_name || "",
      lastName: d.last_name || null,
      jobAddress: null,
      stageId: d.stage,
      stageLabel: JOB_STAGE_LABELS[d.stage] ?? d.stage,
      stageUpdatedAt: d.updated_at,
      status: "none",
      quoteId: null,
      quoteNumber: null,
      quoteAmount: null,
      quoteSignedAt: null,
      invoiceId: null,
      invoiceNumber: null,
      invoiceStatus: null,
      invoiceTotal: null,
      invoiceAmountPaid: null,
      invoiceBalanceDue: null,
      jobScheduleDate: null,
      jobStartDate: null,
      jobCompletionDate: null,
      email: d.email || null,
      phone: d.phone || null,
    };
  });

  const summary: JobsListSummary = {
    totalJobs: rows.length,
    totalValue: 0,
    statuses: [],
  };

  return { rows, summary };
};
