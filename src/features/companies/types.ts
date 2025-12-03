// Company Member Types
export type CompanyMemberRole = "admin" | "sales" | "project_manager";

export type CompanyMemberRecord = {
  id: string;
  company_id: string;
  user_id: string;
  email: string;
  display_name: string;
  role: CompanyMemberRole;
  created_at: string;
  updated_at: string;
};

export type CreateCompanyMemberInput = {
  company_id: string;
  user_id: string;
  email: string;
  display_name: string;
  role: CompanyMemberRole;
};

export type InviteCompanyMemberPayload = {
  email: string;
  displayName: string;
  role: Exclude<CompanyMemberRole, "project_manager">;
};

// Company Email Settings Types
export type EmailProvider = "postmark";
export type EmailProviderStatus = "disconnected" | "connected" | "error";

export type CompanyEmailSettingsRecord = {
  id: string;
  company_id: string;
  reply_email: string | null;
  bcc_email: string | null;
  provider: EmailProvider | null;
  provider_account_email: string | null;
  provider_account_id: string | null;
  connected_at: string | null;
  status: EmailProviderStatus;
  status_error: string | null;
  last_synced_at: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type UpsertCompanyEmailSettingsInput = {
  reply_email: string | null;
  bcc_email: string | null;
};

export type UpdateCompanyEmailProviderInput = {
  provider: EmailProvider | null;
  provider_account_email?: string | null;
  provider_account_id?: string | null;
  connected_at?: string | null;
  status?: EmailProviderStatus;
  status_error?: string | null;
  last_synced_at?: string | null;
};

export type CompanyEmailCredentialRecord = {
  id: string;
  company_id: string;
  provider: EmailProvider;
  api_token: string;
  created_at?: string | null;
  updated_at?: string | null;
};

// Company Branding Types
export type CompanyBrandingDetails = {
  name: string | null;
  email: string | null;
  phone_number: string | null;
  website: string | null;
  review_url: string | null;
  logo_storage_key: string | null;
};

export type QuoteCompanyBranding = {
  name: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  reviewUrl: string | null;
  logoUrl: string | null;
};

export type BrandingApiResponse = {
  branding?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    website?: string | null;
    reviewUrl?: string | null;
    logoUrl?: string | null;
  };
  error?: string;
};

// Company Types
export type CompanyRecord = {
  id: string;
  user_id: string;
  email: string | null;
  name: string;
  owner_first_name: string | null;
  owner_last_name: string | null;
  employee_count: number | null;
  phone_number: string | null;
  website: string | null;
  review_url: string | null;
  logo_storage_key: string | null;
  short_name: string | null;
  business_type: string | null;
  time_zone: string | null;
  license_number: string | null;
  physical_company_name: string | null;
  physical_address_line1: string | null;
  physical_address_line2: string | null;
  physical_city: string | null;
  physical_state: string | null;
  physical_zip: string | null;
  tax_rate: number | null;
  proposal_terms_template_key: string | null;
  proposal_terms_template_content: string | null;
  openphone_api_key: string | null;
  openphone_phone_number_id: string | null;
  openphone_phone_number: string | null;
  openphone_enabled: boolean | null;
  created_at?: string;
  updated_at?: string;
};

export type CompanySummary = Pick<
  CompanyRecord,
  "id" | "name" | "short_name" | "email" | "phone_number" | "website" | "review_url"
>;

export type CompanyBrandingRecord = Pick<
  CompanyRecord,
  "id" | "name" | "website" | "review_url" | "logo_storage_key"
>;

export type CompanySettingsRecord = Pick<
  CompanyRecord,
  | "id"
  | "name"
  | "phone_number"
  | "email"
  | "short_name"
  | "business_type"
  | "time_zone"
  | "license_number"
  | "physical_company_name"
  | "physical_address_line1"
  | "physical_address_line2"
  | "physical_city"
  | "physical_state"
  | "physical_zip"
  | "tax_rate"
  | "website"
  | "review_url"
  | "logo_storage_key"
  | "proposal_terms_template_key"
  | "proposal_terms_template_content"
  | "openphone_api_key"
  | "openphone_phone_number_id"
  | "openphone_phone_number"
  | "openphone_enabled"
>;

export type CreateCompanyInput = {
  user_id: string | null;
  email: string;
  name: string;
  owner_first_name: string;
  owner_last_name: string;
  employee_count: number;
  phone_number: string;
  website: string | null;
};

export type CreateOrganizationInput = {
  name: string;
  owner_first_name: string;
  owner_last_name: string;
  employee_count: number;
  phone_number: string;
  email: string;
  website: string | null;
};

export type UpdateCompanySettingsInput = {
  name: string;
  short_name: string | null;
  business_type: string | null;
  time_zone: string | null;
  license_number: string | null;
  physical_company_name: string | null;
  physical_address_line1: string | null;
  physical_address_line2: string | null;
  physical_city: string | null;
  physical_state: string | null;
  physical_zip: string | null;
  phone_number: string | null;
  tax_rate: number | null;
  proposal_terms_template_key?: string | null;
  proposal_terms_template_content?: string | null;
};

export type UpdateCompanyBrandingInput = {
  website: string | null;
  review_url: string | null;
  logo_storage_key: string | null;
};

export type CompanyContext = {
  company: CompanySummary;
  member: CompanyMemberRecord | null;
};

export type UserOrganization = {
  companyId: string;
  companyName: string;
  role: string;
};
