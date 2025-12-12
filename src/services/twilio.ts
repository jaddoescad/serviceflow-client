import { apiClient } from "@/services/api";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { TwilioNumber, UpdateTwilioSettingsInput } from "@/types/twilio";

export interface TwilioTestResult {
  success: boolean;
  message?: string;
  error?: string;
}

export const fetchTwilioNumbers = async (
  supabase: SupabaseClient,
  companyId: string,
  accountSid?: string,
  authToken?: string
): Promise<TwilioNumber[]> => {
  if (accountSid && authToken) {
    return apiClient<TwilioNumber[]>("/integrations/twilio/numbers", {
      method: "POST",
      body: JSON.stringify({ accountSid, authToken }),
    });
  }

  return apiClient<TwilioNumber[]>(`/companies/${companyId}/twilio/numbers`);
};

export const updateTwilioSettings = async (
  supabase: SupabaseClient,
  companyId: string,
  settings: Partial<UpdateTwilioSettingsInput>
): Promise<UpdateTwilioSettingsInput> => {
  return apiClient<UpdateTwilioSettingsInput>(
    `/companies/${companyId}/twilio/settings`,
    {
      method: "PATCH",
      body: JSON.stringify(settings),
    }
  );
};

export const testTwilioConnection = async (
  supabase: SupabaseClient,
  companyId: string,
  accountSid?: string,
  authToken?: string
): Promise<TwilioTestResult> => {
  if (accountSid && authToken) {
    return apiClient<TwilioTestResult>("/integrations/twilio/test", {
      method: "POST",
      body: JSON.stringify({ accountSid, authToken }),
    });
  }

  return apiClient<TwilioTestResult>(`/companies/${companyId}/twilio/test`);
};

