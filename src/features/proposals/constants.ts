// Proposal Terms Templates
export const DEFAULT_PROPOSAL_TERMS_TEMPLATE_CONTENT = `
1. Payment Terms: Payment is due upon receipt of invoice.
2. Warranty: Workmanship is guaranteed for 1 year.
3. Changes: Any changes to scope must be approved in writing.
`.trim();

export const DEFAULT_PROPOSAL_TERMS_TEMPLATE_KEY = "standard";

export type ProposalTermsTemplate = {
  key: string;
  label: string;
  content: string;
  description: string;
};

export const PROPOSAL_TERMS_TEMPLATES: ProposalTermsTemplate[] = [
  {
    key: "standard",
    label: "Standard Terms",
    content: DEFAULT_PROPOSAL_TERMS_TEMPLATE_CONTENT,
    description: "Standard terms for residential projects.",
  },
  {
    key: "commercial",
    label: "Commercial Terms",
    content: "Commercial terms...",
    description: "Terms for commercial contracts.",
  },
];

export const getProposalTermsTemplateByKey = (
  key: string
): ProposalTermsTemplate | null => {
  return PROPOSAL_TERMS_TEMPLATES.find((t) => t.key === key) ?? null;
};

// Proposal Attachment Constants
export const PROPOSAL_ATTACHMENT_FIELDS = [
  "id",
  "company_id",
  "deal_id",
  "quote_id",
  "storage_key",
  "thumbnail_key",
  "original_filename",
  "content_type",
  "byte_size",
  "uploaded_by_user_id",
  "uploaded_at",
  "updated_at",
].join(", ");

export const PROPOSAL_ATTACHMENT_BUCKET = "proposal-attachments";
export const PROPOSAL_ATTACHMENT_MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
