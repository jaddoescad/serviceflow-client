import type { DealStageOption } from "@/features/deals";

export const DRIP_TEMPLATE_HINTS = [
  "{first_name}",
  "{last_name}",
  "{client_name}",
  "{company_name}",
  "{company_phone}",
  "{company_website}",
  "{deal_stage}",
  "{deal_name}",
  "{deal_address}",
  "{sales_person}",
  "{appointment_date}",
  "{appointment_time}",
  "{appointment_location}",
  "{review_button}",
] as const;

export const formatDefaultSequenceName = (stage: DealStageOption | null): string => {
  if (!stage) {
    return "Stage Drip";
  }
  return `${stage.label} Drip`;
};
