import type { JobsDealStageId } from "@/features/deals";
import type { InvoiceStatus } from "@/types/invoices";
import type { QuoteStatus } from "@/types/quotes";

export type JobsListStatus = QuoteStatus | "none";

export type JobsListRow = {
  dealId: string;
  dealName: string;
  customerName: string;
  firstName: string;
  lastName: string | null;
  jobAddress: string | null;
  stageId: JobsDealStageId;
  stageLabel: string;
  stageUpdatedAt: string;
  status: JobsListStatus;
  quoteId: string | null;
  quoteNumber: string | null;
  quoteAmount: number | null;
  quoteSignedAt: string | null;
  invoiceId: string | null;
  invoiceNumber: string | null;
  invoiceStatus: InvoiceStatus | null;
  invoiceTotal: number | null;
  invoiceAmountPaid: number | null;
  invoiceBalanceDue: number | null;
  jobScheduleDate: string | null;
  jobStartDate: string | null;
  jobCompletionDate: string | null;
  email: string | null;
  phone: string | null;
};

export type JobsListSummary = {
  totalJobs: number;
  totalValue: number;
  statuses: JobsListStatus[];
};

export type JobsListData = {
  rows: JobsListRow[];
  summary: JobsListSummary;
};
