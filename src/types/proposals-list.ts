import type { QuoteStatus } from "@/types/quotes";

export type ProposalListRow = {
  id: string;
  dealId: string;
  status: QuoteStatus;
  customerName: string;
  dealName: string;
  title: string;
  quoteNumber: string;
  jobAddress: string | null;
  amount: number;
  createdAt: string;
};

export type ProposalListSummary = {
  statuses: QuoteStatus[];
  totalProposals: number;
};

export type ProposalListData = {
  rows: ProposalListRow[];
  summary: ProposalListSummary;
};
