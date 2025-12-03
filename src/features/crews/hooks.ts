import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { crewKeys } from "./query-keys";
import { listCrewsForCompany, createCrew, updateCrew, deleteCrew } from "./api";
import type { CreateCrewInput, UpdateCrewInput } from "./types";

export function useCrews(companyId: string | undefined) {
  return useQuery({
    queryKey: crewKeys.list(companyId!),
    queryFn: () => listCrewsForCompany(companyId!),
    enabled: !!companyId,
  });
}

export function useCreateCrew(companyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCrewInput & { userId?: string }) =>
      createCrew({ companyId: data.companyId, name: data.name, userId: data.userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crewKeys.list(companyId) });
    },
  });
}

export function useUpdateCrew(companyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ crewId, data }: { crewId: string; data: UpdateCrewInput }) =>
      updateCrew(crewId, companyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crewKeys.list(companyId) });
    },
  });
}

export function useDeleteCrew(companyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (crewId: string) => deleteCrew(crewId, companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crewKeys.list(companyId) });
    },
  });
}
