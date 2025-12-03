import { apiClient } from "@/services/api";

/**
 * Work order send request data
 */
export interface WorkOrderSendRequest {
  dealId: string;
  quoteId?: string;
  method: 'email' | 'text' | 'both';
  email?: {
    to: string;
    cc?: string;
    subject: string;
    body: string;
  };
  text?: {
    to: string;
    body: string;
  };
}

export const createWorkOrderDeliveryRepository = () => {
  return {
    sendWorkOrder: async (data: WorkOrderSendRequest): Promise<void> => {
      return apiClient<void>(`/work-orders/send`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    }
  };
};
