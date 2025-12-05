import type { DealRecord } from "@/features/deals";
import type { AppointmentRecord } from "@/types/appointments";
import type { DealNoteWithAuthor } from "@/types/deal-notes";

export type DealProposalStatus = "draft" | "sent" | "signed" | "declined";

export type DealProposalRecord = {
  id: string;
  name: string;
  version: string;
  total: number;
  status: DealProposalStatus;
  public_share_id: string;
  sent_at?: string;
  signed_at?: string;
  expires_at?: string;
};

export type DealInvoiceStatus = "unpaid" | "partial" | "paid" | "overdue";

export type DealInvoiceRecord = {
  id: string;
  number: string;
  title: string;
  issue_date: string;
  due_date: string;
  total: number;
  balance: number;
  status: DealInvoiceStatus;
  public_share_id: string;
};

export type DealAttachmentType = "image" | "document" | "proposal" | "invoice";

export type DealAttachmentRecord = {
  id: string;
  filename: string;
  url: string;
  uploaded_at: string;
  uploaded_by: string;
  file_size: string;
  type: DealAttachmentType;
  thumbnail_url?: string;
};

export type DealChatMessageAuthorType = "team" | "client";

export type DealChatMessage = {
  id: string;
  author_type: DealChatMessageAuthorType;
  author_name: string;
  body: string;
  sent_at: string;
  attachments?: DealAttachmentRecord[];
  pending_attachments?: boolean;
};

export type DealEmailDirection = "inbound" | "outbound";

export type DealEmailMessage = {
  id: string;
  direction: DealEmailDirection;
  subject: string;
  preview: string;
  sender_name: string;
  sender_email: string;
  sent_at: string;
  is_read: boolean;
  has_attachments?: boolean;
};

export type DealChecklistItem = {
  id: string;
  label: string;
  completed: boolean;
};

/**
 * Lightweight drip sequence metadata - only what's needed for UI indicators
 */
export type DripSequenceMeta = {
  stage_id: string;
  is_enabled: boolean;
  step_count: number;
};

export type DealDetailSnapshot = {
  deal: DealRecord;
  proposals: DealProposalRecord[];
  invoices: DealInvoiceRecord[];
  appointments: AppointmentRecord[];
  notes: DealNoteWithAuthor[];
  attachments: DealAttachmentRecord[];
  checklist: DealChecklistItem[];
  dripSequencesMeta?: DripSequenceMeta[];
};
