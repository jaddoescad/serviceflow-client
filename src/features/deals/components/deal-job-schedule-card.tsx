"use client";

import { useMemo } from "react";
import { DEAL_STAGE_OPTIONS } from "../constants";
import type { AppointmentRecord } from "@/types/appointments";
import type { DealRecord } from "../types";

const STAGE_LABEL_MAP = new Map(DEAL_STAGE_OPTIONS.map((stage) => [stage.id, stage.label] as const));

const formatDateTime = (value: string | null | undefined): string | null => {
  if (!value) {
    return null;
  }

  try {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch (error) {
    console.error("Failed to format job schedule timestamp", error);
    return null;
  }
};

type AppointmentWithAssigneeName = AppointmentRecord & {
  assignee_name?: string | null;
};

type DealJobScheduleCardProps = {
  deal: DealRecord;
  appointment: AppointmentWithAssigneeName | null;
  onSchedule: () => void;
  className?: string;
};

export function DealJobScheduleCard({
  deal,
  appointment,
  onSchedule,
  className,
}: DealJobScheduleCardProps) {
  const stageLabel = useMemo(() => {
    return STAGE_LABEL_MAP.get(deal.stage) ?? deal.stage;
  }, [deal.stage]);

  const hasAppointment = Boolean(appointment);
  const buttonLabel = hasAppointment ? "Reschedule Job" : "Schedule Job";
  const scheduledStart = formatDateTime(appointment?.scheduled_start) ?? "Not scheduled";
  const scheduledEnd = formatDateTime(appointment?.scheduled_end);

  // Use assignee_name from RPC if available
  const assignedTo = appointment?.assignee_name
    ?? (deal.project_manager?.trim() || deal.salesperson?.trim() || null);
  const crewName = deal.crew?.name ?? null;
  const notes = appointment?.appointment_notes?.trim() || null;

  return (
    <section
      className={`flex flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm ${className ?? ""}`.trim()}
    >
      <header className="mb-3 flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Job Schedule</h3>
          <p className="text-[11px] font-medium text-slate-500">
            Current Stage:
            <span className="ml-1 text-slate-900">{stageLabel}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={onSchedule}
          className="cursor-pointer rounded-md bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm transition hover:from-emerald-600 hover:via-teal-600 hover:to-sky-600"
        >
          {buttonLabel}
        </button>
      </header>

      {hasAppointment ? (
        <dl className="space-y-2 text-[12px] text-slate-600">
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Start</dt>
            <dd className="font-medium text-slate-900">{scheduledStart}</dd>
          </div>
          {scheduledEnd ? (
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">End</dt>
              <dd className="text-slate-700">{scheduledEnd}</dd>
            </div>
          ) : null}
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Assigned To</dt>
            <dd className="text-slate-700">{assignedTo ?? "Unassigned"}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Crew</dt>
            <dd className="text-slate-700">{crewName ?? "Unassigned"}</dd>
          </div>
          {notes ? (
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Notes</dt>
              <dd className="whitespace-pre-wrap text-slate-600">{notes}</dd>
            </div>
          ) : null}
        </dl>
      ) : (
        <p className="rounded border border-dashed border-slate-200 px-3 py-4 text-center text-[12px] text-slate-500">
          This job has not been scheduled yet.
        </p>
      )}
    </section>
  );
}
