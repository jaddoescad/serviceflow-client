import type { EditableQuoteLineItem, QuoteRecord } from "@/features/quotes";
import type { CommunicationTemplateSnapshot } from "@/features/communications";
import { createClientId } from "@/lib/form-utils";
import type { WorkOrderTemplateContext } from "./types";

export const mapRecordToEditable = (
  record: QuoteRecord["line_items"][number],
  fallbackClientId?: string
): EditableQuoteLineItem => ({
  id: record.id,
  client_id: fallbackClientId ?? record.id ?? createClientId(),
  name: record.name,
  description: record.description ?? "",
  quantity: 1,
  unitPrice: String(record.unit_price ?? 0),
  isDiscount: (record.unit_price ?? 0) < 0,
});

export const createEmptyLineItem = (isDiscount = false): EditableQuoteLineItem => ({
  client_id: createClientId(),
  name: isDiscount ? "Discount" : "",
  description: "",
  quantity: 1,
  unitPrice: "0",
  isDiscount,
});

export const formatDateTime = (value: Date) =>
  value.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

export const buildProposalTemplateDefaults = (template: CommunicationTemplateSnapshot) => {
  return {
    emailSubject: template.emailSubject,
    emailBody: template.emailBody,
    smsBody: template.smsBody,
  };
};

export const buildWorkOrderTemplateDefaults = (
  template: CommunicationTemplateSnapshot,
  _context: WorkOrderTemplateContext
) => {
  return {
    emailSubject: template.emailSubject,
    emailBody: template.emailBody,
    smsBody: template.smsBody,
  };
};

export const getStatusLabel = (status: QuoteRecord["status"]): string => {
  switch (status) {
    case "sent":
      return "Sent";
    case "accepted":
      return "Accepted";
    case "declined":
      return "Declined";
    default:
      return "Draft";
  }
};
