/**
 * Message Template Rendering
 *
 * Renders message templates by replacing placeholders with values.
 * All placeholders use kebab-case: {company-name}, {first-name}, etc.
 */

import { formatCurrency } from "@/lib/currency";
import { formatButtonMarker } from "@/lib/template-variables";
import type { MessageContent } from "./types";

export type TemplateVariables = Record<string, string | null>;

/**
 * Renders a template string by replacing {placeholder} tokens with values.
 */
export function renderTemplate(
  template: string,
  variables: TemplateVariables
): string {
  let result = template;

  Object.entries(variables).forEach(([key, value]) => {
    result = result.replace(new RegExp(`\\{${key}\\}`, "g"), value ?? "");
  });

  return result;
}

/**
 * Renders all message content (email subject, body, SMS) with the given variables.
 */
export function renderMessageContent(
  content: MessageContent,
  variables: TemplateVariables
): MessageContent {
  return {
    emailSubject: renderTemplate(content.emailSubject, variables),
    emailBody: renderTemplate(content.emailBody, variables),
    smsBody: renderTemplate(content.smsBody, variables),
  };
}

/**
 * Builds template variables for company info.
 */
export function buildCompanyVars(company: {
  name: string;
  phone?: string | null;
  website?: string | null;
}): TemplateVariables {
  return {
    "company-name": company.name,
    "company-phone": company.phone ?? "",
    "company-website": company.website ?? "",
  };
}

/**
 * Builds template variables for client info.
 * Automatically splits full name into first/last.
 */
export function buildClientVars(fullName: string): TemplateVariables {
  const trimmed = (fullName || "").trim();
  const [first, ...rest] = trimmed.split(" ");
  const last = rest.join(" ");

  return {
    "client-name": trimmed,
    "customer-name": trimmed,
    "first-name": first || trimmed || "Client",
    "last-name": last,
  };
}

/**
 * Builds template variables for invoice-related messages.
 * -button uses marker format for styled buttons in emails (plain URL in SMS).
 * -url always shows plain URL.
 */
export function buildInvoiceVars(invoice: {
  number: string;
  url?: string | null;
  paymentAmount?: number | null;
}): TemplateVariables {
  return {
    "invoice-number": invoice.number,
    "invoice-button": formatButtonMarker(invoice.url, "View Invoice"),
    "invoice-url": invoice.url ?? "",
    "payment-amount": invoice.paymentAmount != null
      ? formatCurrency(invoice.paymentAmount)
      : "",
  };
}

/**
 * Builds template variables for proposal-related messages.
 * -button uses marker format for styled buttons in emails (plain URL in SMS).
 * -url always shows plain URL.
 */
export function buildProposalVars(proposal: {
  number: string;
  url?: string | null;
}): TemplateVariables {
  return {
    "quote-number": proposal.number,
    "proposal-button": formatButtonMarker(proposal.url, "View Proposal"),
    "proposal-url": proposal.url ?? "",
  };
}

/**
 * Builds template variables for change order messages.
 * Button uses marker format for styled buttons in emails (plain URL in SMS).
 */
export function buildChangeOrderVars(changeOrder: {
  number: string;
  url?: string | null;
}): TemplateVariables {
  return {
    "change-order-number": changeOrder.number,
    "change-order-button": formatButtonMarker(changeOrder.url, "View Change Order"),
  };
}

/**
 * Builds template variables for work order messages.
 * Button uses marker format for styled buttons in emails (plain URL in SMS).
 */
export function buildWorkOrderVars(workOrder: {
  address?: string | null;
  url?: string | null;
}): TemplateVariables {
  return {
    "work-order-address": workOrder.address ?? "",
    "work-order-button": formatButtonMarker(workOrder.url, "View Work Order"),
  };
}

/**
 * Builds template variables for job schedule messages.
 */
export function buildJobVars(job: {
  date?: string | null;
  time?: string | null;
  address?: string | null;
  location?: string | null;
}): TemplateVariables {
  return {
    "job-date": job.date ?? "",
    "job-time": job.time ?? "",
    "job-address": job.address ?? "",
    "job-location": job.location ?? "",
  };
}

/**
 * Combines multiple variable objects into one.
 */
export function combineVars(...varObjects: TemplateVariables[]): TemplateVariables {
  return Object.assign({}, ...varObjects);
}
