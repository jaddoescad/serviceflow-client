export const COMPANY_BRANDING_BUCKET = "company-branding";

export const COMPANY_BRANDING_FIELDS = [
  "id",
  "name",
  "email",
  "phone_number",
  "website",
  "review_url",
  "logo_storage_key",
].join(", ");

export const COMPANY_LOGO_SIGNED_URL_TTL_SECONDS = 60 * 60; // 1 hour
