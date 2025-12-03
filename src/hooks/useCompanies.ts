import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import {
  getCompany,
  getCompanyForUser,
  updateCompanySettings,
  createOrganization,
  updateCompanyPhoneNumber,
  listCompanyMembers,
} from '@/features/companies';

export function useCompany(companyId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.companies.detail(companyId!),
    queryFn: () => getCompany(companyId!),
    enabled: !!companyId,
  });
}

export function useCompanyForUser(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.companies.forUser(userId!),
    queryFn: () => getCompanyForUser(userId!),
    enabled: !!userId,
  });
}

export function useCompanyMembers(companyId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.companies.members(companyId!),
    queryFn: () => listCompanyMembers(companyId!),
    enabled: !!companyId,
  });
}

export function useUpdateCompanySettings(companyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => updateCompanySettings(companyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.detail(companyId) });
    },
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: any }) =>
      createOrganization(userId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.organizations(variables.userId) });
    },
  });
}

export function useUpdateCompanyPhoneNumber(companyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (phoneNumber: string | null) => updateCompanyPhoneNumber(companyId, phoneNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.detail(companyId) });
    },
  });
}
