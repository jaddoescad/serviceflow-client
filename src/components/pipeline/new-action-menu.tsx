"use client";

import { useState } from "react";
import { NewDealModal } from "@/components/dialog-forms/new-deal-modal";
import { ScheduleDealModal } from "@/components/dialog-forms/schedule-deal-modal";
import { createQuote } from "@/features/quotes";
import type { DealRecord, DealStageOption } from "@/features/deals";
import { useDealInvalidation } from "@/features/deals";
import type { ContactRecord } from "@/features/contacts";
import type { CompanyMemberRecord } from "@/features/companies";

type NewActionMenuProps = {
  companyId: string;
  companyName: string;
  stages: DealStageOption[];
  companyMembers?: CompanyMemberRecord[];
  onDealCreated: (deal: DealRecord) => void;
  onDealScheduled: (deal: DealRecord) => void;
  onProposalCreated: (deal: DealRecord) => void;
  onContactCreated: (contact: ContactRecord) => void;
};

export function NewActionMenu({
  companyId,
  companyName,
  stages,
  companyMembers,
  onDealCreated,
  onDealScheduled,
  onProposalCreated,
  onContactCreated,
}: NewActionMenuProps) {
  const { invalidateDashboard } = useDealInvalidation();
  const [open, setOpen] = useState(false);
  const [dealIntent, setDealIntent] = useState<"deal" | "proposal" | null>(null);
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [menuError, setMenuError] = useState<string | null>(null);

  const closeMenu = () => setOpen(false);

  const openDealModal = () => {
    setDealIntent("deal");
    setOpen(false);
  };

  const openProposalModal = () => {
    setDealIntent("proposal");
    setOpen(false);
  };

  const handleAppointmentSelect = () => {
    setAppointmentModalOpen(true);
    setOpen(false);
  };

  const handleDealModalClose = () => {
    setDealIntent(null);
    setMenuError(null);
  };

  const handleAppointmentClose = () => {
    setAppointmentModalOpen(false);
    setMenuError(null);
  };

  const handleDealCreated = async (deal: DealRecord) => {
    onDealCreated(deal);

    if (dealIntent !== "proposal") {
      handleDealModalClose();
      return;
    }

    try {
      setMenuError(null);

      await createQuote({
        quote: {
          company_id: companyId,
          deal_id: deal.id,
          status: "draft",
          title: "New Proposal",
        },
        lineItems: [],
      });

      // Invalidate React Query cache
      invalidateDashboard(companyId, "sales");
      invalidateDashboard(companyId, "jobs");

      onProposalCreated({ ...deal, stage: "in_draft" });
      handleDealModalClose();
    } catch (error) {
      console.error("Failed to start proposal for new deal", error);
      setMenuError("We couldn't start a proposal. Open the deal and try again.");
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-600 focus:outline-none focus:ring-0"
      >
        <span>New</span>
        <span className={`text-xs transition-transform ${open ? "rotate-180" : ""}`} aria-hidden>
          ▼
        </span>
      </button>
      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-40 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
          <button
            type="button"
            onClick={openDealModal}
            className="flex w-full items-center justify-start rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            New deal
          </button>
          <button
            type="button"
            onClick={handleAppointmentSelect}
            className="flex w-full items-center justify-start rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            New appointment
          </button>
          <button
            type="button"
            onClick={openProposalModal}
            className="flex w-full items-center justify-start rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            New proposal
          </button>
          {menuError ? (
            <p className="mt-2 px-2 text-[11px] font-medium text-rose-600">{menuError}</p>
          ) : null}
        </div>
      ) : null}
      <NewDealModal
        open={dealIntent !== null}
        onClose={handleDealModalClose}
        companyId={companyId}
        stages={stages}
        companyMembers={companyMembers}
        defaultStageId={dealIntent === "proposal" ? "in_draft" : undefined}
        onCreated={handleDealCreated}
        onContactCreated={onContactCreated}
        mode="create"
      />
      <ScheduleDealModal
        open={appointmentModalOpen}
        mode="new"
        companyId={companyId}
        companyName={companyName}
        deal={null}
        appointment={null}
        onClose={handleAppointmentClose}
        onScheduled={onDealScheduled}
        onContactCreated={onContactCreated}
        companyMembers={companyMembers ?? []}
        stageOnSchedule="estimate_scheduled"
        copyOverrides={{
          createHeader: "New Appointment",
          createAction: "Create & schedule",
          createPendingAction: "Creating…",
        }}
      />
    </div>
  );
}
