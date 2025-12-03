import { DripStepRecord } from "@/types/drips";

export const formatDripStepSummary = (step: DripStepRecord): string => {
  const delay = `${step.delay_value} ${step.delay_unit}`;
  const type = step.delay_type === "immediate" ? "Immediately" : `Wait ${delay}`;
  return `${type} • ${step.channel}`;
};
