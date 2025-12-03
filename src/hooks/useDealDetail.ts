import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { apiClient } from '@/services/api';

export function useDealDetail(dealId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.dealDetail.detail(dealId!),
    queryFn: () => apiClient<any>(`/deals/${encodeURIComponent(dealId!)}/details`),
    enabled: !!dealId,
  });
}

export function useDealProposalData(dealId: string | undefined, quoteId?: string | null) {
  return useQuery({
    queryKey: queryKeys.dealDetail.proposalData(dealId!, quoteId),
    queryFn: () =>
      apiClient<any>(`/deals/${encodeURIComponent(dealId!)}/proposal-data`, {
        params: quoteId ? { quoteId } : undefined,
      }),
    enabled: !!dealId,
  });
}

export function useInvalidateDealDetail() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: queryKeys.dealDetail.all }),
    invalidateDeal: (dealId: string) =>
      queryClient.invalidateQueries({ queryKey: queryKeys.dealDetail.detail(dealId) }),
  };
}
