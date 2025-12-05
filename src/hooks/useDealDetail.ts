import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { apiClient } from '@/services/api';
import { sanitizeUuid } from '@/lib/form-utils';

export function useDealDetail(dealId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.dealDetail.detail(dealId!),
    queryFn: () => apiClient<any>(`/deals/${encodeURIComponent(dealId!)}/details`),
    enabled: !!dealId,
  });
}

export function useDealProposalData(dealId: string | undefined, quoteId?: string | null) {
  // Sanitize quoteId to handle edge cases like string "undefined" from URL params
  const validQuoteId = sanitizeUuid(quoteId);

  return useQuery({
    queryKey: queryKeys.dealDetail.proposalData(dealId!, validQuoteId),
    queryFn: () =>
      apiClient<any>(`/deals/${encodeURIComponent(dealId!)}/proposal-data`, {
        params: validQuoteId ? { quoteId: validQuoteId } : undefined,
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
