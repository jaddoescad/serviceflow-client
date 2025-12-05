import { useCallback } from "react";
import type { DealRecord, DealStageId, DealStageOption } from "@/features/deals";
import { updateDealStage } from "@/features/deals";
import { useCreateQuoteAndNavigate } from "@/features/quotes";
import type { ScheduleDripsPayload } from "@/features/drips";
import type { DealProposalSummary } from "@/types/pipeline";
import type { DealsByStage } from "../types";

type UseDealActionsProps = {
  companyId: string;
  stages: DealStageOption[];
  setColumns: React.Dispatch<React.SetStateAction<DealsByStage>>;
  setDealsWithProposals: React.Dispatch<React.SetStateAction<string[]>>;
  setProposalSummaries: React.Dispatch<React.SetStateAction<DealProposalSummary[]>>;
  setScheduleContext: React.Dispatch<React.SetStateAction<any>>;
  setDragError: React.Dispatch<React.SetStateAction<string | null>>;
  scheduleDealDrips: (
    dealId: string,
    stageId: DealStageId,
    enableDrips: boolean,
    trigger: ScheduleDripsPayload["trigger"],
    cancelExistingJobs?: boolean
  ) => Promise<void>;
};

export function useDealActions({
  companyId,
  stages,
  setColumns,
  setDealsWithProposals,
  setProposalSummaries,
  setScheduleContext,
  setDragError,
  scheduleDealDrips,
}: UseDealActionsProps) {
  const { createQuoteAndNavigate } = useCreateQuoteAndNavigate();

  const handleContactCreated = useCallback(() => {
    // Contact created - no need to track in kanban board state
  }, []);

  const handleDealCreated = useCallback(
    (deal: DealRecord) => {
      const fallbackStage = stages[0]?.id ?? deal.stage;
      const stage = (stages.find((item) => item.id === deal.stage)?.id ?? fallbackStage) as DealStageId;

      setColumns((previous) => ({
        ...previous,
        [stage]: [deal, ...(previous[stage] ?? [])],
      }));

      const enableDrips = !deal.disable_drips;
      void scheduleDealDrips(deal.id, stage, enableDrips, "deal_created").catch((error) => {
        console.error("Failed to queue drips for new deal", error);
      });
    },
    [scheduleDealDrips, setColumns, stages]
  );

  const handleDealScheduled = useCallback(
    (deal: DealRecord) => {
      const fallbackStage = stages[0]?.id ?? deal.stage;
      const stage = (stages.find((item) => item.id === deal.stage)?.id ?? fallbackStage) as DealStageId;

      setColumns((previous) => {
        const next: DealsByStage = Object.fromEntries(
          Object.entries(previous).map(([key, items]) => [key, items.filter((item) => item.id !== deal.id)])
        ) as DealsByStage;

        next[stage] = [deal, ...(next[stage] ?? [])];

        return next;
      });

      setScheduleContext(null);
    },
    [setColumns, setScheduleContext, stages]
  );

  const handleProposalCreated = useCallback(
    (deal: DealRecord) => {
      setDealsWithProposals((previous) => (previous.includes(deal.id) ? previous : [...previous, deal.id]));
      setProposalSummaries((previous) => {
        const existing = previous.find((summary) => summary.dealId === deal.id);
        if (existing) {
          return previous;
        }

        const nowIso = new Date().toISOString();

        return [
          ...previous,
          {
            dealId: deal.id,
            quoteCount: 1,
            totalAmount: 0,
            latestStatus: "draft",
            latestUpdatedAt: nowIso,
            latestQuoteId: null,
          },
        ];
      });

      const targetStage: DealStageId = "in_draft";

      if (deal.stage !== targetStage) {
        const updatedDeal: DealRecord = {
          ...deal,
          stage: targetStage,
          updated_at: new Date().toISOString(),
        };

        setColumns((previous) => {
          const next: DealsByStage = Object.fromEntries(
            Object.entries(previous).map(([key, items]) => [
              key,
              items.filter((item) => item.id !== deal.id),
            ])
          ) as DealsByStage;

          next[targetStage] = [updatedDeal, ...(next[targetStage] ?? [])];

          return next;
        });

        updateDealStage(deal.id, targetStage).catch((error) => {
          console.error("Failed to update deal stage after creating proposal", error);
          setDragError("We couldn't update the deal stage. Please try again.");
        });
      }

      createQuoteAndNavigate({ companyId, dealId: deal.id });
    },
    [companyId, createQuoteAndNavigate, setColumns, setDealsWithProposals, setDragError, setProposalSummaries]
  );

  return {
    handleContactCreated,
    handleDealCreated,
    handleDealScheduled,
    handleProposalCreated,
  };
}
