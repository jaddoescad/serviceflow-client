import { renderCommunicationTemplate } from "@/features/communications";
import type { CommunicationTemplateSnapshot } from "@/features/communications";
import {
  INVOICE_DELIVERY_DEFAULT_EMAIL_BODY,
  INVOICE_DELIVERY_DEFAULT_TEXT_MESSAGE,
} from "@/constants/invoice-delivery";
import { formatButtonMarker, stripButtonMarkers } from "@/lib/template-variables";
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

  const [firstName, ...restName] = (context.clientName || "").trim().split(" ");
  const lastName = restName.join(" ");

  const templateVars = {
    // Company keywords
    "company-name": context.companyName,
    "company-phone": context.companyPhone ?? "",
    "company-website": context.companyWebsite ?? "",
    // Client keywords
    "client-name": context.clientName,
    "customer-name": context.clientName,
    "first-name": firstName || context.clientName || "Client",
    "last-name": lastName,
    // User keywords
    "current-user-name": context.currentUserName ?? "",
    "salesperson-signature": context.salespersonSignature ?? "",
    // Invoice keywords
    "invoice-number": context.invoiceNumber,
    "invoice-button": formatButtonMarker(context.invoiceUrl, "View Invoice"),
    "invoice-url": context.invoiceUrl ?? "",
  };

  const smsBody = stripButtonMarkers(
    renderCommunicationTemplate(template.smsBody, templateVars) ||
    renderCommunicationTemplate(INVOICE_DELIVERY_DEFAULT_TEXT_MESSAGE, templateVars)
  );

  const emailSubject =
    renderCommunicationTemplate(template.emailSubject, templateVars) || fallbackSubject;

  const emailBody =
    renderCommunicationTemplate(template.emailBody, templateVars) ||
    renderCommunicationTemplate(INVOICE_DELIVERY_DEFAULT_EMAIL_BODY, templateVars);

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

  const templateVars = {
    // Company keywords
    "company-name": context.companyName,
    "company-phone": context.companyPhone ?? "",
    "company-website": context.companyWebsite ?? "",
    // Client keywords
    "client-name": context.clientName,
    "customer-name": context.clientName,
    "first-name": firstName || context.clientName || "Client",
    "last-name": lastName,
    // User keywords
    "current-user-name": context.currentUserName ?? "",
    "salesperson-signature": context.salespersonSignature ?? "",
    // Invoice keywords
    "invoice-number": context.invoiceNumber,
    "invoice-button": formatButtonMarker(context.invoiceUrl, "View Invoice"),
    "invoice-url": context.invoiceUrl ?? "",
    "payment-amount": context.paymentAmount ?? "",
  };

  const smsBody = stripButtonMarkers(renderCommunicationTemplate(template.smsBody, templateVars));
  const emailSubject = renderCommunicationTemplate(template.emailSubject, templateVars);
  const emailBody = renderCommunicationTemplate(template.emailBody, templateVars);

  return {
    smsBody,
    emailSubject,
    emailBody,
  };
};

export const buildPaymentReceiptTemplateDefaults = (
  template: CommunicationTemplateSnapshot,
  context: TemplateContext
) => {
  const [firstName, ...restName] = (context.clientName || "").trim().split(" ");
  const lastName = restName.join(" ");

  const templateVars = {
    // Company keywords
    "company-name": context.companyName,
    "company-phone": context.companyPhone ?? "",
    "company-website": context.companyWebsite ?? "",
    // Client keywords
    "client-name": context.clientName,
    "customer-name": context.clientName,
    "first-name": firstName || context.clientName || "Client",
    "last-name": lastName,
    // User keywords
    "current-user-name": context.currentUserName ?? "",
    "salesperson-signature": context.salespersonSignature ?? "",
    // Invoice keywords
    "invoice-number": context.invoiceNumber,
    "invoice-button": formatButtonMarker(context.invoiceUrl, "View Invoice"),
    "invoice-url": context.invoiceUrl ?? "",
    "payment-amount": context.paymentAmount ?? "",
  };

  const emailSubject = renderCommunicationTemplate(template.emailSubject, templateVars);
  const emailBody = renderCommunicationTemplate(template.emailBody, templateVars);

  return {
    emailSubject,
    emailBody,
  };
};
