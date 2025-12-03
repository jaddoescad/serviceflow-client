import type { DripChannel, DripDelayType, DripDelayUnit } from "@/types/drips";

export const DRIP_STEP_FIELDS = [
  "id",
  "sequence_id",
  "position",
  "delay_type",
  "delay_value",
  "delay_unit",
  "channel",
  "email_subject",
  "email_body",
  "sms_body",
  "created_at",
  "updated_at",
].join(", ");

export const DRIP_SEQUENCE_FIELDS = [
  "id",
  "company_id",
  "pipeline_id",
  "stage_id",
  "name",
  "is_enabled",
  "created_at",
  "updated_at",
  `steps:deal_stage_drip_steps(${DRIP_STEP_FIELDS})`,
].join(", ");

export const DRIP_DELAY_UNIT_LABELS: Record<DripDelayUnit, string> = {
  minutes: "Minutes",
  hours: "Hours",
  days: "Days",
  weeks: "Weeks",
  months: "Months",
};

export const DRIP_CHANNEL_LABELS: Record<DripChannel, string> = {
  email: "Email",
  sms: "Text message",
  both: "Email & text",
};

export const DRIP_DELAY_TYPE_LABELS: Record<DripDelayType, string> = {
  immediate: "Immediately",
  after: "After",
};

export const DRIP_DELAY_UNIT_ORDER: DripDelayUnit[] = [
  "minutes",
  "hours",
  "days",
  "weeks",
  "months",
];

export const DRIP_CHANNEL_ORDER: DripChannel[] = ["email", "sms", "both"];
