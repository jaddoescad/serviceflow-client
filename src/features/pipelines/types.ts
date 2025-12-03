export type PipelineRecord = {
  id: string;
  company_id: string;
  pipeline_key: string;
  name: string;
  description: string | null;
  position: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

export type PipelineStageRecord = {
  id: string;
  company_id: string;
  pipeline_id: string;
  stage_key: string;
  name: string;
  description: string | null;
  position: number;
  color: string | null;
  is_default: boolean;
  is_win_stage: boolean;
  is_loss_stage: boolean;
  created_at: string;
  updated_at: string;
};

export type PipelineStageWithPipeline = PipelineStageRecord & {
  pipeline_key: string;
  pipeline_name: string;
};

export type PipelineWithStages = PipelineRecord & {
  stages: PipelineStageRecord[];
};

export type CreateStageInput = {
  pipeline_key: string;
  stage_key: string;
  name: string;
  description?: string | null;
  color?: string | null;
  is_win_stage?: boolean;
  is_loss_stage?: boolean;
};

export type UpdateStageInput = {
  name?: string;
  description?: string | null;
  color?: string | null;
  is_win_stage?: boolean;
  is_loss_stage?: boolean;
};

export type UpdatePipelineInput = {
  name?: string;
  description?: string | null;
};

// Stage color options for the UI
export const STAGE_COLOR_OPTIONS = [
  { value: 'sky', label: 'Sky Blue' },
  { value: 'indigo', label: 'Indigo' },
  { value: 'slate', label: 'Slate' },
  { value: 'emerald', label: 'Emerald' },
  { value: 'rose', label: 'Rose' },
  { value: 'lime', label: 'Lime' },
  { value: 'teal', label: 'Teal' },
  { value: 'blue', label: 'Blue' },
  { value: 'fuchsia', label: 'Fuchsia' },
  { value: 'amber', label: 'Amber' },
  { value: 'violet', label: 'Violet' },
  { value: 'cyan', label: 'Cyan' },
  { value: 'orange', label: 'Orange' },
  { value: 'pink', label: 'Pink' },
] as const;

export type StageColor = typeof STAGE_COLOR_OPTIONS[number]['value'];
