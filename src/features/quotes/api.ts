import { apiClient } from "@/services/api";
import type {
  QuoteRecord,
  SaveQuotePayload,
  QuoteDeliveryRequestPayload,
  QuoteDeliveryResponsePayload,
} from "./types";

export const saveQuote = async (data: SaveQuotePayload): Promise<QuoteRecord> => {
  const quote = data.quote;

  if (quote?.id) {
    return apiClient<QuoteRecord>(`/quotes/${quote.id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  return apiClient<QuoteRecord>("/quotes", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const createQuote = async (data: SaveQuotePayload): Promise<QuoteRecord> => {
  return apiClient<QuoteRecord>("/quotes", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const deleteQuote = async (dealId: string, quoteId: string): Promise<void> => {
  return apiClient<void>(`/deals/${dealId}/quotes/${quoteId}`, {
    method: "DELETE",
  });
};

export const sendQuoteDelivery = async (
  dealId: string,
  quoteId: string,
  payload: QuoteDeliveryRequestPayload
): Promise<QuoteDeliveryResponsePayload> => {
  return apiClient<QuoteDeliveryResponsePayload>(
    `/deals/${dealId}/quotes/${quoteId}/send`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
};

export type AcceptQuoteWithoutSignatureResponse = {
  status: string;
  signature: string;
  signedAt: string;
  invoiceId: string | null;
};

export const acceptQuoteWithoutSignature = async (
  quoteId: string
): Promise<AcceptQuoteWithoutSignatureResponse> => {
  return apiClient<AcceptQuoteWithoutSignatureResponse>(
    `/quotes/${quoteId}/accept-without-signature`,
    {
      method: "POST",
    }
  );
};
