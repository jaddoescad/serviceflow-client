import { apiClient } from '@/services/api';
import type { DealSourceRecord } from '@/features/deals';

export const listDealSources = async (companyId: string): Promise<DealSourceRecord[]> => {
  return apiClient<DealSourceRecord[]>(`/companies/${companyId}/deal-sources`);
};

export const createDealSource = async (
  companyId: string,
  name: string,
  createdByUserId?: string | null
): Promise<DealSourceRecord> => {
  return apiClient<DealSourceRecord>(`/companies/${companyId}/deal-sources`, {
    method: 'POST',
    body: JSON.stringify({ name, created_by_user_id: createdByUserId ?? null }),
  });
};
