import { apiClient } from "@/services/api";
import type {
  CompanyRecord,
  CompanyMemberRecord,
  UserOrganization,
  CreateOrganizationInput,
  UpdateCompanySettingsInput,
} from "./types";

// User API (needed for company operations)
export type UserProfileRecord = {
  id: string;
  current_company_id: string | null;
  created_at?: string;
  updated_at?: string;
};

export const getUser = async (userId: string): Promise<UserProfileRecord> => {
  return apiClient<UserProfileRecord>(`/users/${userId}`);
};

export const switchCurrentOrganization = async (
  userId: string,
  companyId: string
): Promise<UserProfileRecord> => {
  return apiClient<UserProfileRecord>(`/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify({ current_company_id: companyId }),
  });
};

export const upsertCurrentOrganization = async (
  userId: string,
  companyId: string
): Promise<UserProfileRecord> => {
  return apiClient<UserProfileRecord>("/users", {
    method: "POST",
    body: JSON.stringify({ id: userId, current_company_id: companyId }),
  });
};

// Company API
export const getCompany = async (id: string): Promise<CompanyRecord> => {
  return apiClient<CompanyRecord>(`/companies/${id}`);
};

// Type for the consolidated auth context response
export type UserAuthContext = {
  user: UserProfileRecord | null;
  organizations: UserOrganization[];
  company: CompanyRecord | null;
  member: CompanyMemberRecord | null;
  companyMembers: CompanyMemberRecord[];
};

// Consolidated endpoint - fetches all auth context in a single RPC call
export const getUserAuthContext = async (userId: string): Promise<UserAuthContext> => {
  try {
    return await apiClient<UserAuthContext>(`/users/${userId}/auth-context`);
  } catch (error) {
    console.error("getUserAuthContext failed", error);
    return {
      user: null,
      organizations: [],
      company: null,
      member: null,
      companyMembers: [],
    };
  }
};

// Legacy function - now uses consolidated endpoint
export const getCompanyForUser = async (
  userId: string
): Promise<{ company: CompanyRecord | null; member: CompanyMemberRecord | null }> => {
  const context = await getUserAuthContext(userId);
  return { company: context.company, member: context.member };
};

export const updateCompanySettings = async (
  companyId: string,
  data: UpdateCompanySettingsInput | Record<string, unknown>
): Promise<CompanyRecord> => {
  return apiClient<CompanyRecord>(`/companies/${companyId}/settings`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

export const createOrganization = async (
  userId: string,
  data: CreateOrganizationInput
): Promise<CompanyRecord> => {
  return apiClient<CompanyRecord>("/companies", {
    method: "POST",
    body: JSON.stringify({ ...data, user_id: userId }),
  });
};

export const updateCompanyPhoneNumber = async (
  companyId: string,
  phoneNumber: string | null
): Promise<string | null> => {
  const result = await updateCompanySettings(companyId, { phone_number: phoneNumber });
  return result.phone_number;
};

// Company Members API
export const listCompanyMembers = async (
  companyId: string
): Promise<CompanyMemberRecord[]> => {
  try {
    return await apiClient<CompanyMemberRecord[]>("/company-members", {
      params: { company_id: companyId },
    });
  } catch (error) {
    console.error("Failed to fetch company members", error);
    return [];
  }
};

export const listUserOrganizations = async (
  userId: string
): Promise<UserOrganization[]> => {
  try {
    const records = await apiClient<
      Array<{
        company_id?: string;
        company?: { id?: string; name?: string };
        role?: string;
      }>
    >(`/company-members/user/${userId}`);

    return records
      .map((record) => ({
        companyId: record.company_id ?? record.company?.id ?? "",
        companyName: record.company?.name ?? "Unknown organization",
        role: record.role ?? "member",
      }))
      .filter((org): org is UserOrganization => Boolean(org.companyId));
  } catch (error) {
    console.error("Failed to fetch user organizations", error);
    return [];
  }
};

// Company Email Settings API
export const createCompanyEmailSettingsRepository = () => {
  return {
    getSettings: async (companyId: string) => {
      return apiClient<Record<string, unknown>>(`/companies/${companyId}/email-settings`);
    },
    updateSettings: async (companyId: string, settings: Record<string, unknown>) => {
      return apiClient<Record<string, unknown>>(`/companies/${companyId}/email-settings`, {
        method: "PATCH",
        body: JSON.stringify(settings),
      });
    },
  };
};
