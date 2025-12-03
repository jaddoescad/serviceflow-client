export const SMS_ATTACHMENT_FIELDS = `
  id,
  sms_message_id,
  company_id,
  deal_id,
  storage_key,
  original_filename,
  content_type,
  byte_size,
  author_type,
  created_at,
  updated_at
`;

export const SMS_ATTACHMENT_SIGNED_URL_TTL_SECONDS = 60 * 60; // 1 hour
