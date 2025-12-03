import { apiClient } from "@/services/api";
import type {
  DripSequenceRecord,
  UpsertDripSequenceInput,
  CreateDripStepInput,
  UpdateDripStepInput,
  ReorderDripStepsInput,
} from "./types";

export const listDripSequencesForPipeline = async (
  companyId: string,
  pipeline: string
): Promise<DripSequenceRecord[]> => {
  return apiClient<DripSequenceRecord[]>("/drip-sequences", {
    params: {
      company_id: companyId,
      pipeline_id: pipeline,
    },
  });
};

export const fetchSequence = async (
  companyId: string,
  pipelineId: string,
  stageId: string
): Promise<DripSequenceRecord | null> => {
  const sequences = await apiClient<DripSequenceRecord[]>("/drip-sequences", {
    params: { company_id: companyId, pipeline_id: pipelineId },
  });
  return sequences.find((s) => s.stage_id === stageId) || null;
};

export const upsertSequence = async (
  data: UpsertDripSequenceInput
): Promise<DripSequenceRecord> => {
  if (data.id) {
    return apiClient<DripSequenceRecord>(`/drip-sequences/${data.id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  } else {
    return apiClient<DripSequenceRecord>("/drip-sequences", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
};

export const createStep = async (
  data: CreateDripStepInput
): Promise<DripSequenceRecord> => {
  return apiClient<DripSequenceRecord>("/drip-steps", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateStep = async (
  data: UpdateDripStepInput
): Promise<DripSequenceRecord> => {
  const { id, ...rest } = data;
  return apiClient<DripSequenceRecord>(`/drip-steps/${id}`, {
    method: "PATCH",
    body: JSON.stringify(rest),
  });
};

export const deleteStep = async (id: string): Promise<DripSequenceRecord | null> => {
  return apiClient<DripSequenceRecord | null>(`/drip-steps/${id}`, {
    method: "DELETE",
  });
};

export const reorderSteps = async (data: ReorderDripStepsInput): Promise<DripSequenceRecord> => {
  return apiClient<DripSequenceRecord>(`/drip-sequences/${data.sequence_id}/reorder`, {
    method: "POST",
    body: JSON.stringify({ order: data.order }),
  });
};
