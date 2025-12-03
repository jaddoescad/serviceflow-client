import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { invoiceKeys } from "./query-keys";
import {
  getInvoiceById,
  getInvoiceByQuoteId,
  listInvoicesByDeal,
  listInvoicePayments,
  listInvoicePaymentRequests,
  createInvoicePaymentRequest,
} from "./api";
import type { CreatePaymentRequestPayload } from "./types";

export function useInvoice(invoiceId: string | undefined) {
  return useQuery({
    queryKey: invoiceKeys.detail(invoiceId!),
    queryFn: () => getInvoiceById(invoiceId!),
    enabled: !!invoiceId,
  });
}

export function useInvoiceByQuote(quoteId: string | undefined) {
  return useQuery({
    queryKey: invoiceKeys.byQuote(quoteId!),
    queryFn: () => getInvoiceByQuoteId(quoteId!),
    enabled: !!quoteId,
  });
}

export function useInvoicesByDeal(dealId: string | undefined) {
  return useQuery({
    queryKey: invoiceKeys.byDeal(dealId!),
    queryFn: () => listInvoicesByDeal(dealId!),
    enabled: !!dealId,
  });
}

export function useInvoicePayments(invoiceId: string | undefined) {
  return useQuery({
    queryKey: invoiceKeys.payments(invoiceId!),
    queryFn: () => listInvoicePayments(invoiceId!),
    enabled: !!invoiceId,
  });
}

export function useInvoicePaymentRequests(invoiceId: string | undefined) {
  return useQuery({
    queryKey: invoiceKeys.paymentRequests(invoiceId!),
    queryFn: () => listInvoicePaymentRequests(invoiceId!),
    enabled: !!invoiceId,
  });
}

export function useCreateInvoicePaymentRequest(dealId: string, invoiceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePaymentRequestPayload) =>
      createInvoicePaymentRequest(dealId, invoiceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: invoiceKeys.paymentRequests(invoiceId),
      });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(invoiceId) });
    },
  });
}

export function useInvalidateInvoices() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () =>
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all }),
    invalidateByDeal: (dealId: string) =>
      queryClient.invalidateQueries({ queryKey: invoiceKeys.byDeal(dealId) }),
    invalidateDetail: (invoiceId: string) =>
      queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(invoiceId) }),
  };
}
