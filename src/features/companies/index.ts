// Types
export type {
  CompanyMemberRole,
  CompanyMemberRecord,
  CreateCompanyMemberInput,
  InviteCompanyMemberPayload,
  EmailProvider,
  EmailProviderStatus,
  CompanyEmailSettingsRecord,
  UpsertCompanyEmailSettingsInput,
  UpdateCompanyEmailProviderInput,
  CompanyEmailCredentialRecord,
  CompanyBrandingDetails,
  QuoteCompanyBranding,
  BrandingApiResponse,
  CompanyRecord,
  CompanySummary,
  CompanyBrandingRecord,
  CompanySettingsRecord,
  CreateCompanyInput,
  CreateOrganizationInput,
  UpdateCompanySettingsInput,
  UpdateCompanyBrandingInput,
  CompanyContext,
  UserOrganization,
} from "./types";

// Constants
export {
  COMPANY_SUMMARY_FIELDS,
  COMPANY_SHARE_FIELDS,
  COMPANY_SETTINGS_FIELDS,
  LEGACY_COMPANY_SETTINGS_FIELDS,
  COMPANY_SETTINGS_DEFAULTS,
  COMPANY_MEMBER_FIELDS,
  COMPANY_MEMBER_ROLE_OPTIONS,
  COMPANY_EMAIL_SETTINGS_FIELDS,
  COMPANY_EMAIL_SETTINGS_DEFAULTS,
  COMPANY_BRANDING_BUCKET,
  COMPANY_BRANDING_FIELDS,
  COMPANY_LOGO_SIGNED_URL_TTL_SECONDS,
  type CompanyMemberRoleOption,
} from "./constants";

// Query Keys
export { companyKeys } from "./query-keys";

// API
export {
  getUser,
  switchCurrentOrganization,
  upsertCurrentOrganization,
  getCompany,
  getCompanyForUser,
  getUserAuthContext,
  updateCompanySettings,
  createOrganization,
  updateCompanyPhoneNumber,
  listCompanyMembers,
  listUserOrganizations,
  createCompanyEmailSettingsRepository,
  type UserProfileRecord,
  type UserAuthContext,
} from "./api";

// Hooks
export {
  useCompany,
  useCompanyForUser,
  useCompanyMembers,
  useUpdateCompanySettings,
  useCreateOrganization,
  useUpdateCompanyPhoneNumber,
  useCompanySettingsDetail,
  useCompanyEmailSettings,
  useInvalidateCompanySettings,
} from "./hooks";
