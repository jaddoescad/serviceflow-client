export const DEFAULT_PROPOSAL_TERMS_TEMPLATE_CONTENT = `
1. Payment Terms: Payment is due upon receipt of invoice.
2. Warranty: Workmanship is guaranteed for 1 year.
3. Changes: Any changes to scope must be approved in writing.
`.trim();

export const DEFAULT_PROPOSAL_TERMS_TEMPLATE_KEY = "standard";

export const PROPOSAL_TERMS_TEMPLATES = [
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

export const getProposalTermsTemplateByKey = (key: string) => {
  return PROPOSAL_TERMS_TEMPLATES.find((t) => t.key === key) ?? null;
};