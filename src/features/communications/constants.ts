import type {
  CommunicationTemplateDefinition,
  CommunicationTemplateKey,
} from "./types";

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
      "Templates used when emailing or texting appointment confirmations or reschedules. Include {{appointment_button}} if you share a calendar link.",
    defaultEmailSubject: "Appointment scheduled with {company-name}",
    defaultEmailBody:
      "Hi {first-name},\n\nYour appointment with {company-name} is scheduled for {job-date} at {job-time}.\nIf you need to reschedule, call {company-phone} or visit {company-website}.\n\nThanks,\n{company-name}",
    defaultSmsBody:
      "Appointment with {company-name} on {job-date} at {job-time}. Questions? {company-phone}",
    keywords: [
      "{company-name}",
      "{company-phone}",
      "{company-website}",
      "{current-user-name}",
      "{customer-name}",
      "{first-name}",
      "{last-name}",
      "{job-date}",
      "{job-time}",
      "{job-start-date}",
      "{job-end-date}",
      "{job-start-time}",
      "{job-end-time}",
      "{job-location}",
      "{salesperson-signature}",
      "{appointment_button}",
    ],
  },
  proposal_quote: {
    key: "proposal_quote",
    label: "Proposal Delivery",
    helpText:
      "Templates used when emailing or texting a proposal to a customer. Include {{proposal_button}} where the proposal link/button should appear.",
    defaultEmailSubject: "{company-name} proposal for {customer-name}",
    defaultEmailBody:
      "Hi {first-name},\n\nYour proposal from {company-name} is ready.\n{proposal_button}\n\nIf you have questions, call {company-phone} or visit {company-website}.\n\nThank you,\n{company-name}",
    defaultSmsBody: "Proposal from {company-name}: {proposal_button}",
    keywords: [
      "{company-name}",
      "{company-phone}",
      "{company-website}",
      "{customer-name}",
      "{first-name}",
      "{last-name}",
      "{quote-number}",
      "{proposal_button}",
      "{salesperson-signature}",
    ],
  },
  invoice_send: {
    key: "invoice_send",
    label: "Invoice Delivery",
    helpText:
      "Templates used when emailing or texting an invoice to a customer. Include {{invoice_button}} where the invoice link/button should appear.",
    defaultEmailSubject: "Invoice {invoice-number} from {company-name}",
    defaultEmailBody:
      "Hi {first-name},\n\nHere's invoice {invoice-number} from {company-name}.\n{invoice_button}\n\nIf anything looks off, call {company-phone}. We appreciate your business.\n\n{company-name} | {company-website}",
    defaultSmsBody:
      "Invoice {invoice-number} from {company-name}: {invoice_button}",
    keywords: [
      "{company-name}",
      "{company-phone}",
      "{company-website}",
      "{customer-name}",
      "{first-name}",
      "{last-name}",
      "{invoice-number}",
      "{invoice_button}",
      "{salesperson-signature}",
    ],
  },
  invoice_payment_request: {
    key: "invoice_payment_request",
    label: "Invoice Payment Request",
    helpText:
      "Templates used when requesting a payment or deposit. Include {{invoice_button}} where the invoice link/button should appear and {{payment_amount}} for the requested amount.",
    defaultEmailSubject:
      "Payment request for invoice {invoice-number} – {company-name}",
    defaultEmailBody:
      "Hi {first-name},\n\nA payment of {payment-amount} is requested for your project with {company-name}.\n{invoice_button}\n\nIf you need help, call {company-phone}.",
    defaultSmsBody:
      "Payment of {payment-amount} requested by {company-name}. {invoice_button}",
    keywords: [
      "{company-name}",
      "{company-phone}",
      "{company-website}",
      "{customer-name}",
      "{first-name}",
      "{last-name}",
      "{invoice-number}",
      "{invoice_button}",
      "{payment-amount}",
      "{salesperson-signature}",
    ],
  },
  payment_receipt: {
    key: "payment_receipt",
    label: "Payment Receipt",
    helpText:
      "Templates used when emailing or texting a receipt after a payment is recorded. Include {{invoice_button}} for the receipt/invoice link.",
    defaultEmailSubject: "Receipt for invoice {invoice-number} – {company-name}",
    defaultEmailBody:
      "Hi {first-name},\n\nWe received {payment-amount} for invoice {invoice-number}.\n{invoice_button}\n\nThank you for choosing {company-name}. If you need anything, reach us at {company-phone} or {company-website}.",
    defaultSmsBody:
      "Receipt: {payment-amount} received for invoice {invoice-number}. Thank you, {company-name}.",
    keywords: [
      "{company-name}",
      "{company-phone}",
      "{company-website}",
      "{customer-name}",
      "{first-name}",
      "{last-name}",
      "{invoice-number}",
      "{invoice_button}",
      "{payment-amount}",
      "{salesperson-signature}",
    ],
  },
  work_order_dispatch: {
    key: "work_order_dispatch",
    label: "Work Order Dispatch",
    helpText:
      "Templates used when emailing or texting a work order to crew members. Include {{work_order_button}} where the work order link should appear.",
    defaultEmailSubject: "Work order for {customer-name} – {company-name}",
    defaultEmailBody:
      "Team,\n\nHere's the work order for {customer-name}.\n{work_order_button}\n\nSite contact: {first-name} {last-name}\nAddress: {work-order-address}\n\nQuestions? Call {company-phone}.",
    defaultSmsBody: "Work order from {company-name}: {work_order_button}",
    keywords: [
      "{company-name}",
      "{company-phone}",
      "{company-website}",
      "{customer-name}",
      "{first-name}",
      "{last-name}",
      "{work-order-address}",
      "{work_order_button}",
      "{job-date}",
      "{job-time}",
      "{job-start-date}",
      "{job-end-date}",
      "{job-start-time}",
      "{job-end-time}",
      "{job-location}",
      "{salesperson-signature}",
    ],
  },
  change_order_send: {
    key: "change_order_send",
    label: "Change Order",
    helpText:
      "Templates used when emailing or texting a change order to a customer. Include {{change_order_button}} where the change order link/button should appear.",
    defaultEmailSubject: "Change order {change-order-number} from {company-name}",
    defaultEmailBody:
      "Hi {first-name},\n\nPlease review and approve change order {change-order-number} for {customer-name}.\n{change_order_button}\n\nIf you have questions, call {company-phone} or visit {company-website}.",
    defaultSmsBody: "Change order {change-order-number}: {change_order_button}",
    keywords: [
      "{company-name}",
      "{company-phone}",
      "{company-website}",
      "{customer-name}",
      "{first-name}",
      "{last-name}",
      "{change-order-number}",
      "{change_order_button}",
      "{salesperson-signature}",
    ],
  },
  job_schedule: {
    key: "job_schedule",
    label: "Job Schedule",
    helpText:
      "Templates used when emailing or texting a scheduled job to a customer. Include {{work_order_button}} if you share a work order link.",
    defaultEmailSubject: "Your job is scheduled with {company-name}",
    defaultEmailBody:
      "Hi {client-name},\n\nYour job is scheduled for {job-date} at {job-time}.\nAddress: {job-address}\n\nIf you need to reschedule, reply to this email.",
    defaultSmsBody:
      "Your job is scheduled for {job-date} at {job-time}. {job-address}",
    keywords: [
      "{company-name}",
      "{company-phone}",
      "{company-website}",
      "{customer-name}",
      "{client-name}",
      "{first-name}",
      "{last-name}",
      "{job-date}",
      "{job-time}",
      "{appointment-date}",
      "{appointment-time}",
      "{job-address}",
      "{job-schedule}",
      "{work_order_button}",
    ],
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
