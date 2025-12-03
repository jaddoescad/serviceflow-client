import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import type { DealRecord } from '@/features/deals';
import type { InvoiceRecord, InvoicePaymentRequest, InvoicePayment } from '@/types/invoices';
import type { CommunicationTemplateRecord } from '@/types/communication-templates';

export type InvoiceDetailData = {
  deal: DealRecord;
  invoice: InvoiceRecord;
  paymentRequests: InvoicePaymentRequest[];
  payments: InvoicePayment[];
  templates: {
    invoiceSend: CommunicationTemplateRecord | null;
    paymentRequest: CommunicationTemplateRecord | null;
    paymentReceipt: CommunicationTemplateRecord | null;
  };
};

export const invoiceDetailKeys = {
  all: ['invoiceDetail'] as const,
  detail: (dealId: string, invoiceId: string) =>
    [...invoiceDetailKeys.all, dealId, invoiceId] as const,
};

export function useInvoiceDetail(dealId: string | undefined, invoiceId: string | undefined, companyId: string | undefined) {
  return useQuery({
    queryKey: invoiceDetailKeys.detail(dealId!, invoiceId!),
    queryFn: () => apiClient<InvoiceDetailData>(`/deals/${dealId}/invoices/${invoiceId}/detail`, {
      params: { company_id: companyId },
    }),
    enabled: !!dealId && !!invoiceId && !!companyId,
  });
}
