import type { SmsMessageRecord } from "@/types/sms";
import type { DealChatMessage } from "@/types/deal-details";

export const mapSmsRecordsToDealChatMessages = (
    records: SmsMessageRecord[],
    contactDisplayName?: string
): DealChatMessage[] => {
  return records.map((record) => {
    const isOutbound = record.direction === "outbound";
    
    return {
      id: record.id,
      author_type: isOutbound ? "team" : "client",
      author_name: isOutbound ? "Team" : (contactDisplayName || "Client"),
      body: record.body,
      sent_at: record.created_at,
      attachments: record.attachments?.map(att => ({
          id: att.id,
          filename: att.original_filename,
          url: att.signed_url,
          uploaded_at: att.created_at,
          uploaded_by: att.author_type === 'team' ? "Team" : (contactDisplayName || "Client"),
          file_size: `${att.byte_size} bytes`,
          type: "image",
          thumbnail_url: att.thumbnail_url || undefined
      })) ?? [],
      pending_attachments: false
    };
  });
};