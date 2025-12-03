import type { CompanyEmailSettingsRecord } from "@/types/company-email-settings";

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
