import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dripKeys } from "./query-keys";
import {
  listDripSequencesForPipeline,
  fetchSequence,
  upsertSequence,
  createStep,
  updateStep,
  deleteStep,
  reorderSteps,
} from "./api";
import type {
  UpsertDripSequenceInput,
  CreateDripStepInput,
  UpdateDripStepInput,
  ReorderDripStepsInput,
} from "./types";

export function useDripSequences(companyId: string | undefined, pipelineId: string) {
  return useQuery({
    queryKey: dripKeys.list(companyId!, pipelineId),
    queryFn: () => listDripSequencesForPipeline(companyId!, pipelineId),
    enabled: !!companyId && !!pipelineId,
  });
}

export function useDripSequenceByStage(
  companyId: string | undefined,
  pipelineId: string,
  stageId: string
) {
  return useQuery({
    queryKey: dripKeys.byStage(companyId!, pipelineId, stageId),
    queryFn: () => fetchSequence(companyId!, pipelineId, stageId),
    enabled: !!companyId && !!pipelineId && !!stageId,
  });
}

export function useUpsertDripSequence(companyId: string, pipelineId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpsertDripSequenceInput) => upsertSequence(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: dripKeys.list(companyId, pipelineId),
      });
    },
  });
}

export function useCreateDripStep(companyId: string, pipelineId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDripStepInput) => createStep(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: dripKeys.list(companyId, pipelineId),
      });
    },
  });
}

export function useUpdateDripStep(companyId: string, pipelineId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateDripStepInput) => updateStep(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: dripKeys.list(companyId, pipelineId),
      });
    },
  });
}

export function useDeleteDripStep(companyId: string, pipelineId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (stepId: string) => deleteStep(stepId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: dripKeys.list(companyId, pipelineId),
      });
    },
  });
}

export function useReorderDripSteps(companyId: string, pipelineId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReorderDripStepsInput) => reorderSteps(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: dripKeys.list(companyId, pipelineId),
      });
    },
  });
}
