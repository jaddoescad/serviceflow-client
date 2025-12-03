export const pipelineKeys = {
  all: ["pipelines"] as const,
  lists: () => [...pipelineKeys.all, "list"] as const,
  list: (companyId: string) => [...pipelineKeys.lists(), companyId] as const,
  stages: () => [...pipelineKeys.all, "stages"] as const,
  stagesList: (companyId: string, pipelineKey?: string) =>
    [...pipelineKeys.stages(), companyId, pipelineKey ?? "all"] as const,
  stageKeys: (companyId: string, pipelineKey: string) =>
    [...pipelineKeys.all, "stageKeys", companyId, pipelineKey] as const,
};
