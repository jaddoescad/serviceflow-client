"use client";

import { useEffect, useMemo, useTransition } from "react";
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
  useInvoiceTotals = false,
}: KanbanBoardProps) {
  const supabase = useSupabaseBrowserClient();
  const navigate = useNavigate();
  const [isNavigating, startTransition] = useTransition();

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
      <div className="flex w-full h-full flex-col gap-3">
        <header className="flex flex-wrap items-start justify-between gap-3 pb-2 flex-shrink-0">
          <div className="flex min-w-[200px] flex-col gap-1">
            <h2 className="text-base font-semibold text-slate-900">{title ?? "Deal Pipeline"}</h2>
          </div>
          {canManageDeals && showNewActions ? (
            <div className="flex items-center gap-2">
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
            </div>
          ) : (
            <div aria-hidden className="flex items-center" />
          )}
        </header>
        <DragDropContext onDragEnd={handleDragEnd}>
          <section
            className="flex w-full flex-1 min-h-0 gap-3 overflow-x-auto overflow-y-hidden pb-4"
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
