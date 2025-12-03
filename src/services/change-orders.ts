import { apiClient } from "@/services/api";
import type { ChangeOrderRecord } from "@/types/change-orders";

type CreateChangeOrderPayload = {
  company_id: string;
  deal_id: string;
  quote_id: string;
  invoice_id?: string | null;
  change_order_number: string;
  items: Array<{
    name: string;
    description?: string | null;
    quantity?: number;
    unit_price?: number;
    unitPrice?: number;
    position?: number;
  }>;
};

export const listChangeOrders = async (dealId: string) => {
  return apiClient<ChangeOrderRecord[]>("/change-orders", {
    params: { dealId },
  });
};

export const createChangeOrder = async (payload: CreateChangeOrderPayload) => {
  return apiClient<ChangeOrderRecord>("/change-orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const acceptChangeOrder = async (
  changeOrderId: string,
  payload: { invoice_id?: string | null; signer_name?: string; signer_email?: string; signature_text?: string }
) => {
  return apiClient<ChangeOrderRecord>(`/change-orders/${changeOrderId}/accept`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
};

export const deleteChangeOrder = async (changeOrderId: string) => {
  return apiClient<{ success: boolean; message: string }>(`/change-orders/${changeOrderId}`, {
    method: "DELETE",
  });
};
