import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSessionContext, useCompanyContext, useMembersContext } from "@/contexts/AuthContext";
import { useDeals, useProposalSummaries, useInvoiceSummaries } from "@/hooks";
import { KanbanBoardClient } from "@/components/pipeline/kanban-board.client";
import { filterDealsForMember } from "@/lib/company-members";
import { JOBS_DEAL_STAGE_OPTIONS } from "@/features/deals";
import { KanbanBoardSkeleton } from "@/components/ui/skeleton";
import type { ContactRecord } from "@/features/contacts";

export default function JobsPipelinePage() {
  const navigate = useNavigate();
  const { isLoading: authLoading } = useSessionContext();
  const { company, member } = useCompanyContext();
  const { companyMembers } = useMembersContext();

  const { data: rawDeals = [], isLoading: dealsLoading } = useDeals(company?.id ?? '');
  const { data: proposalSummaries = [], isLoading: summariesLoading } = useProposalSummaries(company?.id);
  const { data: invoiceSummaries = [], isLoading: invoiceSummariesLoading } = useInvoiceSummaries(company?.id);

  const canManageDeals = !member || member.role === "admin";
  const companyDisplayName =
    company?.short_name?.trim() || company?.name?.trim() || "Your Company";

  const pageData = useMemo(() => {
    // Filter for jobs pipeline stages
    const jobStages = new Set<string>(JOBS_DEAL_STAGE_OPTIONS.map(s => s.id));
    const deals = rawDeals.filter(d => jobStages.has(d.stage));
    const contacts: ContactRecord[] = [];
    const proposalDealIds = proposalSummaries.map((summary) => summary.dealId);
    const filteredDeals = filterDealsForMember(deals, member);

    return {
      filteredDeals,
      contacts,
      proposalDealIds,
      proposalSummaries,
      invoiceSummaries,
    };
  }, [rawDeals, proposalSummaries, invoiceSummaries, member]);

  useEffect(() => {
    if (authLoading) return;
    if (!company) {
      navigate("/organizations/select");
    }
  }, [authLoading, company, navigate]);

  if (authLoading || dealsLoading || summariesLoading || invoiceSummariesLoading || !company) {
    return (
      <div className="flex w-full flex-1 min-h-0 flex-col">
        <KanbanBoardSkeleton columns={JOBS_DEAL_STAGE_OPTIONS.length} cardsPerColumn={3} />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-1 min-h-0 flex-col">
      <KanbanBoardClient
        companyId={company.id}
        companyName={companyDisplayName}
        initialDeals={pageData.filteredDeals}
        initialContacts={pageData.contacts}
        canManageDeals={canManageDeals}
        companyMembers={companyMembers}
        proposalDealIds={pageData.proposalDealIds}
        initialProposalSummaries={pageData.proposalSummaries}
        initialInvoiceSummaries={pageData.invoiceSummaries}
        stages={JOBS_DEAL_STAGE_OPTIONS}
        title="Jobs Pipeline"
        showNewActions={false}
        initialDripSequences={[]}
        useInvoiceTotals
      />
    </div>
  );
}
