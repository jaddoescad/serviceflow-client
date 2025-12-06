import { renderCommunicationTemplate } from "@/features/communications";
import type { CommunicationTemplateSnapshot } from "@/features/communications";
import {
  INVOICE_DELIVERY_DEFAULT_EMAIL_BODY,
  INVOICE_DELIVERY_DEFAULT_TEXT_MESSAGE,
} from "@/constants/invoice-delivery";
import type { TemplateContext } from "./types";

export const formatDate = (value: string): string => {
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    return "Not set";
  }
  return new Date(timestamp).toLocaleDateString();
};

export const formatStatusLabel = (value: string): string =>
  value.charAt(0).toUpperCase() + value.slice(1);

export function buildInvoiceTemplateDefaults(
  template: CommunicationTemplateSnapshot,
  context: TemplateContext
) {
  const fallbackSubject = context.invoiceNumber
    ? `Invoice #${context.invoiceNumber}`
    : context.companyName
      ? `${context.companyName} Invoice`
      : "Invoice";

  const templateContext = {
    companyName: context.companyName,
    clientName: context.clientName,
    invoiceNumber: context.invoiceNumber,
    invoiceUrl: context.invoiceUrl ?? null,
  } satisfies TemplateContext;

  const smsBody =
    renderCommunicationTemplate(template.smsBody, templateContext) ||
    renderCommunicationTemplate(INVOICE_DELIVERY_DEFAULT_TEXT_MESSAGE, templateContext);

  const emailSubject =
    renderCommunicationTemplate(template.emailSubject, templateContext) || fallbackSubject;

  const emailBody =
    renderCommunicationTemplate(template.emailBody, templateContext) ||
    renderCommunicationTemplate(INVOICE_DELIVERY_DEFAULT_EMAIL_BODY, templateContext);

  return {
    smsBody,
    emailSubject,
    emailBody,
  };
}

export const buildPaymentRequestTemplateDefaults = (
  template: CommunicationTemplateSnapshot,
  context: TemplateContext
) => {
  const [firstName, ...restName] = (context.clientName || "").trim().split(" ");
  const lastName = restName.join(" ");

  const templateContext = {
    companyName: context.companyName,
    companyPhone: context.companyPhone ?? null,
    clientName: context.clientName,
    customerName: context.clientName,
    firstName: firstName || context.clientName || "Client",
    lastName,
    invoiceNumber: context.invoiceNumber,
    invoiceUrl: context.invoiceUrl ?? null,
    invoiceButton: context.invoiceUrl ?? null,
    paymentAmount: context.paymentAmount ?? null,
  };

  const smsBody = renderCommunicationTemplate(template.smsBody, templateContext);
  const emailSubject = renderCommunicationTemplate(template.emailSubject, templateContext);
  const emailBody = renderCommunicationTemplate(template.emailBody, templateContext);

  return {
    smsBody,
    emailSubject,
    emailBody,
  };
};
