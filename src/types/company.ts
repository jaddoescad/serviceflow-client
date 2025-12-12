import type { CompanyMemberRecord } from "@/types/company-members";

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
  twilio_account_sid: string | null;
  twilio_auth_token: string | null;
  twilio_phone_number: string | null;
  twilio_enabled: boolean | null;
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
  | "twilio_account_sid"
  | "twilio_auth_token"
  | "twilio_phone_number"
  | "twilio_enabled"
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
