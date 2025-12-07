import type { EditableQuoteLineItem, QuoteRecord } from "@/features/quotes";
import type { CommunicationTemplateSnapshot } from "@/features/communications";
import { renderCommunicationTemplate } from "@/features/communications";
import { createClientId } from "@/lib/form-utils";
import { formatButtonMarker, stripButtonMarkers } from "@/lib/template-variables";
import type { ProposalTemplateContext, WorkOrderTemplateContext } from "./types";

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

export const buildProposalTemplateDefaults = (
  template: CommunicationTemplateSnapshot,
  context: ProposalTemplateContext
) => {
  const [firstName, ...restName] = (context.clientName || "").trim().split(" ");
  const lastName = restName.join(" ");

  const templateVars = {
    // Company keywords
    "company-name": context.companyName,
    "company-phone": context.companyPhone ?? "",
    "company-website": context.companyWebsite ?? "",
    // Client keywords
    "customer-name": context.clientName,
    "client-name": context.clientName,
    "first-name": firstName || context.clientName || "Client",
    "last-name": lastName,
    // User keywords
    "current-user-name": context.currentUserName ?? "",
    "salesperson-signature": context.salespersonSignature ?? "",
    // Proposal keywords
    "quote-number": context.quoteNumber,
    "proposal-button": formatButtonMarker(context.proposalUrl, "View Proposal"),
    "proposal-url": context.proposalUrl ?? "",
    "invoice-button": formatButtonMarker(context.invoiceUrl, "View Invoice"),
    "invoice-url": context.invoiceUrl ?? "",
    // Change order keywords
    "change-order-number": context.changeOrderNumber ?? "",
    "change-order-button": formatButtonMarker(context.proposalUrl, "View Change Order"),
  };

  return {
    emailSubject: renderCommunicationTemplate(template.emailSubject, templateVars),
    emailBody: renderCommunicationTemplate(template.emailBody, templateVars),
    smsBody: stripButtonMarkers(renderCommunicationTemplate(template.smsBody, templateVars)),
  };
};

export const buildWorkOrderTemplateDefaults = (
  template: CommunicationTemplateSnapshot,
  context: WorkOrderTemplateContext
) => {
  const [firstName, ...restName] = (context.clientName || "").trim().split(" ");
  const lastName = restName.join(" ");

  const templateVars = {
    // Company keywords
    "company-name": context.companyName,
    "company-phone": context.companyPhone ?? "",
    "company-website": context.companyWebsite ?? "",
    // Client keywords
    "customer-name": context.clientName,
    "client-name": context.clientName,
    "first-name": firstName || context.clientName || "Client",
    "last-name": lastName,
    // User keywords
    "current-user-name": context.currentUserName ?? "",
    "salesperson-signature": context.salespersonSignature ?? "",
    // Work order keywords
    "quote-number": context.quoteNumber,
    "work-order-button": formatButtonMarker(context.workOrderUrl, "View Work Order"),
    "work-order-address": context.workOrderAddress,
    // Job keywords
    "job-date": context.jobDate ?? "",
    "job-time": context.jobTime ?? "",
    "job-start-date": context.jobStartDate ?? "",
    "job-end-date": context.jobEndDate ?? "",
    "job-start-time": context.jobStartTime ?? "",
    "job-end-time": context.jobEndTime ?? "",
    "job-location": context.jobLocation ?? "",
    "job-address": context.jobAddress ?? "",
  };

  return {
    emailSubject: renderCommunicationTemplate(template.emailSubject, templateVars),
    emailBody: renderCommunicationTemplate(template.emailBody, templateVars),
    smsBody: stripButtonMarkers(renderCommunicationTemplate(template.smsBody, templateVars)),
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
