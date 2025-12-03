import { useQuery, useQueryClient } from "@tanstack/react-query";
import { proposalKeys } from "./query-keys";
import { fetchProposalListData } from "./api";

export function useProposalsList(
  companyId: string | undefined,
  options?: { salespersonName?: string | null }
) {
  return useQuery({
    queryKey: [...proposalKeys.list(companyId!), options],
    queryFn: () => fetchProposalListData(companyId!, options),
    enabled: !!companyId,
  });
}

export function useInvalidateProposals() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () =>
      queryClient.invalidateQueries({ queryKey: proposalKeys.all }),
    invalidateByCompany: (companyId: string) =>
      queryClient.invalidateQueries({ queryKey: proposalKeys.list(companyId) }),
  };
}
