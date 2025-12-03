import type { QuoteStatus } from "@/types/quotes";

export type ProposalListFilters = {
  search: string;
  status: QuoteStatus | "all";
  pageSize: number;
  page: number;
};

export type ProposalListRow = {
  id: string;
  status: QuoteStatus;
  customerName: string;
  dealName: string;
  title: string;
  quoteNumber: string;
  jobAddress: string | null;
  amount: number;
  createdAt: string;
  dealId: string;
};

export type ProposalListSummary = {
  statuses: QuoteStatus[];
  totalProposals: number;
};

export type ProposalListData = {
  rows: ProposalListRow[];
  summary: ProposalListSummary;
};
