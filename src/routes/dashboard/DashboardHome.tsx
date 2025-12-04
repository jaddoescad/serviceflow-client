import { useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSessionContext, useCompanyContext, useMembersContext } from "@/contexts/AuthContext";
import { usePageHeader } from "@/contexts/PageHeaderContext";
import { useDashboardData } from "@/hooks";
import { useSupabaseBrowserClient } from "@/hooks/useSupabaseBrowserClient";
import { filterDealsForMember } from "@/lib/company-members";
import { KanbanBoardClient } from "@/components/pipeline/kanban-board.client";
import { NewActionMenu } from "@/components/pipeline/new-action-menu";
import { SALES_DEAL_STAGE_OPTIONS } from "@/features/deals";
import { KanbanBoardSkeleton } from "@/components/ui/skeleton";
import { scheduleDealDrips } from "@/services/functions";
import type { DealRecord, DealStageId } from "@/features/deals";
import type { ContactRecord } from "@/features/contacts";

export default function Home() {
  const navigate = useNavigate();
  const supabase = useSupabaseBrowserClient();
  const { isLoading: authLoading } = useSessionContext();
  const { company, member } = useCompanyContext();
  const { companyMembers } = useMembersContext();
  const { setPageHeader } = usePageHeader();

  const { data, isLoading: dashboardLoading } = useDashboardData(company?.id, "sales");
  const deals = data?.deals ?? [];
  const dripSequences = data?.dripSequences ?? [];
  const proposalSummaries = data?.proposalSummaries ?? [];

  // Show skeleton only on initial load, not on background refetches
  const isInitialLoad = authLoading || (dashboardLoading && deals.length === 0);
  const canManageDeals = !member || member.role === "admin";
  const companyDisplayName =
    company?.short_name?.trim() || company?.name?.trim() || "Your Company";

  const pageData = useMemo(() => {
    // Filter for sales pipeline stages
    const salesStages = new Set<string>(SALES_DEAL_STAGE_OPTIONS.map(s => s.id));
    const salesDeals = deals.filter(d => salesStages.has(d.stage));
    const proposalDealIds = proposalSummaries.map((summary) => summary.dealId);
    const filteredDeals = filterDealsForMember(salesDeals, member);

    return {
      filteredDeals,
      proposalDealIds,
      proposalSummaries,
      dripSequences
    };
  }, [deals, proposalSummaries, dripSequences, member]);

  // Handlers for NewActionMenu - schedule drips when a deal is created
  const handleDealCreated = useCallback(
    (deal: DealRecord) => {
      const enableDrips = !deal.disable_drips;
      const stageId = deal.stage as DealStageId;

      scheduleDealDrips(supabase, {
        dealId: deal.id,
        stageId,
        trigger: "deal_created",
        enableDrips,
      }).catch((error) => {
        console.error("Failed to schedule drips for new deal", error);
      });
    },
    [supabase]
  );
  const handleDealScheduled = (_deal: DealRecord) => {};
  const handleProposalCreated = (_deal: DealRecord) => {};
  const handleContactCreated = (_contact: ContactRecord) => {};

  // Set page header
  useEffect(() => {
    if (company && canManageDeals) {
      setPageHeader(
        "Sales Pipeline",
        <NewActionMenu
          companyId={company.id}
          companyName={companyDisplayName}
          stages={SALES_DEAL_STAGE_OPTIONS}
          companyMembers={companyMembers}
          onDealCreated={handleDealCreated}
          onDealScheduled={handleDealScheduled}
          onProposalCreated={handleProposalCreated}
          onContactCreated={handleContactCreated}
        />
      );
    } else {
      setPageHeader("Sales Pipeline");
    }
  }, [company, canManageDeals, companyDisplayName, companyMembers, setPageHeader, handleDealCreated]);

  useEffect(() => {
    if (authLoading) return;
    if (!company) {
      navigate("/organizations/select");
    }
  }, [authLoading, company, navigate]);

  if (isInitialLoad || !company) {
    return (
      <div className="flex w-full flex-1 min-h-0 flex-col">
        <KanbanBoardSkeleton columns={SALES_DEAL_STAGE_OPTIONS.length} cardsPerColumn={3} />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-1 min-h-0 flex-col">
      <KanbanBoardClient
        companyId={company.id}
        companyName={companyDisplayName}
        initialDeals={pageData.filteredDeals}
        canManageDeals={canManageDeals}
        companyMembers={companyMembers}
        proposalDealIds={pageData.proposalDealIds}
        initialProposalSummaries={pageData.proposalSummaries}
        stages={SALES_DEAL_STAGE_OPTIONS}
        title="Sales Pipeline"
        hideHeader={true}
        initialDripSequences={pageData.dripSequences}
      />
    </div>
  );
}
