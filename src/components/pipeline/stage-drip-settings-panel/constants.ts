import type { DealStageOption } from "@/features/deals";
import { DRIP_KEYWORDS } from "@/lib/template-keywords";

/**
 * @deprecated Use DRIP_KEYWORDS from @/lib/template-keywords instead
 */
export const DRIP_TEMPLATE_HINTS = DRIP_KEYWORDS;

export const formatDefaultSequenceName = (stage: DealStageOption | null): string => {
  if (!stage) {
    return "Stage Drip";
  }
  return `${stage.label} Drip`;
};
