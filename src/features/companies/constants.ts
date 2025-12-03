import type { CompanySettingsRecord, CompanyEmailSettingsRecord, CompanyMemberRole } from "./types";

// Company Fields
export const COMPANY_SUMMARY_FIELDS = [
  "id",
  "name",
  "short_name",
  "email",
  "phone_number",
  "website",
  "review_url",
].join(", ");

export const COMPANY_SHARE_FIELDS = [
  "id",
  "name",
  "email",
  "phone_number",
  "physical_company_name",
  "physical_address_line1",
  "physical_address_line2",
  "physical_city",
  "physical_state",
  "physical_zip",
  "website",
  "review_url",
  "logo_storage_key",
].join(", ");

export const COMPANY_SETTINGS_FIELDS = [
  "id",
  "name",
  "email",
  "phone_number",
  "short_name",
  "business_type",
  "time_zone",
  "license_number",
  "physical_company_name",
  "physical_address_line1",
  "physical_address_line2",
  "physical_city",
  "physical_state",
  "physical_zip",
  "tax_rate",
  "website",
  "review_url",
  "logo_storage_key",
  "proposal_terms_template_key",
  "proposal_terms_template_content",
  "openphone_api_key",
  "openphone_phone_number_id",
  "openphone_phone_number",
  "openphone_enabled",
].join(", ");

export const LEGACY_COMPANY_SETTINGS_FIELDS = [
  "id",
  "name",
  "phone_number",
  "short_name",
].join(", ");

type CompanySettingsDefaults = Omit<CompanySettingsRecord, "id" | "name">;

export const COMPANY_SETTINGS_DEFAULTS: CompanySettingsDefaults = {
  email: null,
  phone_number: null,
  short_name: null,
  business_type: null,
  time_zone: null,
  license_number: null,
  physical_company_name: null,
  physical_address_line1: null,
  physical_address_line2: null,
  physical_city: null,
  physical_state: null,
  physical_zip: null,
  tax_rate: null,
  website: null,
  review_url: null,
  logo_storage_key: null,
  proposal_terms_template_key: null,
  proposal_terms_template_content: null,
  openphone_api_key: null,
  openphone_phone_number_id: null,
  openphone_phone_number: null,
  openphone_enabled: false,
};

// Company Member Fields
export const COMPANY_MEMBER_FIELDS = [
  "id",
  "company_id",
  "user_id",
  "email",
  "display_name",
  "role",
  "created_at",
  "updated_at",
].join(", ");

export type CompanyMemberRoleOption = {
  value: CompanyMemberRole;
  label: string;
  disabled?: boolean;
};

export const COMPANY_MEMBER_ROLE_OPTIONS: readonly CompanyMemberRoleOption[] = [
  { value: "admin", label: "Admin" },
  { value: "sales", label: "Sales" },
  { value: "project_manager", label: "Project Manager", disabled: true },
];

// Company Email Settings Fields
export const COMPANY_EMAIL_SETTINGS_FIELDS = [
  "id",
  "company_id",
  "reply_email",
  "bcc_email",
  "provider",
  "provider_account_email",
  "provider_account_id",
  "connected_at",
  "status",
  "status_error",
  "last_synced_at",
  "created_at",
  "updated_at",
].join(", ");

type CompanyEmailSettingsDefaults = Omit<CompanyEmailSettingsRecord, "id" | "company_id">;

export const COMPANY_EMAIL_SETTINGS_DEFAULTS: CompanyEmailSettingsDefaults = {
  reply_email: null,
  bcc_email: null,
  provider: null,
  provider_account_email: null,
  provider_account_id: null,
  connected_at: null,
  status: "disconnected",
  status_error: null,
  last_synced_at: null,
  created_at: null,
  updated_at: null,
};

// Company Branding Constants
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
