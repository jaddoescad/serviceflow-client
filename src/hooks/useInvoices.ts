import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import {
  getInvoiceById,
  getInvoiceByQuoteId,
  listInvoicesByDeal,
  listInvoicePayments,
  listInvoicePaymentRequests,
  createInvoicePaymentRequest,
} from '@/features/invoices';
import { useToast } from '@/components/ui/toast';
import { getErrorMessage } from '@/lib/errors';

export function useInvoice(invoiceId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.invoices.detail(invoiceId!),
    queryFn: () => getInvoiceById(invoiceId!),
    enabled: !!invoiceId,
  });
}

export function useInvoiceByQuote(quoteId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.invoices.byQuote(quoteId!),
    queryFn: () => getInvoiceByQuoteId(quoteId!),
    enabled: !!quoteId,
  });
}

export function useInvoicesByDeal(dealId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.invoices.byDeal(dealId!),
    queryFn: () => listInvoicesByDeal(dealId!),
    enabled: !!dealId,
  });
}

export function useInvoicePayments(invoiceId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.invoices.payments(invoiceId!),
    queryFn: () => listInvoicePayments(invoiceId!),
    enabled: !!invoiceId,
  });
}

export function useInvoicePaymentRequests(invoiceId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.invoices.paymentRequests(invoiceId!),
    queryFn: () => listInvoicePaymentRequests(invoiceId!),
    enabled: !!invoiceId,
  });
}

export function useCreateInvoicePaymentRequest(dealId: string, invoiceId: string) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (data: { amount: number; note?: string | null }) =>
      createInvoicePaymentRequest(dealId, invoiceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.paymentRequests(invoiceId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.detail(invoiceId) });
      toast.success('Payment request created', 'The payment request has been created.');
    },
    onError: (error) => {
      toast.error('Failed to create payment request', getErrorMessage(error));
    },
  });
}

export function useInvalidateInvoices() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all }),
    invalidateByDeal: (dealId: string) =>
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.byDeal(dealId) }),
    invalidateDetail: (invoiceId: string) =>
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.detail(invoiceId) }),
  };
}
