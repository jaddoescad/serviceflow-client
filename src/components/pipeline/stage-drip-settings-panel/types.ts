import type { DealPipelineId, DealStageOption } from "@/features/deals";
import type { DripSequenceRecord, DripStepRecord } from "@/features/drips";

export type StageDripSettingsPanelProps = {
  open: boolean;
  companyId: string;
  pipelineId: DealPipelineId;
  stage: DealStageOption | null;
  sequence: DripSequenceRecord | null;
  onClose: () => void;
  onSequenceChange: (next: DripSequenceRecord) => void;
  onSequenceCleared: (stageId: string) => void;
  variant?: "drawer" | "inline";
  className?: string;
};

export type StepDraft = {
  isSaving: boolean;
  error: string | null;
};

export type StepDrafts = Record<string, StepDraft>;

export type DripStepCardProps = {
  step: DripStepRecord;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  variant: "drawer" | "inline";
  isExpanded: boolean;
  draft: StepDraft | undefined;
  onSave: (step: DripStepRecord) => Promise<void>;
  onDelete: (stepId: string) => Promise<void>;
  onMove: (stepId: string, direction: "up" | "down") => Promise<void>;
  onToggleExpand: (stepId: string) => void;
  onStepChange: (stepId: string, updates: Partial<DripStepRecord>) => void;
};

export type DripStepFormProps = {
  step: DripStepRecord;
  isSaving: boolean;
  error: string | null;
  onStepChange: (updates: Partial<DripStepRecord>) => void;
  onSave: () => void;
};

export type EnableDripsToggleProps = {
  enabled: boolean;
  isSaving: boolean;
  stageLabel: string;
  onToggle: (value: boolean) => void;
};

export type PanelHeaderProps = {
  pipelineId: DealPipelineId;
  stageLabel: string;
  onClose: () => void;
  padding: string;
};

export type StepControlsProps = {
  isFirst: boolean;
  isLast: boolean;
  isSaving: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
};
