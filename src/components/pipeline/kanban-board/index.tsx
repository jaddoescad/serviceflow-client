"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import { AppointmentDetailsDialog } from "@/components/appointments/appointment-details-dialog";
import { NewActionMenu } from "@/components/pipeline/new-action-menu";
import { ScheduleDealModal } from "@/components/dialog-forms/schedule-deal-modal";
import { StageDripSettingsPanel } from "@/components/pipeline/stage-drip-settings-panel";
import { StageDripPromptDialog } from "@/components/pipeline/stage-drip-prompt-dialog";
import { formatAppointmentDateLabel, isAppointmentTomorrow } from "@/lib/appointments-format";
import type { DealStageId } from "@/features/deals";
import { DEAL_STAGE_HEADER_THEMES, DEAL_STAGE_PIPELINE_MAP } from "@/features/deals";
import { useSupabaseBrowserClient } from "@/hooks/useSupabaseBrowserClient";
import { formatCurrency } from "@/lib/currency";
import { useKanbanState, useDripActions, useDealActions } from "./hooks";
import { quoteStatusLabels } from "./constants";
import { formatName, formatLocation, formatUpdatedAt } from "./utils";
import type { KanbanBoardProps } from "./types";

export function KanbanBoard({
  companyId,
  companyName,
  initialDeals,
  canManageDeals,
  companyMembers,
  proposalDealIds,
  initialProposalSummaries,
  initialInvoiceSummaries,
  stages,
  title,
  initialDripSequences,
  showNewActions = true,
  hideHeader = false,
  useInvoiceTotals = false,
}: KanbanBoardProps) {
  const supabase = useSupabaseBrowserClient();
  const navigate = useNavigate();
  const [isNavigating, startTransition] = useTransition();

  // Mobile stage selector state
  const [mobileSelectedStage, setMobileSelectedStage] = useState<DealStageId>(stages[0]?.id as DealStageId);
  const [isMobileStageMenuOpen, setIsMobileStageMenuOpen] = useState(false);

  // Core kanban state
  const {
    columns,
    setColumns,
    scheduleContext,
    setScheduleContext,
    setDealsWithProposals,
    setProposalSummaries,
    navigatingDealId,
    setNavigatingDealId,
    hasMounted,
    dragError,
    setDragError,
    openDealMenuId,
    setOpenDealMenuId,
    dripActionDealId,
    setDripActionDealId,
    appointmentDetailContext,
    setAppointmentDetailContext,
    dripSequencesByStage,
    setDripSequencesByStage,
    dripSettingsStageId,
    setDripSettingsStageId,
    stagePromptState,
    setStagePromptState,
    stagePromptError,
    setStagePromptError,
    isSchedulingStagePrompt,
    setIsSchedulingStagePrompt,
    memberDisplayNameByUserId,
    proposalDealIdSet,
    proposalSummaryByDealId,
    invoiceSummaryByDealId,
    applyDealPatch,
    handleSequenceChange,
    handleSequenceCleared,
    openDripSettings,
    closeAppointmentDetails,
  } = useKanbanState({
    initialDeals,
    stages,
    proposalDealIds,
    initialProposalSummaries,
    initialInvoiceSummaries,
    initialDripSequences,
    companyMembers,
  });

  // Drip actions
  const {
    scheduleDealDrips,
    handleStagePromptEnable,
    handleStagePromptDisable,
    handleStagePromptCancel,
    handleCancelDrips,
  } = useDripActions({
    supabase,
    companyId,
    applyDealPatch,
    setColumns,
    setDripSequencesByStage,
    setStagePromptState,
    setStagePromptError,
    setIsSchedulingStagePrompt,
    setOpenDealMenuId,
    setDripActionDealId,
    setDragError,
    stagePromptState,
  });

  // Deal actions
  const {
    handleContactCreated,
    handleDealCreated,
    handleDealScheduled,
    handleProposalCreated,
  } = useDealActions({
    stages,
    setColumns,
    setDealsWithProposals,
    setProposalSummaries,
    setScheduleContext,
    setDragError,
    scheduleDealDrips,
  });

  // Navigation state sync
  useEffect(() => {
    if (!isNavigating) {
      setNavigatingDealId(null);
    }
  }, [isNavigating, setNavigatingDealId]);

  const isAwaitingNavigation = isNavigating && navigatingDealId !== null;

  const appointmentDetailAssigneeName =
    appointmentDetailContext?.appointment.assigned_to
      ? memberDisplayNameByUserId.get(appointmentDetailContext.appointment.assigned_to) ??
        appointmentDetailContext.deal.salesperson ??
        null
      : null;

  const scheduleModalDeal =
    scheduleContext && (scheduleContext.mode === "existing" || scheduleContext.mode === "edit")
      ? scheduleContext.deal
      : null;

  const scheduleModalAppointment =
    scheduleContext && scheduleContext.mode === "edit" ? scheduleContext.appointment : null;

  const handleAppointmentEdit = () => {
    if (!appointmentDetailContext) {
      return;
    }

    const context = appointmentDetailContext;
    closeAppointmentDetails();
    setScheduleContext({
      mode: "edit",
      deal: context.deal,
      appointment: context.appointment,
    });
  };

  const handleDragEnd = async ({ source, destination }: DropResult) => {
    if (!canManageDeals) {
      setDragError(null);
      return;
    }

    if (!destination) {
      setDragError(null);
      return;
    }

    const sourceStageId = source.droppableId as DealStageId;
    const destinationStageId = destination.droppableId as DealStageId;

    const sourceItems = [...(columns[sourceStageId] ?? [])];
    const movingDeal = sourceItems[source.index];

    if (!movingDeal) {
      setDragError(null);
      return;
    }

    if (sourceStageId === destinationStageId) {
      if (source.index === destination.index) {
        setDragError(null);
        return;
      }

      setColumns((previous) => {
        const updatedStageDeals = [...(previous[sourceStageId] ?? [])];
        const [removed] = updatedStageDeals.splice(source.index, 1);
        if (!removed) {
          return previous;
        }
        updatedStageDeals.splice(destination.index, 0, removed);

        return {
          ...previous,
          [sourceStageId]: updatedStageDeals,
        };
      });

      setDragError(null);
      return;
    }

    if (destinationStageId === "estimate_scheduled" && !movingDeal.latest_appointment) {
      setDragError("Create an appointment before moving this deal to Estimate Scheduled.");
      return;
    }

    const proposalStages: DealStageId[] = ["in_draft", "proposals_sent", "proposals_rejected"];
    if (proposalStages.includes(destinationStageId) && !proposalDealIdSet.has(movingDeal.id)) {
      setDragError("Create a proposal before moving this deal into proposal stages.");
      return;
    }

    setDragError(null);
    setStagePromptError(null);
    setStagePromptState({
      deal: movingDeal,
      previousStage: sourceStageId,
      nextStage: destinationStageId,
      destinationIndex: destination.index,
    });
  };

  // Computed values for drip settings
  const activeDripStageOption = dripSettingsStageId
    ? stages.find((item) => item.id === dripSettingsStageId) ?? null
    : null;
  const activeDripSequence = dripSettingsStageId
    ? dripSequencesByStage[dripSettingsStageId] ?? null
    : null;
  const activeDripPipeline = dripSettingsStageId
    ? DEAL_STAGE_PIPELINE_MAP[dripSettingsStageId] ?? "sales"
    : DEAL_STAGE_PIPELINE_MAP[stages[0]?.id as DealStageId] ?? "sales";

  const promptStageOption = stagePromptState
    ? stages.find((item) => item.id === stagePromptState.nextStage) ?? null
    : null;
  const promptSequence = stagePromptState
    ? dripSequencesByStage[stagePromptState.nextStage] ?? null
    : null;
  const promptDealLabel = stagePromptState ? formatName(stagePromptState.deal) : "";
  const promptDefaultEnabled = stagePromptState ? !stagePromptState.deal.disable_drips : true;

  const overlay =
    isAwaitingNavigation && hasMounted
      ? createPortal(
          <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-slate-950/30 backdrop-blur-sm">
            <svg
              className="h-8 w-8 animate-spin text-white"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v2a6 6 0 00-6 6H4z"
              />
            </svg>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.1em] text-white">
              Opening deal…
            </p>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      {overlay}
      <AppointmentDetailsDialog
        open={Boolean(appointmentDetailContext)}
        appointment={appointmentDetailContext?.appointment ?? null}
        deal={appointmentDetailContext?.deal ?? null}
        assigneeDisplayName={appointmentDetailAssigneeName}
        onClose={closeAppointmentDetails}
        onEdit={appointmentDetailContext ? handleAppointmentEdit : undefined}
      />
      {dragError ? (
        <div className="pointer-events-none fixed right-6 top-24 z-[1000] flex max-w-xs items-start gap-2 rounded-lg border border-rose-200 bg-white px-4 py-3 text-xs shadow-lg">
          <span className="mt-0.5 text-rose-500">⚠️</span>
          <p className="text-rose-600">{dragError}</p>
        </div>
      ) : null}
      <div className="flex w-full h-full flex-col gap-2 md:gap-3">
        {!hideHeader && (
          <header className="flex flex-wrap items-center justify-between gap-2 pb-1 flex-shrink-0 md:pb-2 md:gap-3">
            <h2 className="text-sm font-semibold text-slate-900 md:text-base">{title ?? "Deal Pipeline"}</h2>
            {canManageDeals && showNewActions ? (
              <NewActionMenu
                companyId={companyId}
                companyName={companyName}
                stages={stages}
                companyMembers={companyMembers}
                onDealCreated={handleDealCreated}
                onDealScheduled={handleDealScheduled}
                onProposalCreated={handleProposalCreated}
                onContactCreated={handleContactCreated}
              />
            ) : null}
          </header>
        )}

        {/* Mobile Stage Selector */}
        <div className="md:hidden relative">
          <button
            type="button"
            onClick={() => setIsMobileStageMenuOpen(!isMobileStageMenuOpen)}
            className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm"
          >
            <span className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${DEAL_STAGE_HEADER_THEMES[mobileSelectedStage]?.backgroundClass ?? "bg-slate-300"}`}
              />
              {stages.find((s) => s.id === mobileSelectedStage)?.label ?? "Select Stage"}
              <span className="text-xs font-normal text-slate-500">
                ({columns[mobileSelectedStage]?.length ?? 0})
              </span>
            </span>
            <svg
              className={`h-5 w-5 text-slate-400 transition-transform ${isMobileStageMenuOpen ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isMobileStageMenuOpen && (
            <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
              {stages.map((stageOption) => {
                const deals = columns[stageOption.id] ?? [];
                const isSelected = mobileSelectedStage === stageOption.id;
                const stageHeaderTheme = DEAL_STAGE_HEADER_THEMES[stageOption.id];
                return (
                  <button
                    key={stageOption.id}
                    type="button"
                    onClick={() => {
                      setMobileSelectedStage(stageOption.id as DealStageId);
                      setIsMobileStageMenuOpen(false);
                    }}
                    className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition ${
                      isSelected
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${stageHeaderTheme?.backgroundClass ?? "bg-slate-300"}`}
                      />
                      {stageOption.label}
                    </span>
                    <span className={`text-xs ${isSelected ? "text-blue-600" : "text-slate-500"}`}>
                      {deals.length}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Mobile Swipe Hint */}
        <div className="md:hidden flex items-center justify-center gap-4 py-2">
          <button
            type="button"
            onClick={() => {
              const currentIndex = stages.findIndex((s) => s.id === mobileSelectedStage);
              if (currentIndex > 0) {
                setMobileSelectedStage(stages[currentIndex - 1].id as DealStageId);
              }
            }}
            disabled={stages.findIndex((s) => s.id === mobileSelectedStage) === 0}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 active:bg-slate-100"
            aria-label="Previous stage"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex gap-1.5">
            {stages.map((stage, index) => (
              <button
                key={stage.id}
                type="button"
                onClick={() => setMobileSelectedStage(stage.id as DealStageId)}
                className={`h-2 rounded-full transition-all ${
                  mobileSelectedStage === stage.id
                    ? "w-6 bg-blue-500"
                    : "w-2 bg-slate-300 hover:bg-slate-400"
                }`}
                aria-label={`Go to ${stage.label}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              const currentIndex = stages.findIndex((s) => s.id === mobileSelectedStage);
              if (currentIndex < stages.length - 1) {
                setMobileSelectedStage(stages[currentIndex + 1].id as DealStageId);
              }
            }}
            disabled={stages.findIndex((s) => s.id === mobileSelectedStage) === stages.length - 1}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 active:bg-slate-100"
            aria-label="Next stage"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          {/* Desktop view - horizontal scroll */}
          <section
            className="hidden md:flex w-full flex-1 min-h-0 gap-3 overflow-x-auto overflow-y-hidden pb-4"
            aria-label="Deal pipeline board"
          >
            {stages.map((stageOption) => {
              const deals = columns[stageOption.id] ?? [];
              const stageHeaderTheme = DEAL_STAGE_HEADER_THEMES[stageOption.id];
              const headerClasses = [
                "flex items-center justify-between border-b px-3 py-1.5 text-[11px] font-semibold",
                stageHeaderTheme?.backgroundClass ?? "bg-slate-100",
                stageHeaderTheme?.borderClass ?? "border-slate-200",
                stageHeaderTheme?.textClass ?? "text-slate-800",
              ].join(" ");
              const countClasses = [
                "text-[10px] font-medium",
                stageHeaderTheme?.countTextClass ?? "text-slate-500",
              ].join(" ");

              return (
                <Droppable droppableId={stageOption.id} key={stageOption.id}>
                  {(provided) => (
                    <div
                      className="flex h-full min-h-0 min-w-[240px] max-h-full flex-col rounded-lg border border-slate-200 bg-slate-50"
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      <header className={headerClasses}>
                        <div className="flex items-center gap-2">
                          <h3>{stageOption.label}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          {(() => {
                            const sequence = dripSequencesByStage[stageOption.id as DealStageId];
                            const hasSteps = (sequence?.steps?.length ?? 0) > 0;
                            const isActive = Boolean(sequence?.is_enabled && hasSteps);
                            const label = sequence
                              ? isActive
                                ? "Drips on"
                                : hasSteps
                                  ? "Drips off"
                                  : "Add drips"
                              : "Set drips";
                            return (
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.preventDefault();
                                  event.stopPropagation();
                                  openDripSettings(stageOption.id as DealStageId);
                                }}
                                className={`inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-medium transition hover:opacity-80 ${isActive
                                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                  : "bg-slate-50 text-slate-500 border border-slate-200"
                                  }`}
                                data-drip-stage={stageOption.id}
                                title="Configure drip settings"
                              >
                                {label}
                              </button>
                            );
                          })()}
                          <span className={countClasses}>{deals.length}</span>
                        </div>
                      </header>
                      <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-2.5 py-2.5">
                        {deals.map((deal, index) => (
                          <Draggable
                            draggableId={deal.id}
                            index={index}
                            key={deal.id}
                            isDragDisabled={!canManageDeals}
                          >
                            {(dragProvided, dragSnapshot) => {
                              const destination = `/deals/${deal.id}`;
                              const cardClasses = `flex flex-col gap-1 rounded border border-slate-200 bg-white px-3 py-2 text-[12px] transition cursor-pointer hover:bg-slate-50 ${dragSnapshot.isDragging ? "opacity-70 shadow-kanbanDrag" : "shadow-sm"
                                }`;

                              return (
                                <article
                                  ref={dragProvided.innerRef}
                                  className={`${cardClasses} relative`}
                                  {...dragProvided.draggableProps}
                                  {...dragProvided.dragHandleProps}
                                  onClick={(event) => {
                                    if (dragSnapshot.isDragging) {
                                      return;
                                    }

                                    if (isAwaitingNavigation) {
                                      return;
                                    }

                                    const target = event.target as HTMLElement | null;
                                    if (
                                      target?.closest("[data-deal-actions]") ||
                                      target?.closest("[data-appointment-popover]") ||
                                      target?.closest("[data-view-proposal]")
                                    ) {
                                      return;
                                    }

                                    setNavigatingDealId(deal.id);
                                    startTransition(() => {
                                      navigate(destination);
                                    });
                                  }}
                                >
                                  {canManageDeals ? (
                                    <div className="absolute right-1.5 top-1.5 z-10" data-deal-actions>
                                      <button
                                        type="button"
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          closeAppointmentDetails();
                                          setOpenDealMenuId((current) => (current === deal.id ? null : deal.id));
                                        }}
                                        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-slate-200 bg-white text-[18px] leading-none text-slate-500 shadow-sm transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-500"
                                        aria-label="Open deal actions menu"
                                        aria-haspopup="menu"
                                        aria-expanded={openDealMenuId === deal.id}
                                      >
                                        ⋮
                                      </button>
                                      {openDealMenuId === deal.id ? (
                                        <div className="absolute right-0 mt-2 w-36 rounded-md border border-slate-200 bg-white py-1 shadow-lg">
                                          <button
                                            type="button"
                                            onClick={(event) => {
                                              event.stopPropagation();
                                              setOpenDealMenuId(null);
                                              closeAppointmentDetails();
                                              setScheduleContext({ mode: "existing", deal });
                                            }}
                                            className="w-full cursor-pointer px-3 py-1.5 text-left text-[11px] font-medium text-slate-600 transition hover:bg-slate-100"
                                          >
                                            New appointment
                                          </button>
                                          <button
                                            type="button"
                                            onClick={(event) => {
                                              event.stopPropagation();
                                              setOpenDealMenuId(null);
                                              handleProposalCreated(deal);
                                            }}
                                            className="w-full px-3 py-1.5 text-left text-[11px] font-medium text-slate-600 transition hover:bg-slate-100"
                                          >
                                            New proposal
                                          </button>
                                          <button
                                            type="button"
                                            onClick={(event) => {
                                              event.stopPropagation();
                                              handleCancelDrips(deal);
                                            }}
                                            disabled={dripActionDealId === deal.id}
                                            className="w-full px-3 py-1.5 text-left text-[11px] font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                                          >
                                            {dripActionDealId === deal.id ? "Canceling…" : "Cancel drips"}
                                          </button>
                                        </div>
                                      ) : null}
                                    </div>
                                  ) : null}
                                  <p className="pr-6 text-[13px] font-semibold text-slate-900">{formatName(deal)}</p>
                                  <p className="text-[11px] text-slate-500">
                                    {deal.lead_source ? `Source • ${deal.lead_source}` : "Source not set"}
                                  </p>
                                  <p className="text-[11px] text-slate-400">{formatLocation(deal)}</p>
                                  {deal.disable_drips ? (
                                    <span className="inline-flex items-center gap-1 rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                                      <svg
                                        className="h-3 w-3"
                                        viewBox="0 0 16 16"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={1.5}
                                        aria-hidden
                                      >
                                        <path d="M8 3.5v5" strokeLinecap="round" />
                                        <circle cx="8" cy="10.5" r="0.75" fill="currentColor" />
                                        <path
                                          d="M7.249 1.98c.414-.715 1.088-.715 1.502 0l5.7 9.83c.414.715.08 1.29-.747 1.29H2.296c-.827 0-1.161-.575-.747-1.29l5.7-9.83Z"
                                          strokeLinejoin="round"
                                        />
                                      </svg>
                                      Drips disabled
                                    </span>
                                  ) : null}
                                  {deal.crew?.name ? (
                                    <p className="text-[11px] text-slate-500">Crew • {deal.crew.name}</p>
                                  ) : null}
                                  {(() => {
                                    // For jobs pipeline, show invoice total; otherwise show proposal total
                                    if (useInvoiceTotals) {
                                      const invoiceSummary = invoiceSummaryByDealId.get(deal.id);
                                      if (!invoiceSummary) {
                                        return null;
                                      }

                                      const invoiceDestination = invoiceSummary.latestInvoiceId
                                        ? `/deals/${deal.id}/invoices/${invoiceSummary.latestInvoiceId}`
                                        : `/deals/${deal.id}`;

                                      return (
                                        <div className="pt-1" data-view-invoice>
                                          <button
                                            type="button"
                                            onClick={(event) => {
                                              event.stopPropagation();
                                              setNavigatingDealId(deal.id);
                                              startTransition(() => {
                                                navigate(invoiceDestination);
                                              });
                                            }}
                                            className="inline-flex w-full items-center gap-3 rounded border border-slate-200 bg-white px-2.5 py-1.5 text-left text-[11px] text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-500"
                                          >
                                            <div className="flex flex-col items-start">
                                              <span className="text-[12px] font-semibold text-slate-700">
                                                {formatCurrency(invoiceSummary.totalAmount)}
                                              </span>
                                              <span className="text-[10px] uppercase tracking-wide text-slate-400">
                                                {invoiceSummary.latestStatus === "paid"
                                                  ? "Paid"
                                                  : invoiceSummary.balanceDue > 0
                                                    ? `${formatCurrency(invoiceSummary.balanceDue)} due`
                                                    : "Invoice"}
                                              </span>
                                            </div>
                                          </button>
                                        </div>
                                      );
                                    }

                                    const proposalSummary = proposalSummaryByDealId.get(deal.id);
                                    if (!proposalSummary) {
                                      return null;
                                    }

                                    const summaryLabel =
                                      proposalSummary.latestStatus === "draft"
                                        ? proposalSummary.quoteCount > 1
                                          ? `${proposalSummary.quoteCount} quotes total`
                                          : null
                                        : proposalSummary.quoteCount > 1
                                          ? `${proposalSummary.quoteCount} quotes total`
                                          : quoteStatusLabels[proposalSummary.latestStatus];

                                    const proposalDestination =
                                      proposalSummary.latestQuoteId
                                        ? `/deals/${deal.id}/proposals/quote?quoteId=${proposalSummary.latestQuoteId}`
                                        : `/deals/${deal.id}/proposals/quote`;

                                    return (
                                      <div className="pt-1" data-view-proposal>
                                        <button
                                          type="button"
                                          onClick={(event) => {
                                            event.stopPropagation();
                                            setNavigatingDealId(deal.id);
                                            startTransition(() => {
                                              navigate(proposalDestination);
                                            });
                                          }}
                                          className="inline-flex w-full items-center gap-3 rounded border border-slate-200 bg-white px-2.5 py-1.5 text-left text-[11px] text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-500"
                                        >
                                          <div className="flex flex-col items-start">
                                            <span className="text-[12px] font-semibold text-slate-700">
                                              {formatCurrency(proposalSummary.totalAmount)}
                                            </span>
                                            {summaryLabel ? (
                                              <span className="text-[10px] uppercase tracking-wide text-slate-400">
                                                {summaryLabel}
                                              </span>
                                            ) : (
                                              <span className="text-[10px] uppercase tracking-wide text-slate-400">
                                                Proposal in progress
                                              </span>
                                            )}
                                            {proposalSummary.quoteCount > 1 && proposalSummary.latestStatus !== "draft" ? (
                                              <span className="text-[10px] text-slate-400">
                                                Latest status: {quoteStatusLabels[proposalSummary.latestStatus]}
                                              </span>
                                            ) : null}
                                          </div>
                                        </button>
                                      </div>
                                    );
                                  })()}
                                  {stageOption.id === "estimate_scheduled" && deal.latest_appointment ? (
                                    <div className="pt-1">
                                      <button
                                        type="button"
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          setOpenDealMenuId(null);
                                          setAppointmentDetailContext({
                                            deal,
                                            appointment: deal.latest_appointment!,
                                          });
                                        }}
                                        className={`inline-flex cursor-pointer items-center rounded border px-2 py-1 text-[11px] font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-500 ${isAppointmentTomorrow(deal.latest_appointment.scheduled_start)
                                          ? "border-rose-300 bg-rose-50 text-rose-600 hover:bg-rose-100"
                                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                                          }`}
                                        aria-haspopup="dialog"
                                      >
                                        {formatAppointmentDateLabel(deal.latest_appointment.scheduled_start)}
                                      </button>
                                    </div>
                                  ) : null}
                                  <div className="mt-auto flex justify-end pt-1">
                                    <p className="text-[10px] text-slate-400">{formatUpdatedAt(deal.updated_at)}</p>
                                  </div>
                                </article>
                              );
                            }}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {deals.length === 0 ? (
                          <p className="rounded border border-dashed border-slate-200 px-3 py-4 text-center text-[11px] text-slate-500">
                            Drop a deal here
                          </p>
                        ) : null}
                      </div>
                    </div>
                  )}
                </Droppable>
              );
            })}
          </section>

          {/* Mobile view - single column with stage selector */}
          <section
            className="flex md:hidden w-full flex-1 min-h-0 flex-col pb-4"
            aria-label="Deal pipeline board (mobile)"
          >
            {(() => {
              const stageOption = stages.find((s) => s.id === mobileSelectedStage);
              if (!stageOption) return null;

              const deals = columns[stageOption.id] ?? [];
              const stageHeaderTheme = DEAL_STAGE_HEADER_THEMES[stageOption.id];

              return (
                <Droppable droppableId={`mobile-${stageOption.id}`} key={`mobile-${stageOption.id}`}>
                  {(provided) => (
                    <div
                      className="flex h-full min-h-0 w-full max-h-full flex-col rounded-lg border border-slate-200 bg-slate-50"
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-3 py-3">
                        {deals.map((deal, index) => (
                          <Draggable
                            draggableId={`mobile-${deal.id}`}
                            index={index}
                            key={`mobile-${deal.id}`}
                            isDragDisabled={true}
                          >
                            {(dragProvided) => {
                              const destination = `/deals/${deal.id}`;

                              return (
                                <article
                                  ref={dragProvided.innerRef}
                                  className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm active:bg-slate-50 relative"
                                  {...dragProvided.draggableProps}
                                  {...dragProvided.dragHandleProps}
                                  onClick={(event) => {
                                    if (isAwaitingNavigation) return;

                                    const target = event.target as HTMLElement | null;
                                    if (
                                      target?.closest("[data-deal-actions]") ||
                                      target?.closest("[data-appointment-popover]") ||
                                      target?.closest("[data-view-proposal]")
                                    ) {
                                      return;
                                    }

                                    setNavigatingDealId(deal.id);
                                    startTransition(() => {
                                      navigate(destination);
                                    });
                                  }}
                                >
                                  {canManageDeals ? (
                                    <div className="absolute right-2 top-2 z-10" data-deal-actions>
                                      <button
                                        type="button"
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          closeAppointmentDetails();
                                          setOpenDealMenuId((current) => (current === deal.id ? null : deal.id));
                                        }}
                                        className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-xl leading-none text-slate-500 shadow-sm transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-700 active:bg-slate-200"
                                        aria-label="Open deal actions menu"
                                        aria-haspopup="menu"
                                        aria-expanded={openDealMenuId === deal.id}
                                      >
                                        ⋮
                                      </button>
                                      {openDealMenuId === deal.id ? (
                                        <div className="absolute right-0 mt-2 w-44 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                                          <button
                                            type="button"
                                            onClick={(event) => {
                                              event.stopPropagation();
                                              setOpenDealMenuId(null);
                                              closeAppointmentDetails();
                                              setScheduleContext({ mode: "existing", deal });
                                            }}
                                            className="w-full cursor-pointer px-4 py-3 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-100 active:bg-slate-200"
                                          >
                                            New appointment
                                          </button>
                                          <button
                                            type="button"
                                            onClick={(event) => {
                                              event.stopPropagation();
                                              setOpenDealMenuId(null);
                                              handleProposalCreated(deal);
                                            }}
                                            className="w-full px-4 py-3 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-100 active:bg-slate-200"
                                          >
                                            New proposal
                                          </button>
                                          <button
                                            type="button"
                                            onClick={(event) => {
                                              event.stopPropagation();
                                              handleCancelDrips(deal);
                                            }}
                                            disabled={dripActionDealId === deal.id}
                                            className="w-full px-4 py-3 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50 active:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                                          >
                                            {dripActionDealId === deal.id ? "Canceling…" : "Cancel drips"}
                                          </button>
                                        </div>
                                      ) : null}
                                    </div>
                                  ) : null}
                                  <p className="pr-12 text-base font-semibold text-slate-900">{formatName(deal)}</p>
                                  <p className="text-sm text-slate-500">
                                    {deal.lead_source ? `Source • ${deal.lead_source}` : "Source not set"}
                                  </p>
                                  <p className="text-sm text-slate-400">{formatLocation(deal)}</p>
                                  {deal.disable_drips ? (
                                    <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                                      <svg
                                        className="h-3.5 w-3.5"
                                        viewBox="0 0 16 16"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={1.5}
                                        aria-hidden
                                      >
                                        <path d="M8 3.5v5" strokeLinecap="round" />
                                        <circle cx="8" cy="10.5" r="0.75" fill="currentColor" />
                                        <path
                                          d="M7.249 1.98c.414-.715 1.088-.715 1.502 0l5.7 9.83c.414.715.08 1.29-.747 1.29H2.296c-.827 0-1.161-.575-.747-1.29l5.7-9.83Z"
                                          strokeLinejoin="round"
                                        />
                                      </svg>
                                      Drips disabled
                                    </span>
                                  ) : null}
                                  {deal.crew?.name ? (
                                    <p className="text-sm text-slate-500">Crew • {deal.crew.name}</p>
                                  ) : null}
                                  {(() => {
                                    if (useInvoiceTotals) {
                                      const invoiceSummary = invoiceSummaryByDealId.get(deal.id);
                                      if (!invoiceSummary) return null;

                                      const invoiceDestination = invoiceSummary.latestInvoiceId
                                        ? `/deals/${deal.id}/invoices/${invoiceSummary.latestInvoiceId}`
                                        : `/deals/${deal.id}`;

                                      return (
                                        <div className="pt-2" data-view-invoice>
                                          <button
                                            type="button"
                                            onClick={(event) => {
                                              event.stopPropagation();
                                              setNavigatingDealId(deal.id);
                                              startTransition(() => {
                                                navigate(invoiceDestination);
                                              });
                                            }}
                                            className="inline-flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-left text-sm text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 active:bg-slate-100"
                                          >
                                            <div className="flex flex-col items-start">
                                              <span className="text-base font-semibold text-slate-700">
                                                {formatCurrency(invoiceSummary.totalAmount)}
                                              </span>
                                              <span className="text-xs uppercase tracking-wide text-slate-400">
                                                {invoiceSummary.latestStatus === "paid"
                                                  ? "Paid"
                                                  : invoiceSummary.balanceDue > 0
                                                    ? `${formatCurrency(invoiceSummary.balanceDue)} due`
                                                    : "Invoice"}
                                              </span>
                                            </div>
                                          </button>
                                        </div>
                                      );
                                    }

                                    const proposalSummary = proposalSummaryByDealId.get(deal.id);
                                    if (!proposalSummary) return null;

                                    const summaryLabel =
                                      proposalSummary.latestStatus === "draft"
                                        ? proposalSummary.quoteCount > 1
                                          ? `${proposalSummary.quoteCount} quotes total`
                                          : null
                                        : proposalSummary.quoteCount > 1
                                          ? `${proposalSummary.quoteCount} quotes total`
                                          : quoteStatusLabels[proposalSummary.latestStatus];

                                    const proposalDestination =
                                      proposalSummary.latestQuoteId
                                        ? `/deals/${deal.id}/proposals/quote?quoteId=${proposalSummary.latestQuoteId}`
                                        : `/deals/${deal.id}/proposals/quote`;

                                    return (
                                      <div className="pt-2" data-view-proposal>
                                        <button
                                          type="button"
                                          onClick={(event) => {
                                            event.stopPropagation();
                                            setNavigatingDealId(deal.id);
                                            startTransition(() => {
                                              navigate(proposalDestination);
                                            });
                                          }}
                                          className="inline-flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-left text-sm text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 active:bg-slate-100"
                                        >
                                          <div className="flex flex-col items-start">
                                            <span className="text-base font-semibold text-slate-700">
                                              {formatCurrency(proposalSummary.totalAmount)}
                                            </span>
                                            {summaryLabel ? (
                                              <span className="text-xs uppercase tracking-wide text-slate-400">
                                                {summaryLabel}
                                              </span>
                                            ) : (
                                              <span className="text-xs uppercase tracking-wide text-slate-400">
                                                Proposal in progress
                                              </span>
                                            )}
                                          </div>
                                        </button>
                                      </div>
                                    );
                                  })()}
                                  {stageOption.id === "estimate_scheduled" && deal.latest_appointment ? (
                                    <div className="pt-2">
                                      <button
                                        type="button"
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          setOpenDealMenuId(null);
                                          setAppointmentDetailContext({
                                            deal,
                                            appointment: deal.latest_appointment!,
                                          });
                                        }}
                                        className={`inline-flex cursor-pointer items-center rounded-lg border px-3 py-2 text-sm font-medium transition active:opacity-80 ${
                                          isAppointmentTomorrow(deal.latest_appointment.scheduled_start)
                                            ? "border-rose-300 bg-rose-50 text-rose-600"
                                            : "border-slate-200 bg-white text-slate-600"
                                        }`}
                                        aria-haspopup="dialog"
                                      >
                                        {formatAppointmentDateLabel(deal.latest_appointment.scheduled_start)}
                                      </button>
                                    </div>
                                  ) : null}
                                  <div className="mt-auto flex justify-end pt-2">
                                    <p className="text-xs text-slate-400">{formatUpdatedAt(deal.updated_at)}</p>
                                  </div>
                                </article>
                              );
                            }}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {deals.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                              <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <p className="text-sm font-medium text-slate-600">No deals in this stage</p>
                            <p className="mt-1 text-xs text-slate-400">Deals will appear here when added</p>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  )}
                </Droppable>
              );
            })()}
          </section>
        </DragDropContext>
        <ScheduleDealModal
          open={Boolean(scheduleContext)}
          mode={scheduleContext?.mode ?? "existing"}
          companyId={companyId}
          companyName={companyName}
          deal={scheduleModalDeal}
          appointment={scheduleModalAppointment}
          onClose={() => setScheduleContext(null)}
          onScheduled={handleDealScheduled}
          onContactCreated={handleContactCreated}
          companyMembers={companyMembers}
        />
        <StageDripPromptDialog
          open={Boolean(stagePromptState)}
          stage={promptStageOption}
          sequence={promptSequence}
          dealLabel={promptDealLabel}
          defaultEnabled={promptDefaultEnabled}
          isSaving={isSchedulingStagePrompt}
          error={stagePromptError}
          onEnable={handleStagePromptEnable}
          onDisable={handleStagePromptDisable}
          onClose={handleStagePromptCancel}
        />
        <StageDripSettingsPanel
          open={Boolean(dripSettingsStageId)}
          companyId={companyId}
          pipelineId={activeDripPipeline}
          stage={activeDripStageOption}
          sequence={activeDripSequence}
          onClose={() => setDripSettingsStageId(null)}
          onSequenceChange={handleSequenceChange}
          onSequenceCleared={handleSequenceCleared}
        />
      </div>
    </>
  );
}
