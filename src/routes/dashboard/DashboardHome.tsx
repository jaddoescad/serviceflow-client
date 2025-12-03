import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSessionContext, useCompanyContext, useMembersContext } from "@/contexts/AuthContext";
import { useDashboardData } from "@/hooks";
import { filterDealsForMember } from "@/lib/company-members";
import { KanbanBoardClient } from "@/components/pipeline/kanban-board.client";
import { SALES_DEAL_STAGE_OPTIONS } from "@/features/deals";
import { KanbanBoardSkeleton } from "@/components/ui/skeleton";

export default function Home() {
  const navigate = useNavigate();
  const { isLoading: authLoading } = useSessionContext();
  const { company, member } = useCompanyContext();
  const { companyMembers } = useMembersContext();

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
        initialDripSequences={pageData.dripSequences}
      />
    </div>
  );
}
