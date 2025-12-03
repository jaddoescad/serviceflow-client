import type { QuoteStatus } from "@/features/quotes";

// Proposal List Types
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

// Proposal Attachment Types
export type ProposalAttachmentRecord = {
  id: string;
  company_id: string;
  deal_id: string;
  quote_id: string;
  storage_key: string;
  thumbnail_key: string | null;
  original_filename: string;
  content_type: string;
  byte_size: number;
  uploaded_by_user_id: string | null;
  uploaded_at: string;
  updated_at: string;
};

export type ProposalAttachmentAsset = ProposalAttachmentRecord & {
  signed_url: string;
  thumbnail_url: string | null;
  fileName?: string;
  contentType?: string;
  sizeBytes?: number;
  formattedSize?: string;
  isImage?: boolean;
  uploadedAt?: string;
};
