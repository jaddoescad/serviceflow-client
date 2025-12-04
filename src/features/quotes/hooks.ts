import { useMutation, useQueryClient } from "@tanstack/react-query";
import { quoteKeys } from "./query-keys";
import { dealKeys } from "@/features/deals";
import { queryKeys } from "@/hooks/query-keys";
import { dashboardKeys } from "@/hooks/useDashboardData";
import { saveQuote, createQuote, deleteQuote, sendQuoteDelivery } from "./api";
import { useToast } from "@/components/ui/toast";
import { getErrorMessage } from "@/lib/errors";
import type { SaveQuotePayload, QuoteDeliveryRequestPayload } from "./types";

export function useSaveQuote(dealId: string) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (data: SaveQuotePayload) => saveQuote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.list(dealId) });
      queryClient.invalidateQueries({ queryKey: dealKeys.detail(dealId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dealDetail.detail(dealId) });
      // Invalidate all proposalData queries for this deal (with any quoteId)
      queryClient.invalidateQueries({
        queryKey: ['dealDetail', 'proposalData', dealId],
        exact: false
      });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      toast.success('Quote saved', 'The quote has been saved successfully.');
    },
    onError: (error) => {
      toast.error('Failed to save quote', getErrorMessage(error));
    },
  });
}

export function useCreateQuote(dealId: string) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (data: SaveQuotePayload) => createQuote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.list(dealId) });
      queryClient.invalidateQueries({ queryKey: dealKeys.detail(dealId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dealDetail.detail(dealId) });
      // Invalidate all proposalData queries for this deal (with any quoteId)
      queryClient.invalidateQueries({
        queryKey: ['dealDetail', 'proposalData', dealId],
        exact: false
      });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
    onError: (error) => {
      toast.error('Failed to create quote', getErrorMessage(error));
    },
  });
}

export function useDeleteQuote(dealId: string) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (quoteId: string) => deleteQuote(dealId, quoteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.list(dealId) });
      queryClient.invalidateQueries({ queryKey: dealKeys.detail(dealId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dealDetail.detail(dealId) });
      // Invalidate all proposalData queries for this deal (with any quoteId)
      queryClient.invalidateQueries({
        queryKey: ['dealDetail', 'proposalData', dealId],
        exact: false
      });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      toast.success('Quote deleted', 'The quote has been deleted.');
    },
    onError: (error) => {
      toast.error('Failed to delete quote', getErrorMessage(error));
    },
  });
}

export function useSendQuoteDelivery(dealId: string, quoteId: string) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (payload: QuoteDeliveryRequestPayload) =>
      sendQuoteDelivery(dealId, quoteId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.detail(quoteId) });
      queryClient.invalidateQueries({ queryKey: dealKeys.detail(dealId) });
      toast.success('Quote sent', 'The quote has been sent to the customer.');
    },
    onError: (error) => {
      toast.error('Failed to send quote', getErrorMessage(error));
    },
  });
}

export function useInvalidateQuotes() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () =>
      queryClient.invalidateQueries({ queryKey: quoteKeys.all }),
    invalidateByDeal: (dealId: string) =>
      queryClient.invalidateQueries({ queryKey: quoteKeys.list(dealId) }),
    invalidateDetail: (quoteId: string) =>
      queryClient.invalidateQueries({ queryKey: quoteKeys.detail(quoteId) }),
  };
}
