import { apiClient } from "@/services/api";
import type {
  InvoiceRecord,
  InvoicePaymentRecord,
  InvoicePaymentRequestRecord,
  CreatePaymentRequestPayload,
  CreateLineItemPayload,
  UpdateLineItemPayload,
  LineItemMutationResponse,
  DeleteLineItemResponse,
} from "./types";

export const getInvoiceById = async (invoiceId: string): Promise<InvoiceRecord> => {
  return apiClient<InvoiceRecord>(`/invoices/${invoiceId}`);
};

export const getInvoiceByQuoteId = async (
  quoteId: string
): Promise<InvoiceRecord | null> => {
  const invoices = await apiClient<InvoiceRecord[]>("/invoices", {
    params: { quote_id: quoteId },
  });

  return Array.isArray(invoices) && invoices.length > 0 ? invoices[0] : null;
};

export const listInvoicesByDeal = async (dealId: string): Promise<InvoiceRecord[]> => {
  return apiClient<InvoiceRecord[]>("/invoices", {
    params: { deal_id: dealId },
  });
};

export const listInvoicePayments = async (
  invoiceId: string
): Promise<InvoicePaymentRecord[]> => {
  return apiClient<InvoicePaymentRecord[]>(`/invoices/${invoiceId}/payments`);
};

export const listInvoicePaymentRequests = async (
  invoiceId: string
): Promise<InvoicePaymentRequestRecord[]> => {
  return apiClient<InvoicePaymentRequestRecord[]>(
    `/invoices/${invoiceId}/payment-requests`
  );
};

export const createInvoicePaymentRequest = async (
  dealId: string,
  invoiceId: string,
  data: CreatePaymentRequestPayload
): Promise<InvoicePaymentRequestRecord> => {
  return apiClient<InvoicePaymentRequestRecord>(
    `/deals/${dealId}/invoices/${invoiceId}/payment-requests`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
};

// Invoice Delivery API
export const createInvoiceDeliveryRepository = () => {
  return {
    sendInvoice: async (data: {
      dealId: string;
      invoiceId: string;
      method: string;
      text?: { to: string; body: string };
      email?: { to: string; subject: string; body: string };
    }) => {
      return apiClient<Record<string, unknown>>(
        `/deals/${data.dealId}/invoices/${data.invoiceId}/send`,
        {
          method: "POST",
          body: JSON.stringify({
            method: data.method,
            text: data.text,
            email: data.email,
          }),
        }
      );
    },
  };
};

// Line Item CRUD API
export const addInvoiceLineItem = async (
  dealId: string,
  invoiceId: string,
  data: CreateLineItemPayload
): Promise<LineItemMutationResponse> => {
  return apiClient<LineItemMutationResponse>(
    `/deals/${dealId}/invoices/${invoiceId}/line-items`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
};

export const updateInvoiceLineItem = async (
  dealId: string,
  invoiceId: string,
  itemId: string,
  data: UpdateLineItemPayload
): Promise<LineItemMutationResponse> => {
  return apiClient<LineItemMutationResponse>(
    `/deals/${dealId}/invoices/${invoiceId}/line-items/${itemId}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  );
};

export const deleteInvoiceLineItem = async (
  dealId: string,
  invoiceId: string,
  itemId: string
): Promise<DeleteLineItemResponse> => {
  return apiClient<DeleteLineItemResponse>(
    `/deals/${dealId}/invoices/${invoiceId}/line-items/${itemId}`,
    {
      method: "DELETE",
    }
  );
};
