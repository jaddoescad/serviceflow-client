import { apiClient } from "@/services/api";
import type { CrewRecord, UpdateCrewInput } from "./types";

export const listCrewsForCompany = async (
  companyId: string
): Promise<CrewRecord[]> => {
  return apiClient<CrewRecord[]>("/crews", {
    params: { company_id: companyId },
  });
};

export const createCrew = async (data: {
  companyId: string;
  name: string;
  userId?: string;
}): Promise<CrewRecord> => {
  return apiClient<CrewRecord>("/crews", {
    method: "POST",
    body: JSON.stringify({
      company_id: data.companyId,
      name: data.name,
      created_by_user_id: data.userId,
    }),
  });
};

export const updateCrew = async (
  id: string,
  companyId: string,
  data: UpdateCrewInput
): Promise<CrewRecord> => {
  return apiClient<CrewRecord>(`/crews/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ name: data.name }),
  });
};

export const deleteCrew = async (id: string, companyId: string): Promise<void> => {
  return apiClient<void>(`/crews/${id}`, {
    method: "DELETE",
  });
};
