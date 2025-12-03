import type { DealStageId } from "@/features/deals";

export type SalesListRow = {
  id: string;
  label: string | null;
  customerName: string;
  phoneNumber: string | null;
  leadSource: string | null;
  dealName: string;
  stageId: DealStageId;
  stageLabel: string;
  dealAmount: number;
  lastChangeAt: string;
  createdAt: string;
  salesperson: string | null;
  email: string | null;
  isArchived: boolean;
};

export type SalesListSummary = {
  totalDeals: number;
  totalValue: number;
  salespeople: string[];
  leadSources: string[];
};

export type SalesListData = {
  rows: SalesListRow[];
  summary: SalesListSummary;
};