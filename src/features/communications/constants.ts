import type {
  CommunicationTemplateDefinition,
  CommunicationTemplateKey,
} from "./types";
import {
  APPOINTMENT_CONFIRMATION_KEYWORDS,
  PROPOSAL_QUOTE_KEYWORDS,
  INVOICE_SEND_KEYWORDS,
  INVOICE_PAYMENT_REQUEST_KEYWORDS,
  PAYMENT_RECEIPT_KEYWORDS,
  WORK_ORDER_DISPATCH_KEYWORDS,
  CHANGE_ORDER_SEND_KEYWORDS,
  JOB_SCHEDULE_KEYWORDS,
} from "@/lib/template-keywords";

export const COMMUNICATION_TEMPLATE_FIELDS =
  "id, company_id, template_key, name, description, email_subject, email_body, sms_body, created_at, updated_at";

export const COMMUNICATION_TEMPLATE_DEFINITIONS: Record<
  CommunicationTemplateKey,
  CommunicationTemplateDefinition
> = {
  appointment_confirmation: {
    key: "appointment_confirmation",
    label: "Appointment Confirmation",
    helpText:
      "Templates used when emailing or texting appointment confirmations or reschedules. Include {appointment-button} if you share a calendar link.",
    defaultEmailSubject: "Appointment scheduled with {company-name}",
    defaultEmailBody:
      "Hi {first-name},\n\nYour appointment with {company-name} is scheduled for {job-date} at {job-time}.\nIf you need to reschedule, call {company-phone} or visit {company-website}.\n\nThanks,\n{company-name}",
    defaultSmsBody:
      "Appointment with {company-name} on {job-date} at {job-time}. Questions? {company-phone}",
    keywords: [...APPOINTMENT_CONFIRMATION_KEYWORDS],
  },
  proposal_quote: {
    key: "proposal_quote",
    label: "Proposal Delivery",
    helpText:
      "Templates used when emailing or texting a proposal to a customer. Use {proposal-button} or {invoice-button} for clickable buttons, or {proposal-url} and {invoice-url} for plain URLs.",
    defaultEmailSubject: "{company-name} proposal for {customer-name}",
    defaultEmailBody:
      "Hi {first-name},\n\nYour proposal from {company-name} is ready.\n{proposal-button}\n\nIf you have questions, call {company-phone} or visit {company-website}.\n\nThank you,\n{company-name}",
    defaultSmsBody: "Proposal from {company-name}: {proposal-button}",
    keywords: [...PROPOSAL_QUOTE_KEYWORDS],
  },
  invoice_send: {
    key: "invoice_send",
    label: "Invoice Delivery",
    helpText:
      "Templates used when emailing or texting an invoice to a customer. Include {invoice-button} where the invoice link/button should appear.",
    defaultEmailSubject: "Invoice {invoice-number} from {company-name}",
    defaultEmailBody:
      "Hi {first-name},\n\nHere's invoice {invoice-number} from {company-name}.\n{invoice-button}\n\nIf anything looks off, call {company-phone}. We appreciate your business.\n\n{company-name} | {company-website}",
    defaultSmsBody:
      "Invoice {invoice-number} from {company-name}: {invoice-button}",
    keywords: [...INVOICE_SEND_KEYWORDS],
  },
  invoice_payment_request: {
    key: "invoice_payment_request",
    label: "Invoice Payment Request",
    helpText:
      "Templates used when requesting a payment or deposit. Include {invoice-button} where the invoice link/button should appear and {payment-amount} for the requested amount.",
    defaultEmailSubject:
      "Payment request for invoice {invoice-number} – {company-name}",
    defaultEmailBody:
      "Hi {first-name},\n\nA payment of {payment-amount} is requested for your project with {company-name}.\n{invoice-button}\n\nIf you need help, call {company-phone}.",
    defaultSmsBody:
      "Payment of {payment-amount} requested by {company-name}. {invoice-button}",
    keywords: [...INVOICE_PAYMENT_REQUEST_KEYWORDS],
  },
  payment_receipt: {
    key: "payment_receipt",
    label: "Payment Receipt",
    helpText:
      "Templates used when emailing or texting a receipt after a payment is recorded. Include {invoice-button} for the receipt/invoice link.",
    defaultEmailSubject: "Receipt for invoice {invoice-number} – {company-name}",
    defaultEmailBody:
      "Hi {first-name},\n\nWe received {payment-amount} for invoice {invoice-number}.\n{invoice-button}\n\nThank you for choosing {company-name}. If you need anything, reach us at {company-phone} or {company-website}.",
    defaultSmsBody:
      "Receipt: {payment-amount} received for invoice {invoice-number}. Thank you, {company-name}.",
    keywords: [...PAYMENT_RECEIPT_KEYWORDS],
  },
  work_order_dispatch: {
    key: "work_order_dispatch",
    label: "Work Order Dispatch",
    helpText:
      "Templates used when emailing or texting a work order to crew members. Include {work-order-button} where the work order link should appear.",
    defaultEmailSubject: "Work order for {customer-name} – {company-name}",
    defaultEmailBody:
      "Team,\n\nHere's the work order for {customer-name}.\n{work-order-button}\n\nSite contact: {first-name} {last-name}\nAddress: {work-order-address}\n\nQuestions? Call {company-phone}.",
    defaultSmsBody: "Work order from {company-name}: {work-order-button}",
    keywords: [...WORK_ORDER_DISPATCH_KEYWORDS],
  },
  change_order_send: {
    key: "change_order_send",
    label: "Change Order",
    helpText:
      "Templates used when emailing or texting a change order to a customer. Include {change-order-button} where the change order link/button should appear.",
    defaultEmailSubject: "Change order {change-order-number} from {company-name}",
    defaultEmailBody:
      "Hi {first-name},\n\nPlease review and approve change order {change-order-number} for {customer-name}.\n{change-order-button}\n\nIf you have questions, call {company-phone} or visit {company-website}.",
    defaultSmsBody: "Change order {change-order-number}: {change-order-button}",
    keywords: [...CHANGE_ORDER_SEND_KEYWORDS],
  },
  job_schedule: {
    key: "job_schedule",
    label: "Job Schedule",
    helpText:
      "Templates used when emailing or texting a scheduled job to a customer. Include {work-order-button} if you share a work order link.",
    defaultEmailSubject: "Your job is scheduled with {company-name}",
    defaultEmailBody:
      "Hi {client-name},\n\nYour job is scheduled for {job-date} at {job-time}.\nAddress: {job-address}\n\nIf you need to reschedule, reply to this email.",
    defaultSmsBody:
      "Your job is scheduled for {job-date} at {job-time}. {job-address}",
    keywords: [...JOB_SCHEDULE_KEYWORDS],
  },
};

export const COMMUNICATION_TEMPLATE_KEYS: CommunicationTemplateKey[] = [
  "appointment_confirmation",
  "proposal_quote",
  "invoice_send",
  "invoice_payment_request",
  "payment_receipt",
  "work_order_dispatch",
  "change_order_send",
  "job_schedule",
];
