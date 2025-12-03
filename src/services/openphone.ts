import { apiClient } from "@/services/api";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { OpenPhoneNumber, UpdateOpenPhoneSettingsInput } from "@/types/openphone";

/**
 * OpenPhone test result type
 */
export interface OpenPhoneTestResult {
    success: boolean;
    message?: string;
    error?: string;
}

export const fetchOpenPhoneNumbers = async (
    supabase: SupabaseClient,
    companyId: string,
    apiKey?: string
): Promise<OpenPhoneNumber[]> => {
    if (apiKey) {
        // Use apiKey to fetch numbers (e.g. testing connection)
        // Requires backend endpoint that accepts apiKey
        return apiClient<OpenPhoneNumber[]>('/integrations/openphone/numbers', {
            method: 'POST',
            body: JSON.stringify({ apiKey })
        });
    }
    return apiClient<OpenPhoneNumber[]>(`/companies/${companyId}/openphone/numbers`);
};

export const updateOpenPhoneSettings = async (
    supabase: SupabaseClient,
    companyId: string,
    settings: Partial<UpdateOpenPhoneSettingsInput>
): Promise<UpdateOpenPhoneSettingsInput> => {
    return apiClient<UpdateOpenPhoneSettingsInput>(`/companies/${companyId}/openphone/settings`, {
        method: 'PATCH',
        body: JSON.stringify(settings)
    });
};

export const testOpenPhoneConnection = async (
    supabase: SupabaseClient,
    companyId: string,
    apiKey?: string
): Promise<OpenPhoneTestResult> => {
    if (apiKey) {
         return apiClient<OpenPhoneTestResult>('/integrations/openphone/test', {
            method: 'POST',
            body: JSON.stringify({ apiKey })
        });
    }
    return apiClient<OpenPhoneTestResult>(`/companies/${companyId}/openphone/test`);
};
