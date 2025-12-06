/**
 * Template Variable Builder
 *
 * Provides utilities for building template variable objects consistently
 * across the application. All variable keys use kebab-case to match
 * template placeholders exactly.
 */

import { formatCurrency } from "@/lib/currency";

// =============================================================================
// Types - All keys use kebab-case to match template placeholders
// =============================================================================

export type CompanyVariables = {
  "company-name": string;
  "company-phone": string;
  "company-website": string;
};

export type ClientVariables = {
  "client-name": string;
  "customer-name": string;
  "first-name": string;
  "last-name": string;
};

export type UserVariables = {
  "current-user-name": string;
  "salesperson-signature": string;
};

export type InvoiceVariables = {
  "invoice-number": string;
  "invoice-button": string;
  "payment-amount": string;
};

export type ProposalVariables = {
  "quote-number": string;
  "proposal-button": string;
};

export type JobVariables = {
  "job-date": string;
  "job-time": string;
  "job-start-date": string;
  "job-end-date": string;
  "job-start-time": string;
  "job-end-time": string;
  "job-location": string;
  "job-address": string;
};

export type AppointmentVariables = {
  "appointment-date": string;
  "appointment-time": string;
  "appointment-button": string;
};

export type WorkOrderVariables = {
  "work-order-address": string;
  "work-order-button": string;
};

export type ChangeOrderVariables = {
  "change-order-number": string;
  "change-order-button": string;
};

export type DealVariables = {
  "deal-name": string;
  "deal-stage": string;
  "deal-address": string;
};

export type ReviewVariables = {
  "review-button": string;
};

// =============================================================================
// Builder Functions
// =============================================================================

/**
 * Build company-related template variables
 */
export function buildCompanyVariables(options: {
  name: string;
  phone?: string | null;
  website?: string | null;
}): CompanyVariables {
  return {
    "company-name": options.name,
    "company-phone": options.phone ?? "",
    "company-website": options.website ?? "",
  };
}

/**
 * Build client-related template variables
 * Automatically splits full name into first/last name
 */
export function buildClientVariables(fullName: string): ClientVariables {
  const trimmedName = (fullName || "").trim();
  const [firstName, ...restName] = trimmedName.split(" ");
  const lastName = restName.join(" ");

  return {
    "client-name": trimmedName,
    "customer-name": trimmedName,
    "first-name": firstName || trimmedName || "Client",
    "last-name": lastName,
  };
}

/**
 * Build user-related template variables
 */
export function buildUserVariables(options: {
  currentUserName?: string | null;
  salespersonSignature?: string | null;
}): UserVariables {
  return {
    "current-user-name": options.currentUserName ?? "",
    "salesperson-signature": options.salespersonSignature ?? "",
  };
}

/**
 * Build invoice-related template variables
 */
export function buildInvoiceVariables(options: {
  invoiceNumber: string;
  invoiceUrl?: string | null;
  paymentAmount?: number | null;
}): InvoiceVariables {
  return {
    "invoice-number": options.invoiceNumber,
    "invoice-button": options.invoiceUrl ?? "",
    "payment-amount": options.paymentAmount != null ? formatCurrency(options.paymentAmount) : "",
  };
}

/**
 * Build proposal-related template variables
 */
export function buildProposalVariables(options: {
  quoteNumber: string;
  proposalUrl?: string | null;
}): ProposalVariables {
  return {
    "quote-number": options.quoteNumber,
    "proposal-button": options.proposalUrl ?? "",
  };
}

/**
 * Build job-related template variables
 */
export function buildJobVariables(options: {
  date?: string | null;
  time?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  location?: string | null;
  address?: string | null;
}): JobVariables {
  return {
    "job-date": options.date ?? "",
    "job-time": options.time ?? "",
    "job-start-date": options.startDate ?? "",
    "job-end-date": options.endDate ?? "",
    "job-start-time": options.startTime ?? "",
    "job-end-time": options.endTime ?? "",
    "job-location": options.location ?? "",
    "job-address": options.address ?? "",
  };
}

/**
 * Build appointment-related template variables
 */
export function buildAppointmentVariables(options: {
  date?: string | null;
  time?: string | null;
  buttonUrl?: string | null;
}): AppointmentVariables {
  return {
    "appointment-date": options.date ?? "",
    "appointment-time": options.time ?? "",
    "appointment-button": options.buttonUrl ?? "",
  };
}

/**
 * Build work order-related template variables
 */
export function buildWorkOrderVariables(options: {
  address?: string | null;
  buttonUrl?: string | null;
}): WorkOrderVariables {
  return {
    "work-order-address": options.address ?? "",
    "work-order-button": options.buttonUrl ?? "",
  };
}

/**
 * Build change order-related template variables
 */
export function buildChangeOrderVariables(options: {
  changeOrderNumber: string;
  buttonUrl?: string | null;
}): ChangeOrderVariables {
  return {
    "change-order-number": options.changeOrderNumber,
    "change-order-button": options.buttonUrl ?? "",
  };
}

/**
 * Build deal-related template variables
 */
export function buildDealVariables(options: {
  name?: string | null;
  stage?: string | null;
  address?: string | null;
}): DealVariables {
  return {
    "deal-name": options.name ?? "",
    "deal-stage": options.stage ?? "",
    "deal-address": options.address ?? "",
  };
}

/**
 * Build review-related template variables
 */
export function buildReviewVariables(options: {
  buttonUrl?: string | null;
}): ReviewVariables {
  return {
    "review-button": options.buttonUrl ?? "",
  };
}

// =============================================================================
// Composite Builders
// =============================================================================

/**
 * Build all variables needed for invoice-related templates
 * (invoice_send, invoice_payment_request, payment_receipt)
 */
export function buildInvoiceTemplateVariables(options: {
  company: { name: string; phone?: string | null; website?: string | null };
  clientName: string;
  invoiceNumber: string;
  invoiceUrl?: string | null;
  paymentAmount?: number | null;
  currentUserName?: string | null;
  salespersonSignature?: string | null;
}): CompanyVariables & ClientVariables & UserVariables & InvoiceVariables {
  return {
    ...buildCompanyVariables(options.company),
    ...buildClientVariables(options.clientName),
    ...buildUserVariables({
      currentUserName: options.currentUserName,
      salespersonSignature: options.salespersonSignature,
    }),
    ...buildInvoiceVariables({
      invoiceNumber: options.invoiceNumber,
      invoiceUrl: options.invoiceUrl,
      paymentAmount: options.paymentAmount,
    }),
  };
}

/**
 * Build all variables needed for proposal-related templates
 * (proposal_quote, change_order_send)
 */
export function buildProposalTemplateVariables(options: {
  company: { name: string; phone?: string | null; website?: string | null };
  clientName: string;
  quoteNumber: string;
  proposalUrl?: string | null;
  changeOrderNumber?: string | null;
  changeOrderUrl?: string | null;
  currentUserName?: string | null;
  salespersonSignature?: string | null;
}): CompanyVariables & ClientVariables & UserVariables & ProposalVariables & Partial<ChangeOrderVariables> {
  return {
    ...buildCompanyVariables(options.company),
    ...buildClientVariables(options.clientName),
    ...buildUserVariables({
      currentUserName: options.currentUserName,
      salespersonSignature: options.salespersonSignature,
    }),
    ...buildProposalVariables({
      quoteNumber: options.quoteNumber,
      proposalUrl: options.proposalUrl,
    }),
    ...(options.changeOrderNumber
      ? buildChangeOrderVariables({
          changeOrderNumber: options.changeOrderNumber,
          buttonUrl: options.changeOrderUrl,
        })
      : {}),
  };
}

/**
 * Build all variables needed for drip templates
 */
export function buildDripTemplateVariables(options: {
  company: { name: string; phone?: string | null; website?: string | null };
  clientName: string;
  deal?: { name?: string | null; stage?: string | null; address?: string | null };
  appointment?: { date?: string | null; time?: string | null; buttonUrl?: string | null };
  reviewUrl?: string | null;
  currentUserName?: string | null;
  salespersonSignature?: string | null;
}): CompanyVariables & ClientVariables & UserVariables & DealVariables & AppointmentVariables & ReviewVariables {
  return {
    ...buildCompanyVariables(options.company),
    ...buildClientVariables(options.clientName),
    ...buildUserVariables({
      currentUserName: options.currentUserName,
      salespersonSignature: options.salespersonSignature,
    }),
    ...buildDealVariables(options.deal ?? {}),
    ...buildAppointmentVariables(options.appointment ?? {}),
    ...buildReviewVariables({ buttonUrl: options.reviewUrl }),
  };
}
