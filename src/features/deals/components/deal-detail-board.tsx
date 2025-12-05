"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { DealDetailSnapshot } from "@/types/deal-details";
import type { DealRecord, DealStageId, JobsDealStageId } from "../types";
import type { AppointmentRecord } from "@/types/appointments";
import type { ContactRecord } from "@/types/contacts";
import { DealSummaryCard } from "./deal-summary-card";
import { DealDocumentsCard } from "./deal-documents-card";
import { DealAttachmentsPanel } from "./deal-attachments-panel";
import { DealNotesPanel } from "./deal-notes-panel";
import { DealAppointmentsCard } from "./deal-appointments-card";
import { DealJobScheduleCard } from "./deal-job-schedule-card";
import { JobScheduleModal } from "@/components/dialog-forms/job-schedule-modal";
import { AppointmentDetailsDialog } from "@/components/appointments/appointment-details-dialog";
import { ScheduleDealModal } from "@/components/dialog-forms/schedule-deal-modal";
import { NewDealModal } from "@/components/dialog-forms/new-deal-modal";
import { DEAL_STAGE_OPTIONS, DEAL_STAGE_PIPELINE_MAP } from "../constants";
import { createDealNotesRepository } from "@/services/deal-notes";
import { scheduleDealDrips as scheduleDealDripsFunction } from "@/services/functions";
import { useSupabaseBrowserClient } from "@/hooks/useSupabaseBrowserClient";
import { useSessionContext } from "@/contexts/AuthContext";
import { useArchiveDeal, useUnarchiveDeal, useDeleteDeal, useUpdateDealStage } from "../hooks";
import { useNavigate } from "react-router-dom";
import type { DealNoteWithAuthor } from "@/types/deal-notes";
import { useDripSequences, type DripSequenceRecord } from "@/features/drips";

type DealDetailBoardProps = {
  snapshot: DealDetailSnapshot;
  companyId: string;
  companyName: string;
  currentUserId: string;
};

type ScheduleVariant = "estimate" | "job";

type ScheduleContext =
  | {
    variant: ScheduleVariant;
    mode: "existing";
    deal: DealRecord;
  }
  | {
    variant: ScheduleVariant;
    mode: "edit";
    deal: DealRecord;
    appointment: AppointmentRecord;
  }
  | {
    variant: ScheduleVariant;
    mode: "new";
  };

const JOB_APPOINTMENT_STAGES = new Set<JobsDealStageId>([
  "project_scheduled",
  "project_in_progress",
  "project_complete",
]);

const upsertAppointment = (appointments: AppointmentRecord[], next: AppointmentRecord | null) => {
  if (!next) {
    return appointments;
  }

  const index = appointments.findIndex((item) => item.id === next.id);
  if (index >= 0) {
    const copy = [...appointments];
    copy[index] = next;
    return copy;
  }

  return [...appointments, next].sort(
    (a, b) => new Date(a.scheduled_start).valueOf() - new Date(b.scheduled_start).valueOf()
  );
};

export function DealDetailBoard({
  snapshot,
  companyId,
  companyName,
  currentUserId,
}: DealDetailBoardProps) {
  const supabase = useSupabaseBrowserClient();
  const navigate = useNavigate();
  const { user } = useSessionContext();
  const [snapshotState, setSnapshotState] = useState(snapshot);
  const [scheduleContext, setScheduleContext] = useState<ScheduleContext | null>(null);
  const [appointmentDetailContext, setAppointmentDetailContext] = useState<
    | {
      deal: DealRecord;
      appointment: AppointmentRecord;
    }
    | null
  >(null);
  const [isEditDealOpen, setIsEditDealOpen] = useState(false);
  const [isTogglingDrips, setIsTogglingDrips] = useState(false);
  const [dripStatusMessage, setDripStatusMessage] = useState<string | null>(null);
  const dealNotesRepository = useMemo(() => createDealNotesRepository(), []);

  const archiveMutation = useArchiveDeal(companyId);
  const unarchiveMutation = useUnarchiveDeal(companyId);
  const deleteMutation = useDeleteDeal(companyId);
  const updateStageMutation = useUpdateDealStage(snapshotState.deal.id, companyId);
  const [stageChangeError, setStageChangeError] = useState<string | null>(null);
  const [isUpdatingStageWithDrips, setIsUpdatingStageWithDrips] = useState(false);

  // Fetch drip sequences for the current pipeline
  const currentPipelineId = DEAL_STAGE_PIPELINE_MAP[snapshotState.deal.stage];
  const { data: dripSequences } = useDripSequences(companyId, currentPipelineId);

  // Build a lookup map of drip sequences by stage
  const dripSequencesByStage = useMemo(() => {
    if (!dripSequences) return undefined;
    const map: Record<DealStageId, DripSequenceRecord> = {} as Record<DealStageId, DripSequenceRecord>;
    for (const seq of dripSequences) {
      map[seq.stage_id] = seq;
    }
    return map;
  }, [dripSequences]);

  // Build contacts list from deal's contact (no need to fetch all company contacts)
  const contactsState = useMemo(() => {
    const dealContact = snapshotState.deal.contact;
    return dealContact ? [dealContact] : [];
  }, [snapshotState.deal.contact]);

  const handleArchive = useCallback(() => {
    archiveMutation.mutate(snapshotState.deal.id, {
      onSuccess: () => {
        navigate("/sales");
      },
    });
  }, [archiveMutation, snapshotState.deal.id, navigate]);

  const handleUnarchive = useCallback(() => {
    unarchiveMutation.mutate(snapshotState.deal.id, {
      onSuccess: (data) => {
        // Update local state with unarchived deal
        setSnapshotState((prev) => ({
          ...prev,
          deal: { ...prev.deal, archived_at: null },
        }));
      },
    });
  }, [unarchiveMutation, snapshotState.deal.id]);

  const handleDelete = useCallback(() => {
    deleteMutation.mutate(snapshotState.deal.id, {
      onSuccess: () => {
        navigate("/sales");
      },
    });
  }, [deleteMutation, snapshotState.deal.id, navigate]);

  useEffect(() => {
    setSnapshotState(snapshot);
    setDripStatusMessage(null);
  }, [snapshot]);

  const closeAppointmentDetails = () => setAppointmentDetailContext(null);

  const handleDealScheduled = useCallback((updatedDeal: DealRecord) => {
    setSnapshotState((previous) => ({
      ...previous,
      deal: updatedDeal,
      appointments: upsertAppointment(previous.appointments, updatedDeal.latest_appointment ?? null),
    }));
    setScheduleContext(null);
  }, []);

  const handleAppointmentSelect = useCallback(
    (appointment: AppointmentRecord) => {
      setAppointmentDetailContext({ deal: snapshotState.deal, appointment });
    },
    [snapshotState.deal]
  );

  const handleCreateAppointment = useCallback(() => {
    closeAppointmentDetails();
    setScheduleContext({ variant: "estimate", mode: "existing", deal: snapshotState.deal });
  }, [snapshotState.deal]);

  const handleAppointmentEdit = useCallback(() => {
    if (!appointmentDetailContext) {
      return;
    }

    const context = appointmentDetailContext;
    closeAppointmentDetails();
    setScheduleContext({
      variant: "estimate",
      mode: "edit",
      deal: context.deal,
      appointment: context.appointment,
    });
  }, [appointmentDetailContext]);

  const openEditDealModal = useCallback(() => setIsEditDealOpen(true), []);

  const closeEditDealModal = useCallback(() => setIsEditDealOpen(false), []);

  const handleDealUpdated = useCallback((updatedDeal: DealRecord) => {
    setSnapshotState((previous) => ({
      ...previous,
      deal: updatedDeal,
      appointments: upsertAppointment(previous.appointments, updatedDeal.latest_appointment ?? null),
    }));
  }, []);

  const handleStageChange = useCallback(
    async (stage: DealStageId, enableDrips: boolean) => {
      setStageChangeError(null);
      setIsUpdatingStageWithDrips(true);

      try {
        // First update the deal stage
        await new Promise<void>((resolve, reject) => {
          updateStageMutation.mutate(stage, {
            onSuccess: (updatedDeal) => {
              setSnapshotState((previous) => ({
                ...previous,
                deal: {
                  ...previous.deal,
                  stage: updatedDeal.stage,
                  disable_drips: !enableDrips,
                },
              }));
              resolve();
            },
            onError: (error) => {
              reject(error);
            },
          });
        });

        // Then schedule drips based on user choice
        await scheduleDealDripsFunction(supabase, {
          dealId: snapshotState.deal.id,
          stageId: stage,
          trigger: "stage_changed",
          enableDrips,
          cancelExistingJobs: false,
        });
      } catch (error) {
        console.error("Failed to change stage or schedule drips", error);
        setStageChangeError(
          error instanceof Error
            ? error.message
            : "We couldn't complete this stage change. Please try again."
        );
      } finally {
        setIsUpdatingStageWithDrips(false);
      }
    },
    [updateStageMutation, supabase, snapshotState.deal.id]
  );

  const handleDripToggle = useCallback(async (enable: boolean) => {
    setIsTogglingDrips(true);
    setDripStatusMessage(null);

    try {
      const result = await scheduleDealDripsFunction(supabase, {
        dealId: snapshotState.deal.id,
        stageId: snapshotState.deal.stage as DealStageId,
        trigger: "manual_toggle",
        enableDrips: enable,
        cancelExistingJobs: false,
      });

      setSnapshotState((previous) => ({
        ...previous,
        deal: {
          ...previous.deal,
          disable_drips: !enable,
        },
      }));

      if (result?.warning) {
        setDripStatusMessage(result.warning);
      } else if (enable) {
        setDripStatusMessage(
          result?.resumedExistingJobs
            ? "Drips resumed from the current sequence."
            : "Drips enabled for this deal."
        );
      } else {
        setDripStatusMessage("Drips paused for this deal.");
      }
    } catch (error) {
      console.error("Failed to update drips", error);
      setDripStatusMessage(
        error instanceof Error
          ? error.message
          : "We couldn't update the drips for this deal. Please try again."
      );
    } finally {
      setIsTogglingDrips(false);
    }
  }, [snapshotState.deal.id, snapshotState.deal.stage, supabase]);

  // Appointments now include assignee_name from the RPC
  const appointmentDetailAssigneeName =
    appointmentDetailContext?.appointment
      ? (appointmentDetailContext.appointment as any).assignee_name ??
        appointmentDetailContext.deal.salesperson ??
        null
      : null;

  const isEstimateScheduleOpen = scheduleContext?.variant === "estimate";
  const isJobScheduleOpen = scheduleContext?.variant === "job";

  const estimateScheduleMode = isEstimateScheduleOpen ? scheduleContext.mode : "existing";
  const scheduleModalDeal =
    isEstimateScheduleOpen && (scheduleContext.mode === "existing" || scheduleContext.mode === "edit")
      ? scheduleContext.deal
      : null;

  const scheduleModalAppointment =
    isEstimateScheduleOpen && scheduleContext.mode === "edit" ? scheduleContext.appointment : null;

  const jobScheduleModalDeal =
    isJobScheduleOpen && scheduleContext && scheduleContext.mode !== "new"
      ? scheduleContext.deal
      : null;
  const jobScheduleModalAppointment =
    isJobScheduleOpen && scheduleContext?.mode === "edit" ? scheduleContext.appointment : null;
  const jobScheduleMode: "existing" | "edit" =
    isJobScheduleOpen && scheduleContext?.mode === "edit" ? "edit" : "existing";

  const isJobPipeline = useMemo(
    () => DEAL_STAGE_PIPELINE_MAP[snapshotState.deal.stage] === "jobs",
    [snapshotState.deal.stage]
  );

  const jobAppointmentForCard = useMemo(() => {
    if (!isJobPipeline) {
      return null;
    }

    const stage = snapshotState.deal.stage as JobsDealStageId;
    return JOB_APPOINTMENT_STAGES.has(stage) ? snapshotState.deal.latest_appointment ?? null : null;
  }, [isJobPipeline, snapshotState.deal.latest_appointment, snapshotState.deal.stage]);

  const openJobScheduleModal = useCallback(() => {
    if (!isJobPipeline) {
      return;
    }

    if (jobAppointmentForCard) {
      setScheduleContext({
        variant: "job",
        mode: "edit",
        deal: snapshotState.deal,
        appointment: jobAppointmentForCard,
      });
      return;
    }

    setScheduleContext({ variant: "job", mode: "existing", deal: snapshotState.deal });
  }, [isJobPipeline, jobAppointmentForCard, snapshotState.deal]);

  // Get current user's display name for new notes
  const currentUserDisplayName = user?.user_metadata?.display_name || user?.email || "Team Member";

  const handleNoteCreated = useCallback(
    async (body: string) => {
      const newNote = await dealNotesRepository.createNote({
        companyId,
        dealId: snapshotState.deal.id,
        authorUserId: currentUserId,
        body,
      });

      const noteRecord: DealNoteWithAuthor = {
        id: newNote.id,
        body: newNote.body,
        created_at: newNote.created_at,
        author_user_id: newNote.author_user_id,
        author: currentUserDisplayName,
      };

      setSnapshotState((previous) => ({
        ...previous,
        notes: [noteRecord, ...previous.notes],
      }));

      return noteRecord;
    },
    [companyId, currentUserId, currentUserDisplayName, dealNotesRepository, snapshotState.deal.id]
  );

  return (
    <div className="flex flex-1 w-full flex-col gap-4 overflow-y-auto px-4 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start lg:gap-6 lg:px-6">
      <AppointmentDetailsDialog
        open={Boolean(appointmentDetailContext)}
        appointment={appointmentDetailContext?.appointment ?? null}
        deal={appointmentDetailContext?.deal ?? null}
        assigneeDisplayName={appointmentDetailAssigneeName}
        onClose={closeAppointmentDetails}
        onEdit={appointmentDetailContext ? handleAppointmentEdit : undefined}
      />

      <ScheduleDealModal
        open={isEstimateScheduleOpen}
        mode={estimateScheduleMode}
        companyId={companyId}
        companyName={companyName}
        deal={scheduleModalDeal}
        appointment={scheduleModalAppointment}
        contacts={contactsState}
        onClose={() => setScheduleContext(null)}
        onScheduled={handleDealScheduled}
      />

      <JobScheduleModal
        open={isJobScheduleOpen}
        mode={jobScheduleMode}
        companyId={companyId}
        companyName={companyName}
        deal={jobScheduleModalDeal}
        appointment={jobScheduleModalAppointment}
        onClose={() => setScheduleContext(null)}
        onScheduled={handleDealScheduled}
      />

      <NewDealModal
        open={isEditDealOpen}
        onClose={closeEditDealModal}
        companyId={companyId}
        stages={DEAL_STAGE_OPTIONS}
        contacts={contactsState}
        mode="edit"
        deal={snapshotState.deal}
        onUpdated={handleDealUpdated}
      />

      <aside className="lg:sticky lg:top-14 lg:max-h-[calc(100vh-3.5rem)] lg:overflow-y-auto lg:pr-1">
        <div className="lg:pt-4">
          <DealSummaryCard
            snapshot={snapshotState}
            onEdit={openEditDealModal}
            onArchive={handleArchive}
            onUnarchive={handleUnarchive}
            onDelete={handleDelete}
            isArchiving={archiveMutation.isPending}
            isUnarchiving={unarchiveMutation.isPending}
            isDeleting={deleteMutation.isPending}
            onToggleDrips={handleDripToggle}
            isTogglingDrips={isTogglingDrips}
            dripStatusMessage={dripStatusMessage}
            dripSequencesByStage={dripSequencesByStage}
            onStageChange={handleStageChange}
            isUpdatingStage={updateStageMutation.isPending || isUpdatingStageWithDrips}
            stageChangeError={stageChangeError}
          />
        </div>
      </aside>

      <section className="flex min-h-0 min-w-0 flex-col gap-4 py-3 lg:py-4">
        {isJobPipeline ? (
          <DealJobScheduleCard
            deal={snapshotState.deal}
            appointment={jobAppointmentForCard}
            onSchedule={openJobScheduleModal}
          />
        ) : null}
        <DealDocumentsCard
          companyId={companyId}
          dealId={snapshotState.deal.id}
          proposals={snapshotState.proposals}
          invoices={snapshotState.invoices}
          isArchived={Boolean(snapshotState.deal.archived_at)}
        />
        <DealAppointmentsCard
          appointments={snapshotState.appointments}
          onCreate={snapshotState.deal.archived_at ? undefined : handleCreateAppointment}
          onSelect={handleAppointmentSelect}
        />
        <DealNotesPanel
          notes={snapshotState.notes}
          onCreateNote={snapshotState.deal.archived_at ? undefined : handleNoteCreated}
        />
        <DealAttachmentsPanel attachments={snapshotState.attachments} />
      </section>
    </div>
  );
}
