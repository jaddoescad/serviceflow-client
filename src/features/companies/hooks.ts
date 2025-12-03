import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { companyKeys } from "./query-keys";
import {
  getCompany,
  getCompanyForUser,
  updateCompanySettings,
  createOrganization,
  updateCompanyPhoneNumber,
  listCompanyMembers,
  createCompanyEmailSettingsRepository,
} from "./api";
import type { UpdateCompanySettingsInput, CreateOrganizationInput } from "./types";

export function useCompany(companyId: string | undefined) {
  return useQuery({
    queryKey: companyKeys.detail(companyId!),
    queryFn: () => getCompany(companyId!),
    enabled: !!companyId,
  });
}

export function useCompanyForUser(userId: string | undefined) {
  return useQuery({
    queryKey: companyKeys.forUser(userId!),
    queryFn: () => getCompanyForUser(userId!),
    enabled: !!userId,
  });
}

export function useCompanyMembers(companyId: string | undefined) {
  return useQuery({
    queryKey: companyKeys.members(companyId!),
    queryFn: () => listCompanyMembers(companyId!),
    enabled: !!companyId,
  });
}

export function useUpdateCompanySettings(companyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateCompanySettingsInput) =>
      updateCompanySettings(companyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.detail(companyId) });
    },
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: CreateOrganizationInput }) =>
      createOrganization(userId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["users", "organizations", variables.userId],
      });
    },
  });
}

export function useUpdateCompanyPhoneNumber(companyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (phoneNumber: string | null) =>
      updateCompanyPhoneNumber(companyId, phoneNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.detail(companyId) });
    },
  });
}

export function useCompanySettingsDetail(companyId: string | undefined) {
  return useQuery({
    queryKey: companyKeys.settings.detail(companyId!),
    queryFn: () => getCompany(companyId!),
    enabled: !!companyId,
  });
}

export function useCompanyEmailSettings(companyId: string | undefined) {
  return useQuery({
    queryKey: companyKeys.settings.emailSettings(companyId!),
    queryFn: async () => {
      const emailSettingsRepository = createCompanyEmailSettingsRepository();
      return emailSettingsRepository.getSettings(companyId!);
    },
    enabled: !!companyId,
  });
}

export function useInvalidateCompanySettings() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: (companyId: string) => {
      queryClient.invalidateQueries({
        queryKey: companyKeys.settings.detail(companyId),
      });
      queryClient.invalidateQueries({ queryKey: companyKeys.detail(companyId) });
    },
    invalidateEmailSettings: (companyId: string) =>
      queryClient.invalidateQueries({
        queryKey: companyKeys.settings.emailSettings(companyId),
      }),
  };
}
