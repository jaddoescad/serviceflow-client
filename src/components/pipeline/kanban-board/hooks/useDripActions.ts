import { useCallback } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { DealRecord, DealStageId } from "@/features/deals";
import { updateDealStage, useDealInvalidation } from "@/features/deals";
import type { ScheduleDripsPayload, DripSequenceRecord } from "@/features/drips";
import { scheduleDealDrips as scheduleDealDripsService } from "@/services/functions";
import type { DealsByStage, StagePromptState } from "../types";

type UseDripActionsProps = {
  supabase: SupabaseClient;
  companyId: string;
  applyDealPatch: (dealId: string, patch: Partial<DealRecord>) => void;
  setColumns: React.Dispatch<React.SetStateAction<DealsByStage>>;
  setDripSequencesByStage: React.Dispatch<React.SetStateAction<Record<DealStageId, DripSequenceRecord>>>;
  setStagePromptState: React.Dispatch<React.SetStateAction<StagePromptState | null>>;
  setStagePromptError: React.Dispatch<React.SetStateAction<string | null>>;
  setIsSchedulingStagePrompt: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenDealMenuId: React.Dispatch<React.SetStateAction<string | null>>;
  setDripActionDealId: React.Dispatch<React.SetStateAction<string | null>>;
  setDragError: React.Dispatch<React.SetStateAction<string | null>>;
  stagePromptState: StagePromptState | null;
};

export function useDripActions({
  supabase,
  companyId,
  applyDealPatch,
  setColumns,
  setDripSequencesByStage,
  setStagePromptState,
  setStagePromptError,
  setIsSchedulingStagePrompt,
  setOpenDealMenuId,
  setDripActionDealId,
  setDragError,
  stagePromptState,
}: UseDripActionsProps) {
  const { invalidateDashboard, invalidateCompanyDeals } = useDealInvalidation();

  const scheduleDealDrips = useCallback(
    async (
      dealId: string,
      stageId: DealStageId,
      enableDrips: boolean,
      trigger: ScheduleDripsPayload["trigger"],
      cancelExistingJobs?: boolean
    ) => {
      try {
        await scheduleDealDripsService(supabase, {
          dealId,
          stageId,
          trigger,
          enableDrips,
          cancelExistingJobs,
        });
      } catch (error) {
        console.error("Failed to schedule drips", error);
        throw error;
      }
    },
    [supabase]
  );

  const handleStagePromptDecision = useCallback(
    async (enableDrips: boolean) => {
      if (!stagePromptState) {
        return;
      }

      const { deal, previousStage, nextStage, destinationIndex } = stagePromptState;

      setIsSchedulingStagePrompt(true);
      setStagePromptError(null);

      try {
        if (deal.stage !== nextStage) {
          await updateDealStage(deal.id, nextStage);

          // Invalidate React Query cache
          invalidateDashboard(companyId, "sales");
          invalidateDashboard(companyId, "jobs");
          invalidateCompanyDeals(companyId);
        }
      } catch (error) {
        console.error("Failed to update deal stage", error);
        setStagePromptError(
          error instanceof Error
            ? error.message
            : "We couldn't move this deal. Please try again."
        );
        setIsSchedulingStagePrompt(false);
        return;
      }

      const updatedDeal: DealRecord = {
        ...deal,
        stage: nextStage,
        disable_drips: !enableDrips,
        updated_at: new Date().toISOString(),
      };

      setColumns((previous) => {
        const sourceDeals = [...(previous[previousStage] ?? [])].filter((item) => item.id !== deal.id);
        const destinationDeals = [...(previous[nextStage] ?? [])];
        const insertIndex = Math.min(destinationIndex, destinationDeals.length);
        destinationDeals.splice(insertIndex, 0, updatedDeal);

        return {
          ...previous,
          [previousStage]: sourceDeals,
          [nextStage]: destinationDeals,
        };
      });

      applyDealPatch(deal.id, { stage: nextStage, disable_drips: !enableDrips });

      setStagePromptState((previous) =>
        previous ? { ...previous, deal: updatedDeal, destinationIndex } : previous
      );

      try {
        await scheduleDealDrips(deal.id, nextStage, enableDrips, "stage_changed");
      } catch (error) {
        console.error("Failed to update drip automation", error);
        setStagePromptError(
          error instanceof Error
            ? error.message
            : "We couldn't update the drip automation. Please try again."
        );
        setIsSchedulingStagePrompt(false);
        return;
      }

      setDripSequencesByStage((previous) => {
        const existing = previous[nextStage];

        if (existing) {
          return {
            ...previous,
            [nextStage]: {
              ...existing,
              is_enabled: enableDrips,
            },
          };
        }

        return previous;
      });

      setStagePromptState(null);
      setIsSchedulingStagePrompt(false);
    },
    [
      applyDealPatch,
      companyId,
      invalidateCompanyDeals,
      invalidateDashboard,
      scheduleDealDrips,
      setColumns,
      setDripSequencesByStage,
      setIsSchedulingStagePrompt,
      setStagePromptError,
      setStagePromptState,
      stagePromptState,
    ]
  );

  const handleStagePromptEnable = useCallback(() => {
    void handleStagePromptDecision(true);
  }, [handleStagePromptDecision]);

  const handleStagePromptDisable = useCallback(() => {
    void handleStagePromptDecision(false);
  }, [handleStagePromptDecision]);

  const handleStagePromptCancel = useCallback(() => {
    if (!stagePromptState) {
      return;
    }

    setStagePromptState(null);
    setStagePromptError(null);
    setIsSchedulingStagePrompt(false);
  }, [setIsSchedulingStagePrompt, setStagePromptError, setStagePromptState, stagePromptState]);

  const handleCancelDrips = useCallback(
    async (deal: DealRecord) => {
      setDripActionDealId(deal.id);
      try {
        await scheduleDealDrips(deal.id, deal.stage as DealStageId, false, "manual_cancel", true);
        applyDealPatch(deal.id, { disable_drips: true });
      } catch (error) {
        console.error("Failed to cancel drips", error);
        setDragError(
          error instanceof Error
            ? error.message
            : "We couldn't cancel the drip automation. Please try again."
        );
      } finally {
        setOpenDealMenuId(null);
        setDripActionDealId(null);
      }
    },
    [applyDealPatch, scheduleDealDrips, setDragError, setDripActionDealId, setOpenDealMenuId]
  );

  return {
    scheduleDealDrips,
    handleStagePromptDecision,
    handleStagePromptEnable,
    handleStagePromptDisable,
    handleStagePromptCancel,
    handleCancelDrips,
  };
}
