import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import type { DealRecord } from '@/features/deals';
import type { DripSequenceRecord } from '@/features/drips';
import type { DealProposalSummary } from '@/types/pipeline';

export type DashboardData = {
  deals: DealRecord[];
  dripSequences: DripSequenceRecord[];
  proposalSummaries: DealProposalSummary[];
};

export const dashboardKeys = {
  all: ['dashboard'] as const,
  data: (companyId: string, pipelineId: string) =>
    [...dashboardKeys.all, companyId, pipelineId] as const,
};

export function useDashboardData(companyId: string | undefined, pipelineId: string = 'sales') {
  return useQuery({
    queryKey: dashboardKeys.data(companyId!, pipelineId),
    queryFn: () => apiClient<DashboardData>(`/dashboard/${companyId}`, {
      params: { pipeline_id: pipelineId },
    }),
    enabled: !!companyId,
  });
}
