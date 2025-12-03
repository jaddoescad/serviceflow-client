import { useMemo } from "react";
import type { DealStageOption } from "@/features/deals";
import type { DripSequenceRecord } from "@/features/drips";
import type { CompanyMemberRecord } from "@/features/companies";
import type { DealProposalSummary, DealInvoiceSummary } from "@/types/pipeline";
import type { DealRecord } from "@/features/deals";
import { useColumnsState } from "./useColumnsState";
import { useProposalState } from "./useProposalState";
import { useDripState } from "./useDripState";
import { useUIState } from "./useUIState";

type UseKanbanStateProps = {
  initialDeals: DealRecord[];
  stages: DealStageOption[];
  proposalDealIds: string[];
  initialProposalSummaries: DealProposalSummary[];
  initialInvoiceSummaries?: DealInvoiceSummary[];
  initialDripSequences: DripSequenceRecord[];
  companyMembers: CompanyMemberRecord[];
};

export function useKanbanState({
  initialDeals,
  stages,
  proposalDealIds,
  initialProposalSummaries,
  initialInvoiceSummaries,
  initialDripSequences,
  companyMembers,
}: UseKanbanStateProps) {
  // Columns state (deals organized by stage)
  const columnsState = useColumnsState({ initialDeals, stages });

  // Proposal state (includes invoice summaries)
  const proposalState = useProposalState({ proposalDealIds, initialProposalSummaries, initialInvoiceSummaries });

  // Drip sequences state
  const dripState = useDripState({ initialDripSequences });

  // UI state (navigation, menus, modals, errors)
  const uiState = useUIState();

  // Computed: member display names
  const memberDisplayNameByUserId = useMemo(() => {
    const map = new Map<string, string>();

    for (const member of companyMembers) {
      const display = member.display_name.trim() || member.email.trim() || member.email;
      map.set(member.user_id, display);
    }

    return map;
  }, [companyMembers]);

  return {
    // Columns state
    columns: columnsState.columns,
    setColumns: columnsState.setColumns,
    applyDealPatch: columnsState.applyDealPatch,

    // Proposal state
    dealsWithProposals: proposalState.dealsWithProposals,
    setDealsWithProposals: proposalState.setDealsWithProposals,
    proposalSummaries: proposalState.proposalSummaries,
    setProposalSummaries: proposalState.setProposalSummaries,
    proposalDealIdSet: proposalState.proposalDealIdSet,
    proposalSummaryByDealId: proposalState.proposalSummaryByDealId,
    invoiceSummaryByDealId: proposalState.invoiceSummaryByDealId,

    // Drip state
    dripSequencesByStage: dripState.dripSequencesByStage,
    setDripSequencesByStage: dripState.setDripSequencesByStage,
    dripSettingsStageId: dripState.dripSettingsStageId,
    setDripSettingsStageId: dripState.setDripSettingsStageId,
    stagePromptState: dripState.stagePromptState,
    setStagePromptState: dripState.setStagePromptState,
    stagePromptError: dripState.stagePromptError,
    setStagePromptError: dripState.setStagePromptError,
    isSchedulingStagePrompt: dripState.isSchedulingStagePrompt,
    setIsSchedulingStagePrompt: dripState.setIsSchedulingStagePrompt,
    dripActionDealId: dripState.dripActionDealId,
    setDripActionDealId: dripState.setDripActionDealId,
    handleSequenceChange: dripState.handleSequenceChange,
    handleSequenceCleared: dripState.handleSequenceCleared,
    openDripSettings: dripState.openDripSettings,

    // UI state
    scheduleContext: uiState.scheduleContext,
    setScheduleContext: uiState.setScheduleContext,
    navigatingDealId: uiState.navigatingDealId,
    setNavigatingDealId: uiState.setNavigatingDealId,
    hasMounted: uiState.hasMounted,
    dragError: uiState.dragError,
    setDragError: uiState.setDragError,
    openDealMenuId: uiState.openDealMenuId,
    setOpenDealMenuId: uiState.setOpenDealMenuId,
    appointmentDetailContext: uiState.appointmentDetailContext,
    setAppointmentDetailContext: uiState.setAppointmentDetailContext,
    closeAppointmentDetails: uiState.closeAppointmentDetails,

    // Computed
    memberDisplayNameByUserId,
  };
}
