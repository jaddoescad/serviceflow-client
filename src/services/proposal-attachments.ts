import { apiClient } from "@/services/api";

export const createProposalAttachmentsRepository = () => {
  return {
    uploadAttachment: async (data: { 
      companyId: string; 
      dealId: string; 
      quoteId: string; 
      file: File; 
      thumbnail: Blob | null; 
      thumbnailContentType: string | null 
    }) => {
      const formData = new FormData();
      formData.append('file', data.file);
      if (data.thumbnail) {
        formData.append('thumbnail', data.thumbnail);
      }
      formData.append('company_id', data.companyId);
      formData.append('quote_id', data.quoteId);
      formData.append('deal_id', data.dealId);
      
      // Assuming an endpoint for upload that accepts FormData
      // Note: apiClient needs adjustment for FormData if not already handling it, 
      // but typical fetch handles it if body is FormData.
      // My apiClient might force Content-Type: application/json which is bad for FormData.
      // I should check apiClient implementation.
      
      // Hack: Bypass apiClient for FormData or update apiClient. 
      // I'll use apiClient but I need to make sure it doesn't force content-type.
      
      // Checking apiClient source:
      // const headers = { 'Content-Type': 'application/json', ...init.headers };
      
      // It forces application/json. I need to override it.
      // Fetch automatically sets boundary for FormData if Content-Type is NOT set.
      
      // I'll implement a custom fetch here or update apiClient.
      // Updating apiClient is better but risky if I break others.
      // I'll just use fetch directly for this one, or cast to any to override headers.
      
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE_URL}/proposal-attachments`, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header, let browser set it with boundary
      });

      if (!response.ok) {
        let message = 'Failed to upload attachment';
        try {
          const result = (await response.json()) as { error?: string };
          if (result?.error) {
            message = result.error;
          }
        } catch {
          // ignore parse failure
        }
        throw new Error(message);
      }

      return response.json();
    },
    deleteAttachment: async (data: { attachmentId: string }) => {
      return apiClient<void>(`/proposal-attachments/${data.attachmentId}`, {
        method: 'DELETE'
      });
    }
  };
};
