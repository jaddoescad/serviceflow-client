import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { KanbanBoard } from "./kanban-board";
import { SALES_DEAL_STAGE_OPTIONS } from "@/features/deals";

describe.skip("KanbanBoard", () => {
  it("renders columns and counts", () => {
    render(
      <KanbanBoard
        companyId="test"
        companyName="Test Co"
        initialDeals={[]}
        initialContacts={[]}
        canManageDeals={false}
        companyMembers={[]}
        proposalDealIds={[]}
        initialProposalSummaries={[]}
        stages={SALES_DEAL_STAGE_OPTIONS}
        title="Sales Pipeline"
        initialDripSequences={[]}
      />
    );
    expect(screen.getByLabelText(/Deal pipeline board/i)).toBeInTheDocument();
    expect(screen.getByText(/Cold Deals/i)).toBeInTheDocument();
    expect(screen.getByText(/Warm Deals/i)).toBeInTheDocument();
    expect(screen.getByText(/Estimate Scheduled/i)).toBeInTheDocument();
  });
});
