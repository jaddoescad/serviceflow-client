import { apiClient } from "@/services/api";
import { toCommunicationTemplateSnapshot } from "./utils";
import type {
  CommunicationTemplateKey,
  CommunicationTemplateSnapshot,
  CommunicationTemplateRecord,
  UpsertCommunicationTemplateInput,
} from "./types";

export const getCommunicationTemplateByKey = async (
  companyId: string,
  key: CommunicationTemplateKey
): Promise<CommunicationTemplateSnapshot> => {
  const templates = await apiClient<CommunicationTemplateRecord[]>(
    "/communication-templates",
    {
      params: { company_id: companyId, template_key: key },
    }
  );

  const record = Array.isArray(templates) ? templates[0] ?? null : null;
  return toCommunicationTemplateSnapshot(key, record);
};

export const listCommunicationTemplates = async (
  companyId: string
): Promise<CommunicationTemplateRecord[]> => {
  return apiClient<CommunicationTemplateRecord[]>("/communication-templates", {
    params: { company_id: companyId },
  });
};

export const upsertTemplate = async (
  data: UpsertCommunicationTemplateInput
): Promise<CommunicationTemplateRecord> => {
  return apiClient<CommunicationTemplateRecord>("/communication-templates", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const resetTemplate = async (
  companyId: string,
  key: string
): Promise<void> => {
  return apiClient<void>(`/communication-templates/${companyId}/${key}/reset`, {
    method: "POST",
  });
};
