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
