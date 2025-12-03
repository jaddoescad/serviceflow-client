import type { AppointmentRecord } from "@/features/appointments";
import type { DealRecord, DealStageId, DealStageOption } from "@/features/deals";
import type { DripSequenceRecord } from "@/features/drips";
import type { CompanyMemberRecord } from "@/features/companies";
import type { DealProposalSummary, DealInvoiceSummary } from "@/types/pipeline";

export type DealsByStage = Record<string, DealRecord[]>;

export type ScheduleContext =
  | {
      mode: "existing";
      deal: DealRecord;
    }
  | {
      mode: "edit";
      deal: DealRecord;
      appointment: AppointmentRecord;
    }
  | {
      mode: "new";
    };

export type StagePromptState = {
  deal: DealRecord;
  previousStage: DealStageId;
  nextStage: DealStageId;
  destinationIndex: number;
};

export type AppointmentDetailContext = {
  deal: DealRecord;
  appointment: AppointmentRecord;
} | null;

export type KanbanBoardProps = {
  companyId: string;
  companyName: string;
  initialDeals: DealRecord[];
  canManageDeals: boolean;
  companyMembers: CompanyMemberRecord[];
  proposalDealIds: string[];
  initialProposalSummaries: DealProposalSummary[];
  initialInvoiceSummaries?: DealInvoiceSummary[];
  stages: DealStageOption[];
  title?: string;
  showNewActions?: boolean;
  initialDripSequences: DripSequenceRecord[];
  useInvoiceTotals?: boolean;
};
