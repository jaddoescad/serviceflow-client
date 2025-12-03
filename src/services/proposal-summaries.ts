import { apiClient } from "@/services/api";
import type { DealProposalSummary } from "@/types/pipeline";

export const fetchProposalSummaries = async (companyId: string): Promise<DealProposalSummary[]> => {
  return apiClient<DealProposalSummary[]>("/quotes/summary", {
    params: { company_id: companyId }
  });
};

