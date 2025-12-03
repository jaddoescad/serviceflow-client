import { apiClient } from "@/services/api";
import type {
  PipelineWithStages,
  PipelineStageWithPipeline,
  PipelineStageRecord,
  PipelineRecord,
  CreateStageInput,
  UpdateStageInput,
  UpdatePipelineInput,
} from "./types";

/**
 * Get all pipelines with their stages for a company
 */
export const getPipelinesWithStages = async (
  companyId: string
): Promise<PipelineWithStages[]> => {
  return apiClient<PipelineWithStages[]>("/pipelines", {
    params: { company_id: companyId },
  });
};

/**
 * Get pipeline stages, optionally filtered by pipeline key
 */
export const getPipelineStages = async (
  companyId: string,
  pipelineKey?: string
): Promise<PipelineStageWithPipeline[]> => {
  return apiClient<PipelineStageWithPipeline[]>("/pipelines/stages", {
    params: {
      company_id: companyId,
      ...(pipelineKey && { pipeline: pipelineKey }),
    },
  });
};

/**
 * Get stage keys for a pipeline (for filtering deals)
 */
export const getPipelineStageKeys = async (
  companyId: string,
  pipelineKey: string
): Promise<string[]> => {
  return apiClient<string[]>("/pipelines/stages/keys", {
    params: { company_id: companyId, pipeline: pipelineKey },
  });
};

/**
 * Update a pipeline's details
 */
export const updatePipeline = async (
  pipelineId: string,
  companyId: string,
  data: UpdatePipelineInput
): Promise<PipelineRecord> => {
  return apiClient<PipelineRecord>(`/pipelines/${pipelineId}`, {
    method: "PATCH",
    params: { company_id: companyId },
    body: JSON.stringify(data),
  });
};

/**
 * Create a new custom stage
 */
export const createStage = async (
  companyId: string,
  data: CreateStageInput
): Promise<PipelineStageRecord> => {
  return apiClient<PipelineStageRecord>("/pipelines/stages", {
    method: "POST",
    params: { company_id: companyId },
    body: JSON.stringify(data),
  });
};

/**
 * Update a stage
 */
export const updateStage = async (
  stageId: string,
  companyId: string,
  data: UpdateStageInput
): Promise<PipelineStageRecord> => {
  return apiClient<PipelineStageRecord>(`/pipelines/stages/${stageId}`, {
    method: "PATCH",
    params: { company_id: companyId },
    body: JSON.stringify(data),
  });
};

/**
 * Delete a custom stage
 */
export const deleteStage = async (
  stageId: string,
  companyId: string
): Promise<void> => {
  return apiClient<void>(`/pipelines/stages/${stageId}`, {
    method: "DELETE",
    params: { company_id: companyId },
  });
};

/**
 * Reorder stages within a pipeline
 */
export const reorderStages = async (
  pipelineId: string,
  companyId: string,
  stageOrder: string[]
): Promise<PipelineStageRecord[]> => {
  return apiClient<PipelineStageRecord[]>(
    `/pipelines/${pipelineId}/stages/reorder`,
    {
      method: "POST",
      params: { company_id: companyId },
      body: JSON.stringify({ stage_order: stageOrder }),
    }
  );
};
