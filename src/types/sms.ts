import type { DealStageId } from "@/features/deals";

export type SmsMessageDirection = "inbound" | "outbound";

export type SmsMessageRecord = {
  id: string;
  company_id: string;
  contact_id: string | null;
  deal_id: string | null;
  from_number: string;
  to_number: string;
  body: string;
  direction: SmsMessageDirection;
  status: string | null;
  sent_by_user_id: string | null;
  has_media: boolean;
  created_at: string;
  updated_at: string;
  attachments?: SmsAttachmentAsset[];
};

export type InsertSmsMessageInput = {
  company_id: string;
  contact_id?: string | null;
  deal_id?: string | null;
  from_number: string;
  to_number: string;
  body: string;
  direction: SmsMessageDirection;
  status?: string | null;
  sent_by_user_id?: string | null;
  has_media?: boolean;
};

export type SmsAttachmentRecord = {
  id: string;
  sms_message_id: string;
  company_id: string;
  deal_id: string;
  storage_key: string;
  original_filename: string;
  content_type: string;
  byte_size: number;
  author_type: 'client' | 'team';
  created_at: string;
  updated_at: string;
};

export type SmsAttachmentAsset = SmsAttachmentRecord & {
  signed_url: string;
  thumbnail_url: string | null;
};

export type SmsMessagesPage = {
  records: SmsMessageRecord[];
  hasMore: boolean;
  oldestCursor: string | null;
  newestCursor: string | null;
};

export type SmsChatThread = {
  id: string;
  dealId: string | null;
  dealStage: DealStageId | null;
  dealLabel: string | null;
  contactId: string | null;
  contactDisplayName: string;
  contactPhone: string | null;
  participantPhones: string[];
  participantEmails: string[];
  messages: SmsMessageRecord[];
  lastMessageAt: string | null;
  lastMessageBody: string | null;
  lastMessageDirection: SmsMessageDirection | null;
};
