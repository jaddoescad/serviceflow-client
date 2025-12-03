export const dripKeys = {
  all: ["drips"] as const,
  lists: () => [...dripKeys.all, "list"] as const,
  list: (companyId: string, pipelineId: string) =>
    [...dripKeys.lists(), companyId, pipelineId] as const,
  byStage: (companyId: string, pipelineId: string, stageId: string) =>
    [...dripKeys.all, "byStage", companyId, pipelineId, stageId] as const,
  details: () => [...dripKeys.all, "detail"] as const,
  detail: (sequenceId: string) => [...dripKeys.details(), sequenceId] as const,
};
