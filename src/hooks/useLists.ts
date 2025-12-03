import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { fetchSalesListData } from '@/services/sales-list';
import { fetchInvoiceListData } from '@/services/invoices-list';
import { fetchProposalListData } from '@/services/proposals-list';
import { fetchJobsListData } from '@/services/jobs-list';
import { fetchProposalSummaries } from '@/services/proposal-summaries';
import { fetchInvoiceSummaries } from '@/services/invoice-summaries';

export function useSalesList(companyId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.salesList.list(companyId!),
    queryFn: () => fetchSalesListData(companyId!),
    enabled: !!companyId,
  });
}

export function useInvoiceList(companyId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.invoiceList.list(companyId!),
    queryFn: () => fetchInvoiceListData(companyId!),
    enabled: !!companyId,
  });
}

export function useProposalList(companyId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.proposalList.list(companyId!),
    queryFn: () => fetchProposalListData(companyId!),
    enabled: !!companyId,
  });
}

export function useJobsList(companyId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.jobsList.list(companyId!),
    queryFn: () => fetchJobsListData(companyId!),
    enabled: !!companyId,
  });
}

export function useProposalSummaries(companyId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.proposalSummaries.list(companyId!),
    queryFn: () => fetchProposalSummaries(companyId!),
    enabled: !!companyId,
  });
}

export function useInvoiceSummaries(companyId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.invoiceSummaries.list(companyId!),
    queryFn: () => fetchInvoiceSummaries(companyId!),
    enabled: !!companyId,
  });
}
