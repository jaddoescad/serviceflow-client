/**
 * Centralized Template Keywords System
 *
 * This module provides a single source of truth for all template placeholders
 * used across communication templates, drips, and other messaging features.
 *
 * All keywords use kebab-case format (e.g., {first-name}) as the canonical form.
 * The renderCommunicationTemplate function automatically handles conversion to
 * snake_case and camelCase variants for backwards compatibility.
 */

// =============================================================================
// Core Keywords - Available across all template types
// =============================================================================

export const COMPANY_KEYWORDS = [
  "{company-name}",
  "{company-phone}",
  "{company-website}",
] as const;

export const CLIENT_KEYWORDS = [
  "{customer-name}",
  "{client-name}",
  "{first-name}",
  "{last-name}",
] as const;

export const USER_KEYWORDS = [
  "{current-user-name}",
  "{salesperson-signature}",
] as const;

// =============================================================================
// Feature-Specific Keywords
// =============================================================================

export const APPOINTMENT_KEYWORDS = [
  "{appointment-date}",
  "{appointment-time}",
  "{appointment-button}",
] as const;

export const JOB_KEYWORDS = [
  "{job-date}",
  "{job-time}",
  "{job-start-date}",
  "{job-end-date}",
  "{job-start-time}",
  "{job-end-time}",
  "{job-location}",
  "{job-address}",
] as const;

export const INVOICE_KEYWORDS = [
  "{invoice-number}",
  "{invoice-button}",
  "{payment-amount}",
] as const;

export const PROPOSAL_KEYWORDS = [
  "{quote-number}",
  "{proposal-button}",
] as const;

export const CHANGE_ORDER_KEYWORDS = [
  "{change-order-number}",
  "{change-order-button}",
] as const;

export const WORK_ORDER_KEYWORDS = [
  "{work-order-address}",
  "{work-order-button}",
] as const;

export const DEAL_KEYWORDS = [
  "{deal-name}",
  "{deal-stage}",
  "{deal-address}",
] as const;

export const REVIEW_KEYWORDS = [
  "{review-button}",
] as const;

// =============================================================================
// Template Type Keyword Sets
// =============================================================================

export const APPOINTMENT_CONFIRMATION_KEYWORDS = [
  ...COMPANY_KEYWORDS,
  ...CLIENT_KEYWORDS,
  ...USER_KEYWORDS,
  ...APPOINTMENT_KEYWORDS,
  ...JOB_KEYWORDS,
] as const;

export const PROPOSAL_QUOTE_KEYWORDS = [
  ...COMPANY_KEYWORDS,
  ...CLIENT_KEYWORDS,
  ...USER_KEYWORDS,
  ...PROPOSAL_KEYWORDS,
] as const;

export const INVOICE_SEND_KEYWORDS = [
  ...COMPANY_KEYWORDS,
  ...CLIENT_KEYWORDS,
  ...USER_KEYWORDS,
  ...INVOICE_KEYWORDS,
] as const;

export const INVOICE_PAYMENT_REQUEST_KEYWORDS = [
  ...COMPANY_KEYWORDS,
  ...CLIENT_KEYWORDS,
  ...USER_KEYWORDS,
  ...INVOICE_KEYWORDS,
] as const;

export const PAYMENT_RECEIPT_KEYWORDS = [
  ...COMPANY_KEYWORDS,
  ...CLIENT_KEYWORDS,
  ...USER_KEYWORDS,
  ...INVOICE_KEYWORDS,
] as const;

export const WORK_ORDER_DISPATCH_KEYWORDS = [
  ...COMPANY_KEYWORDS,
  ...CLIENT_KEYWORDS,
  ...USER_KEYWORDS,
  ...WORK_ORDER_KEYWORDS,
  ...JOB_KEYWORDS,
] as const;

export const CHANGE_ORDER_SEND_KEYWORDS = [
  ...COMPANY_KEYWORDS,
  ...CLIENT_KEYWORDS,
  ...USER_KEYWORDS,
  ...CHANGE_ORDER_KEYWORDS,
] as const;

export const JOB_SCHEDULE_KEYWORDS = [
  ...COMPANY_KEYWORDS,
  ...CLIENT_KEYWORDS,
  ...USER_KEYWORDS,
  ...JOB_KEYWORDS,
  ...WORK_ORDER_KEYWORDS,
] as const;

export const DRIP_KEYWORDS = [
  ...COMPANY_KEYWORDS,
  ...CLIENT_KEYWORDS,
  ...USER_KEYWORDS,
  ...DEAL_KEYWORDS,
  ...APPOINTMENT_KEYWORDS,
  ...REVIEW_KEYWORDS,
] as const;

// =============================================================================
// Keyword Sets by Template Key
// =============================================================================

export const TEMPLATE_KEYWORDS = {
  appointment_confirmation: APPOINTMENT_CONFIRMATION_KEYWORDS,
  proposal_quote: PROPOSAL_QUOTE_KEYWORDS,
  invoice_send: INVOICE_SEND_KEYWORDS,
  invoice_payment_request: INVOICE_PAYMENT_REQUEST_KEYWORDS,
  payment_receipt: PAYMENT_RECEIPT_KEYWORDS,
  work_order_dispatch: WORK_ORDER_DISPATCH_KEYWORDS,
  change_order_send: CHANGE_ORDER_SEND_KEYWORDS,
  job_schedule: JOB_SCHEDULE_KEYWORDS,
  drip: DRIP_KEYWORDS,
} as const;

export type TemplateKeywordKey = keyof typeof TEMPLATE_KEYWORDS;

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Get keywords for a specific template type
 */
export function getTemplateKeywords(templateKey: TemplateKeywordKey): readonly string[] {
  return TEMPLATE_KEYWORDS[templateKey];
}

/**
 * Get all unique keywords across all template types
 */
export function getAllKeywords(): string[] {
  const allKeywords = new Set<string>();
  Object.values(TEMPLATE_KEYWORDS).forEach((keywords) => {
    keywords.forEach((keyword) => allKeywords.add(keyword));
  });
  return Array.from(allKeywords).sort();
}

/**
 * Check if a keyword is valid for a given template type
 */
export function isValidKeyword(templateKey: TemplateKeywordKey, keyword: string): boolean {
  const keywords = TEMPLATE_KEYWORDS[templateKey];
  return (keywords as readonly string[]).includes(keyword);
}

/**
 * Extract keywords from a template string
 */
export function extractKeywordsFromTemplate(template: string): string[] {
  const regex = /\{[\w-]+\}/g;
  const matches = template.match(regex);
  return matches ? [...new Set(matches)] : [];
}

/**
 * Validate that all keywords in a template are valid for the given template type
 */
export function validateTemplateKeywords(
  templateKey: TemplateKeywordKey,
  template: string
): { valid: boolean; invalidKeywords: string[] } {
  const usedKeywords = extractKeywordsFromTemplate(template);
  const validKeywords = TEMPLATE_KEYWORDS[templateKey] as readonly string[];
  const invalidKeywords = usedKeywords.filter(
    (keyword) => !validKeywords.includes(keyword)
  );
  return {
    valid: invalidKeywords.length === 0,
    invalidKeywords,
  };
}
