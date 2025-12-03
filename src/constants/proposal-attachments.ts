export const PROPOSAL_ATTACHMENT_FIELDS = `
  id,
  company_id,
  deal_id,
  quote_id,
  storage_key,
  thumbnail_key,
  original_filename,
  content_type,
  byte_size,
  uploaded_by_user_id,
  uploaded_at,
  updated_at
`;

export const DEAL_ATTACHMENT_SIGNED_URL_TTL_SECONDS = 60 * 60; // 1 hour
