import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dealKeys } from './query-keys';
import { dashboardKeys } from '@/hooks/useDashboardData';
import { queryKeys } from '@/hooks/query-keys';
import {
  fetchDeals,
  fetchDealsPaginated,
  getDealById,
  createDeal,
  updateDealDetails,
  updateDealStage,
  scheduleDeal,
  updateDealAppointment,
  deleteAppointment,
  deleteDeal,
  archiveDeal,
  unarchiveDeal,
} from './api';
import { useToast } from '@/components/ui/toast';
import type { CreateDealInput, UpdateDealDetailsInput, ScheduleDealInput, UpdateDealAppointmentInput, DealRecord, DealListParams } from './types';

export function useDeals(companyId: string) {
  return useQuery({
    queryKey: dealKeys.list(companyId),
    queryFn: () => fetchDeals(companyId),
    enabled: !!companyId,
  });
}

export function useDealsList(companyId: string | undefined) {
  return useQuery({
    queryKey: dealKeys.list(companyId!),
    queryFn: () => fetchDeals(companyId!),
    enabled: !!companyId,
  });
}

/**
 * Hook for fetching deals with server-side pagination
 */
export function useDealsPaginated(
  companyId: string | undefined,
  params: DealListParams = {}
) {
  return useQuery({
    queryKey: [...dealKeys.list(companyId!), 'paginated', params],
    queryFn: () => fetchDealsPaginated(companyId!, params),
    enabled: !!companyId,
    placeholderData: (previousData) => previousData, // Keep previous data while fetching
  });
}

export function useDeal(dealId: string | undefined) {
  return useQuery({
    queryKey: dealKeys.detail(dealId!),
    queryFn: () => getDealById(dealId!),
    enabled: !!dealId,
  });
}

export function useCreateDeal(companyId: string) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (data: CreateDealInput) => createDeal(data),
    meta: { errorTitle: 'Failed to create deal' },
    onSuccess: () => {
      // Targeted invalidation: only the specific company's deal list
      queryClient.invalidateQueries({
        queryKey: dealKeys.list(companyId),
        exact: true
      });
      // Invalidate only the specific dashboard for this company
      queryClient.invalidateQueries({
        queryKey: dashboardKeys.data(companyId, 'sales'),
        exact: true
      });
      queryClient.invalidateQueries({
        queryKey: dashboardKeys.data(companyId, 'jobs'),
        exact: true
      });
      toast.success('Deal created', 'The deal has been created successfully.');
    },
  });
}

export function useUpdateDealDetails(dealId: string, companyId?: string) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (data: UpdateDealDetailsInput) => updateDealDetails(dealId, data),
    meta: { errorTitle: 'Failed to update deal' },
    onSuccess: (updatedDeal) => {
      // Direct cache update for the deal detail - no refetch needed
      queryClient.setQueryData(dealKeys.detail(dealId), updatedDeal);

      // Only invalidate the specific company's list if we know the companyId
      if (companyId) {
        queryClient.invalidateQueries({
          queryKey: dealKeys.list(companyId),
          exact: true
        });
        // Targeted dashboard invalidation
        queryClient.invalidateQueries({
          queryKey: dashboardKeys.data(companyId, 'sales'),
          exact: true
        });
        queryClient.invalidateQueries({
          queryKey: dashboardKeys.data(companyId, 'jobs'),
          exact: true
        });
      } else {
        // Fallback: invalidate all deal lists (less optimal)
        queryClient.invalidateQueries({ queryKey: dealKeys.lists() });
      }
      toast.success('Deal updated', 'The deal has been updated successfully.');
    },
  });
}

export function useUpdateDealStage(dealId: string, companyId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (stage: string) => updateDealStage(dealId, stage),
    meta: { errorTitle: 'Failed to update stage' },
    onSuccess: (updatedDeal) => {
      // Direct cache update for deal detail
      queryClient.setQueryData(dealKeys.detail(dealId), updatedDeal);

      if (companyId) {
        // Targeted invalidation for specific company
        queryClient.invalidateQueries({
          queryKey: dealKeys.list(companyId),
          exact: true
        });
        queryClient.invalidateQueries({
          queryKey: dashboardKeys.data(companyId, 'sales'),
          exact: true
        });
        queryClient.invalidateQueries({
          queryKey: dashboardKeys.data(companyId, 'jobs'),
          exact: true
        });
      } else {
        queryClient.invalidateQueries({ queryKey: dealKeys.lists() });
      }
    },
  });
}

export function useScheduleDeal(dealId: string, companyId?: string) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (data: ScheduleDealInput) => scheduleDeal(dealId, data),
    meta: { errorTitle: 'Failed to schedule appointment' },
    onSuccess: (updatedDeal) => {
      // Direct cache update
      queryClient.setQueryData(dealKeys.detail(dealId), updatedDeal);

      if (companyId) {
        queryClient.invalidateQueries({
          queryKey: dealKeys.list(companyId),
          exact: true
        });
      } else {
        queryClient.invalidateQueries({ queryKey: dealKeys.lists() });
      }
      toast.success('Appointment scheduled', 'The appointment has been scheduled successfully.');
    },
  });
}

export function useUpdateDealAppointment(dealId: string) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (data: UpdateDealAppointmentInput) => updateDealAppointment(dealId, data),
    meta: { errorTitle: 'Failed to update appointment' },
    onSuccess: (updatedDeal) => {
      // Direct cache update - most efficient, no network request
      queryClient.setQueryData(dealKeys.detail(dealId), updatedDeal);
      toast.success('Appointment updated', 'The appointment has been updated successfully.');
    },
  });
}

export function useDeleteAppointment(dealId: string) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (appointmentId: string) => deleteAppointment(dealId, appointmentId),
    meta: { errorTitle: 'Failed to delete appointment' },
    onSuccess: (updatedDeal) => {
      // Direct cache update
      queryClient.setQueryData(dealKeys.detail(dealId), updatedDeal);
      toast.success('Appointment deleted', 'The appointment has been deleted.');
    },
  });
}

/**
 * Utility hook for targeted deal cache invalidation.
 * Use this instead of broad invalidateQueries calls.
 */
export function useDealInvalidation() {
  const queryClient = useQueryClient();

  return {
    /** Invalidate a specific deal's detail cache */
    invalidateDeal: (dealId: string) =>
      queryClient.invalidateQueries({ queryKey: dealKeys.detail(dealId), exact: true }),

    /** Invalidate a specific company's deal list */
    invalidateCompanyDeals: (companyId: string) =>
      queryClient.invalidateQueries({ queryKey: dealKeys.list(companyId), exact: true }),

    /** Update deal in cache directly without refetching */
    updateDealInCache: (dealId: string, updater: (old: DealRecord | undefined) => DealRecord | undefined) =>
      queryClient.setQueryData(dealKeys.detail(dealId), updater),

    /** Invalidate dashboard for a specific company and pipeline */
    invalidateDashboard: (companyId: string, pipelineId: 'sales' | 'jobs' = 'sales') =>
      queryClient.invalidateQueries({ queryKey: dashboardKeys.data(companyId, pipelineId), exact: true }),
  };
}

export function useDeleteDeal(companyId?: string) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (dealId: string) => deleteDeal(dealId),
    meta: { errorTitle: 'Failed to delete deal' },
    onSuccess: (_data, dealId) => {
      // Remove deal from cache
      queryClient.removeQueries({ queryKey: dealKeys.detail(dealId) });

      if (companyId) {
        // Invalidate deal lists
        queryClient.invalidateQueries({
          queryKey: dealKeys.list(companyId),
        });
        // Invalidate sales list
        queryClient.invalidateQueries({
          queryKey: queryKeys.salesList.list(companyId),
        });
        // Invalidate dashboards
        queryClient.invalidateQueries({
          queryKey: dashboardKeys.data(companyId, 'sales'),
          exact: true,
        });
        queryClient.invalidateQueries({
          queryKey: dashboardKeys.data(companyId, 'jobs'),
          exact: true,
        });
      } else {
        queryClient.invalidateQueries({ queryKey: dealKeys.lists() });
        queryClient.invalidateQueries({ queryKey: queryKeys.salesList.all });
      }
      toast.success('Deal deleted', 'The deal has been permanently deleted.');
    },
  });
}

export function useArchiveDeal(companyId?: string) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (dealId: string) => archiveDeal(dealId),
    meta: { errorTitle: 'Failed to archive deal' },
    onSuccess: (_data, dealId) => {
      // Remove deal from cache (it won't show in lists anymore)
      queryClient.removeQueries({ queryKey: dealKeys.detail(dealId) });

      if (companyId) {
        // Invalidate deal lists
        queryClient.invalidateQueries({
          queryKey: dealKeys.list(companyId),
        });
        // Invalidate sales list
        queryClient.invalidateQueries({
          queryKey: queryKeys.salesList.list(companyId),
        });
        // Invalidate dashboards
        queryClient.invalidateQueries({
          queryKey: dashboardKeys.data(companyId, 'sales'),
          exact: true,
        });
        queryClient.invalidateQueries({
          queryKey: dashboardKeys.data(companyId, 'jobs'),
          exact: true,
        });
      } else {
        queryClient.invalidateQueries({ queryKey: dealKeys.lists() });
        queryClient.invalidateQueries({ queryKey: queryKeys.salesList.all });
      }
      toast.success('Deal archived', 'The deal has been archived and removed from the pipeline.');
    },
  });
}

export function useUnarchiveDeal(companyId?: string) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (dealId: string) => unarchiveDeal(dealId),
    meta: { errorTitle: 'Failed to restore deal' },
    onSuccess: (data, dealId) => {
      // Update deal in cache with new data
      queryClient.setQueryData(dealKeys.detail(dealId), data);

      if (companyId) {
        // Invalidate deal lists
        queryClient.invalidateQueries({
          queryKey: dealKeys.list(companyId),
        });
        // Invalidate sales list
        queryClient.invalidateQueries({
          queryKey: queryKeys.salesList.list(companyId),
        });
        // Invalidate dashboards
        queryClient.invalidateQueries({
          queryKey: dashboardKeys.data(companyId, 'sales'),
          exact: true,
        });
        queryClient.invalidateQueries({
          queryKey: dashboardKeys.data(companyId, 'jobs'),
          exact: true,
        });
      } else {
        queryClient.invalidateQueries({ queryKey: dealKeys.lists() });
        queryClient.invalidateQueries({ queryKey: queryKeys.salesList.all });
      }
      toast.success('Deal restored', 'The deal has been restored to the pipeline.');
    },
  });
}
