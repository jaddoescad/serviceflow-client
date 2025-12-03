import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import {
  getUser,
  switchCurrentOrganization,
  upsertCurrentOrganization,
  listUserOrganizations,
} from '@/features/companies';

export function useUser(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.users.detail(userId!),
    queryFn: () => getUser(userId!),
    enabled: !!userId,
  });
}

export function useUserOrganizations(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.users.organizations(userId!),
    queryFn: () => listUserOrganizations(userId!),
    enabled: !!userId,
  });
}

export function useSwitchOrganization(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (companyId: string) => switchCurrentOrganization(userId, companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.forUser(userId) });
    },
  });
}

export function useUpsertCurrentOrganization(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (companyId: string) => upsertCurrentOrganization(userId, companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.forUser(userId) });
    },
  });
}
