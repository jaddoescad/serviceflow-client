import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { listDealSources, createDealSource } from '@/services/deal-sources';

export function useDealSources(companyId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.dealSources.list(companyId!),
    queryFn: () => listDealSources(companyId!),
    enabled: !!companyId,
  });
}

export function useCreateDealSource(companyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, createdByUserId }: { name: string; createdByUserId?: string | null }) =>
      createDealSource(companyId, name, createdByUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dealSources.list(companyId) });
    },
  });
}
