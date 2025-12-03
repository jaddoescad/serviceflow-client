import { apiClient } from "@/services/api";

export const createDealNotesRepository = () => {
  return {
    createNote: async (data: { companyId: string; dealId: string; authorUserId?: string; body: string }) => {
      const payload = {
        company_id: data.companyId,
        deal_id: data.dealId,
        body: data.body,
        author_user_id: data.authorUserId,
      };

      return apiClient<any>('/deal-notes', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    }
  };
};
