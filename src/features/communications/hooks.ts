import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { communicationKeys } from "./query-keys";
import {
  getCommunicationTemplateByKey,
  listCommunicationTemplates,
  upsertTemplate,
  resetTemplate,
} from "./api";
import type {
  CommunicationTemplateKey,
  UpsertCommunicationTemplateInput,
} from "./types";

export function useCommunicationTemplates(companyId: string | undefined) {
  return useQuery({
    queryKey: communicationKeys.templateList(companyId!),
    queryFn: () => listCommunicationTemplates(companyId!),
    enabled: !!companyId,
  });
}

export function useCommunicationTemplate(
  companyId: string | undefined,
  key: CommunicationTemplateKey
) {
  return useQuery({
    queryKey: communicationKeys.templateByKey(companyId!, key),
    queryFn: () => getCommunicationTemplateByKey(companyId!, key),
    enabled: !!companyId,
  });
}

export function useUpsertCommunicationTemplate(companyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpsertCommunicationTemplateInput) => upsertTemplate(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: communicationKeys.templateByKey(companyId, variables.template_key),
      });
      queryClient.invalidateQueries({
        queryKey: communicationKeys.templateList(companyId),
      });
    },
  });
}

export function useResetCommunicationTemplate(companyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (key: CommunicationTemplateKey) => resetTemplate(companyId, key),
    onSuccess: (_, key) => {
      queryClient.invalidateQueries({
        queryKey: communicationKeys.templateByKey(companyId, key),
      });
      queryClient.invalidateQueries({
        queryKey: communicationKeys.templateList(companyId),
      });
    },
  });
}
