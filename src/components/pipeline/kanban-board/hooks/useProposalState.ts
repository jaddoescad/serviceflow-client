import { useEffect, useMemo, useRef, useState } from "react";
import type { DealProposalSummary, DealInvoiceSummary } from "@/types/pipeline";

type UseProposalStateProps = {
  proposalDealIds: string[];
  initialProposalSummaries: DealProposalSummary[];
  initialInvoiceSummaries?: DealInvoiceSummary[];
};

const EMPTY_INVOICE_SUMMARIES: DealInvoiceSummary[] = [];

function arraysEqual<T extends { dealId: string }>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((item, index) => item.dealId === b[index].dealId);
}

export function useProposalState({
  proposalDealIds,
  initialProposalSummaries,
  initialInvoiceSummaries,
}: UseProposalStateProps) {
  const stableInvoiceSummaries = initialInvoiceSummaries ?? EMPTY_INVOICE_SUMMARIES;

  const [dealsWithProposals, setDealsWithProposals] = useState<string[]>(proposalDealIds);
  const [proposalSummaries, setProposalSummaries] = useState<DealProposalSummary[]>(initialProposalSummaries);
  const [invoiceSummaries, setInvoiceSummaries] = useState<DealInvoiceSummary[]>(stableInvoiceSummaries);

  const prevInvoiceSummariesRef = useRef(stableInvoiceSummaries);

  // Sync dealsWithProposals
  useEffect(() => {
    setDealsWithProposals((previous) => {
      if (proposalDealIds.length === previous.length && proposalDealIds.every((id, index) => previous[index] === id)) {
        return previous;
      }
      return Array.from(new Set(proposalDealIds));
    });
  }, [proposalDealIds]);

  // Sync proposalSummaries
  useEffect(() => {
    setProposalSummaries((prev) => {
      if (arraysEqual(prev, initialProposalSummaries)) {
        return prev;
      }
      return initialProposalSummaries;
    });
  }, [initialProposalSummaries]);

  // Sync invoiceSummaries - compare by content to avoid infinite loops
  useEffect(() => {
    if (!arraysEqual(prevInvoiceSummariesRef.current, stableInvoiceSummaries)) {
      prevInvoiceSummariesRef.current = stableInvoiceSummaries;
      setInvoiceSummaries(stableInvoiceSummaries);
    }
  }, [stableInvoiceSummaries]);

  const proposalDealIdSet = useMemo(() => new Set(dealsWithProposals), [dealsWithProposals]);

  const proposalSummaryByDealId = useMemo(() => {
    return proposalSummaries.reduce((acc, summary) => {
      acc.set(summary.dealId, summary);
      return acc;
    }, new Map<string, DealProposalSummary>());
  }, [proposalSummaries]);

  const invoiceSummaryByDealId = useMemo(() => {
    return invoiceSummaries.reduce((acc, summary) => {
      acc.set(summary.dealId, summary);
      return acc;
    }, new Map<string, DealInvoiceSummary>());
  }, [invoiceSummaries]);

  return {
    dealsWithProposals,
    setDealsWithProposals,
    proposalSummaries,
    setProposalSummaries,
    proposalDealIdSet,
    proposalSummaryByDealId,
    invoiceSummaries,
    setInvoiceSummaries,
    invoiceSummaryByDealId,
  };
}
