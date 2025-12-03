import { apiClient } from "@/services/api";
import type { DealInvoiceSummary } from "@/types/pipeline";

export const fetchInvoiceSummaries = async (companyId: string): Promise<DealInvoiceSummary[]> => {
  return apiClient<DealInvoiceSummary[]>("/invoices/summary", {
    params: { company_id: companyId }
  });
};
