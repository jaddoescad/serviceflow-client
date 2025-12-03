import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { getCompany, createCompanyEmailSettingsRepository } from '@/features/companies';

export function useCompanySettingsDetail(companyId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.companySettings.detail(companyId!),
    queryFn: () => getCompany(companyId!),
    enabled: !!companyId,
  });
}

export function useCompanyEmailSettings(companyId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.companySettings.emailSettings(companyId!),
    queryFn: async () => {
      const emailSettingsRepository = createCompanyEmailSettingsRepository(null);
      return emailSettingsRepository.getSettings(companyId!);
    },
    enabled: !!companyId,
  });
}

export function useInvalidateCompanySettings() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: (companyId: string) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companySettings.detail(companyId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.detail(companyId) });
    },
    invalidateEmailSettings: (companyId: string) =>
      queryClient.invalidateQueries({ queryKey: queryKeys.companySettings.emailSettings(companyId) }),
  };
}
