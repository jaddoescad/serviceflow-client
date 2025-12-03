import { fetchDeals, SALES_DEAL_STAGE_OPTIONS } from "@/features/deals";
import type { DealRecord } from "@/features/deals";
import { fetchProposalSummaries } from "./proposal-summaries";
import type { SalesListRow, SalesListSummary } from "@/types/sales-list";
import type { DealProposalSummary } from "@/types/pipeline";

export const fetchSalesListData = async (
  companyId: string,
  options?: { salespersonName?: string | null }
): Promise<{ rows: SalesListRow[]; summary: SalesListSummary }> => {
  const [deals, proposalSummaries] = await Promise.all([
    fetchDeals(companyId),
    fetchProposalSummaries(companyId).catch((error) => {
      console.error("Failed to load proposal summaries", error);
      return [];
    }),
  ]);

  const proposalSummaryByDealId = proposalSummaries.reduce((acc, summary) => {
    acc.set(summary.dealId, summary);
    return acc;
  }, new Map<string, DealProposalSummary>());

  // Transform to rows
  const rows: SalesListRow[] = deals.map((deal) => {
    const stage = SALES_DEAL_STAGE_OPTIONS.find(s => s.id === deal.stage);
    const contactName = deal.contact 
        ? `${deal.contact.first_name} ${deal.contact.last_name || ''}`.trim()
        : (deal.first_name + ' ' + (deal.last_name || '')).trim();
    const proposalSummary = proposalSummaryByDealId.get(deal.id);

    return {
      id: deal.id,
      label: null, // Not in DealRecord
      customerName: contactName || deal.email || deal.phone || "Unknown",
      phoneNumber: deal.contact?.phone || deal.phone || null,
      email: deal.contact?.email || deal.email || null,
      leadSource: deal.lead_source,
      dealName: `${contactName} Deal`, // or deal.name if exists? DealRecord doesn't have name usually
      stageId: deal.stage,
      stageLabel: stage?.label || deal.stage,
      dealAmount: proposalSummary?.totalAmount ?? 0,
      lastChangeAt: deal.updated_at,
      createdAt: deal.created_at,
      salesperson: deal.salesperson,
      isArchived: Boolean(deal.archived_at),
    };
  });

  // Compute summary
  const summary: SalesListSummary = {
    totalDeals: rows.length,
    totalValue: rows.reduce((sum, row) => sum + row.dealAmount, 0),
    salespeople: Array.from(new Set(rows.map(r => r.salesperson).filter(Boolean) as string[])),
    leadSources: Array.from(new Set(rows.map(r => r.leadSource).filter(Boolean) as string[])),
  };

  return { rows, summary };
};
