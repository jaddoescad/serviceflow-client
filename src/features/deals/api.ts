import { apiClient } from "@/services/api";
import type { DealRecord, DealListParams, PaginatedDealListResponse } from "./types";

export const fetchDeals = async (companyId: string): Promise<DealRecord[]> => {
  return apiClient<DealRecord[]>("/deals", {
    params: { company_id: companyId }
  });
};

/**
 * Fetch deals with server-side pagination
 */
export const fetchDealsPaginated = async (
  companyId: string,
  params: DealListParams = {}
): Promise<PaginatedDealListResponse> => {
  const queryParams: Record<string, string> = {
    company_id: companyId,
  };

  if (params.page) queryParams.page = String(params.page);
  if (params.pageSize) queryParams.pageSize = String(params.pageSize);
  if (params.search) queryParams.search = params.search;
  if (params.pipeline) queryParams.pipeline = params.pipeline;
  if (params.stage) queryParams.stage = params.stage;
  if (params.salesperson) queryParams.salesperson = params.salesperson;
  if (params.lead_source) queryParams.lead_source = params.lead_source;

  return apiClient<PaginatedDealListResponse>("/deals/paginated", {
    params: queryParams,
  });
};

export const getDealById = async (dealId: string): Promise<DealRecord> => {
  return apiClient<DealRecord>(`/deals/${dealId}`);
};

export const getLatestDealForContact = async (
  companyId: string,
  contactId: string
): Promise<DealRecord | null> => {
  const deals = await apiClient<DealRecord[]>("/deals", {
    params: {
      company_id: companyId,
      contact_id: contactId,
      order: "created_at.desc",
      limit: 1,
    },
  });

  return deals[0] ?? null;
};

export const createDeal = async (data: any) => {
  return apiClient<any>("/deals", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateDealDetails = async (id: string, data: any) => {
  return apiClient<any>(`/deals/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

export const updateDealStage = async (id: string, stage: string) => {
  return apiClient<any>(`/deals/${id}/stage`, {
    method: "PATCH",
    body: JSON.stringify({ stage }),
  });
};

export const scheduleDeal = async (dealId: string, data: any) => {
  return apiClient<any>(`/deals/${dealId}/schedule`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateDealAppointment = async (dealId: string, data: any) => {
  const appointmentId = data.appointmentId;
  return apiClient<any>(`/deals/${dealId}/appointments/${appointmentId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

export const deleteAppointment = async (dealId: string, appointmentId: string) => {
  return apiClient<void>(`/deals/${dealId}/appointments/${appointmentId}`, {
    method: "DELETE",
  });
};

export const deleteDeal = async (dealId: string) => {
  return apiClient<{ success: boolean; message: string }>(`/deals/${dealId}`, {
    method: "DELETE",
  });
};

export const archiveDeal = async (dealId: string) => {
  return apiClient<DealRecord>(`/deals/${dealId}/archive`, {
    method: "POST",
  });
};

export const unarchiveDeal = async (dealId: string) => {
  return apiClient<DealRecord>(`/deals/${dealId}/unarchive`, {
    method: "POST",
  });
};
