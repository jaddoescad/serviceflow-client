import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pipelineKeys } from "./query-keys";
import {
  getPipelinesWithStages,
  getPipelineStages,
  getPipelineStageKeys,
  updatePipeline,
  createStage,
  updateStage,
  deleteStage,
  reorderStages,
} from "./api";
import { useToast } from "@/components/ui/toast";
import { getErrorMessage } from "@/lib/errors";
import type {
  CreateStageInput,
  UpdateStageInput,
  UpdatePipelineInput,
} from "./types";

/**
 * Hook to fetch all pipelines with their stages
 */
export function usePipelines(companyId: string | undefined) {
  return useQuery({
    queryKey: pipelineKeys.list(companyId!),
    queryFn: () => getPipelinesWithStages(companyId!),
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutes - pipelines rarely change
  });
}

/**
 * Hook to fetch pipeline stages, optionally filtered by pipeline
 */
export function usePipelineStages(
  companyId: string | undefined,
  pipelineKey?: string
) {
  return useQuery({
    queryKey: pipelineKeys.stagesList(companyId!, pipelineKey),
    queryFn: () => getPipelineStages(companyId!, pipelineKey),
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch stage keys for a specific pipeline
 */
export function usePipelineStageKeys(
  companyId: string | undefined,
  pipelineKey: string
) {
  return useQuery({
    queryKey: pipelineKeys.stageKeys(companyId!, pipelineKey),
    queryFn: () => getPipelineStageKeys(companyId!, pipelineKey),
    enabled: !!companyId && !!pipelineKey,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to update a pipeline
 */
export function useUpdatePipeline(companyId: string) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({
      pipelineId,
      data,
    }: {
      pipelineId: string;
      data: UpdatePipelineInput;
    }) => updatePipeline(pipelineId, companyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pipelineKeys.list(companyId) });
      toast.success("Pipeline updated", "The pipeline has been updated.");
    },
    onError: (error) => {
      toast.error("Failed to update pipeline", getErrorMessage(error));
    },
  });
}

/**
 * Hook to create a new stage
 */
export function useCreateStage(companyId: string) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (data: CreateStageInput) => createStage(companyId, data),
    onSuccess: () => {
      // Invalidate all pipeline-related queries for this company
      queryClient.invalidateQueries({ queryKey: pipelineKeys.list(companyId) });
      queryClient.invalidateQueries({
        queryKey: pipelineKeys.stages(),
        predicate: (query) =>
          Array.isArray(query.queryKey) && query.queryKey.includes(companyId),
      });
      toast.success("Stage created", "The new stage has been added.");
    },
    onError: (error) => {
      toast.error("Failed to create stage", getErrorMessage(error));
    },
  });
}

/**
 * Hook to update a stage
 */
export function useUpdateStage(companyId: string) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({
      stageId,
      data,
    }: {
      stageId: string;
      data: UpdateStageInput;
    }) => updateStage(stageId, companyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pipelineKeys.list(companyId) });
      queryClient.invalidateQueries({
        queryKey: pipelineKeys.stages(),
        predicate: (query) =>
          Array.isArray(query.queryKey) && query.queryKey.includes(companyId),
      });
      toast.success("Stage updated", "The stage has been updated.");
    },
    onError: (error) => {
      toast.error("Failed to update stage", getErrorMessage(error));
    },
  });
}

/**
 * Hook to delete a stage
 */
export function useDeleteStage(companyId: string) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (stageId: string) => deleteStage(stageId, companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pipelineKeys.list(companyId) });
      queryClient.invalidateQueries({
        queryKey: pipelineKeys.stages(),
        predicate: (query) =>
          Array.isArray(query.queryKey) && query.queryKey.includes(companyId),
      });
      toast.success("Stage deleted", "The stage has been removed.");
    },
    onError: (error) => {
      toast.error("Failed to delete stage", getErrorMessage(error));
    },
  });
}

/**
 * Hook to reorder stages
 */
export function useReorderStages(companyId: string) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({
      pipelineId,
      stageOrder,
    }: {
      pipelineId: string;
      stageOrder: string[];
    }) => reorderStages(pipelineId, companyId, stageOrder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pipelineKeys.list(companyId) });
      queryClient.invalidateQueries({
        queryKey: pipelineKeys.stages(),
        predicate: (query) =>
          Array.isArray(query.queryKey) && query.queryKey.includes(companyId),
      });
      toast.success("Stages reordered", "The stage order has been updated.");
    },
    onError: (error) => {
      toast.error("Failed to reorder stages", getErrorMessage(error));
    },
  });
}
