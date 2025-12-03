import type { DealPipelineId, DealStageId } from "@/features/deals";

export type DripChannel = "email" | "sms" | "both";
export type DripDelayType = "immediate" | "after";
export type DripDelayUnit = "minutes" | "hours" | "days" | "weeks" | "months";

export type DripStepRecord = {
  id: string;
  sequence_id: string;
  position: number;
  delay_type: DripDelayType;
  delay_value: number;
  delay_unit: DripDelayUnit;
  channel: DripChannel;
  email_subject: string | null;
  email_body: string | null;
  sms_body: string | null;
  created_at: string;
  updated_at: string;
};

export type DripSequenceRecord = {
  id: string;
  company_id: string;
  pipeline_id: DealPipelineId;
  stage_id: DealStageId;
  name: string;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
  steps: DripStepRecord[];
};

export type UpsertDripSequenceInput = {
  id?: string | null;
  company_id: string;
  pipeline_id: DealPipelineId;
  stage_id: DealStageId;
  name: string;
  is_enabled: boolean;
};

export type CreateDripStepInput = {
  sequence_id: string;
  position: number;
  delay_type: DripDelayType;
  delay_value: number;
  delay_unit: DripDelayUnit;
  channel: DripChannel;
  email_subject: string | null;
  email_body: string | null;
  sms_body: string | null;
};

export type UpdateDripStepInput = {
  id: string;
  delay_type: DripDelayType;
  delay_value: number;
  delay_unit: DripDelayUnit;
  channel: DripChannel;
  email_subject: string | null;
  email_body: string | null;
  sms_body: string | null;
};

export type ReorderDripStepsInput = {
  sequence_id: string;
  order: Array<{ id: string; position: number }>;
};

export type ScheduleDripsPayload = {
  dealId: string;
  stageId: DealStageId;
  trigger: "deal_created" | "stage_changed" | "manual_toggle" | "manual_cancel";
  enableDrips: boolean;
  cancelExistingJobs?: boolean;
};

export type ScheduleDripsResult = {
  scheduledCount: number;
  cancelledCount: number;
  sequenceId: string | null;
  resumedExistingJobs?: boolean;
  warning?: string;
};
