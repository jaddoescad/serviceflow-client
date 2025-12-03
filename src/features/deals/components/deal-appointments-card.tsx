"use client";

import { useMemo } from "react";
import type { AppointmentRecord } from "@/types/appointments";

const formatDateTime = (iso: string) => {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch (error) {
    console.error("Failed to format appointment", error);
    return iso;
  }
};

type AppointmentWithAssigneeName = AppointmentRecord & {
  assignee_name?: string | null;
};

type DealAppointmentsCardProps = {
  appointments: AppointmentWithAssigneeName[];
  className?: string;
  onCreate?: () => void;
  onSelect?: (appointment: AppointmentRecord) => void;
};

export function DealAppointmentsCard({
  appointments,
  className,
  onCreate,
  onSelect,
}: DealAppointmentsCardProps) {
  const sortedAppointments = useMemo(() => {
    return [...appointments].sort((a, b) => a.scheduled_start.localeCompare(b.scheduled_start));
  }, [appointments]);

  const resolveAssigneeLabel = (appointment: AppointmentWithAssigneeName) => {
    // Use assignee_name from RPC if available, otherwise fallback to assigned_to
    if (appointment.assignee_name) return appointment.assignee_name;
    const trimmed = appointment.assigned_to?.trim();
    if (!trimmed) return "Unassigned";
    return trimmed;
  };

  return (
    <section
      className={`flex flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm ${className ?? ""}`}
    >
      <header className="mb-2 flex items-center justify-between">
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Appointments
        </h3>
        {onCreate ? (
          <button
            type="button"
            onClick={onCreate}
            className="cursor-pointer rounded-md border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
          >
            Create Appointment
          </button>
        ) : null}
      </header>
      <ul className="flex flex-1 flex-col gap-2 overflow-auto">
        {sortedAppointments.map((appointment) => (
          <li key={appointment.id}>
            <button
              type="button"
              onClick={() => onSelect?.(appointment)}
              className="flex w-full cursor-pointer flex-col gap-1 rounded border border-slate-200 bg-white px-3 py-2 text-left text-[12px] text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-900">
                  {formatDateTime(appointment.scheduled_start)}
                </span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  {resolveAssigneeLabel(appointment)}
                </span>
              </div>
              {appointment.appointment_notes ? (
                <p className="text-[11px] text-slate-500">{appointment.appointment_notes}</p>
              ) : null}
            </button>
          </li>
        ))}
        {sortedAppointments.length === 0 ? (
          <li className="rounded border border-dashed border-slate-200 px-3 py-4 text-center text-[12px] text-slate-500">
            No appointments scheduled.
          </li>
        ) : null}
      </ul>
    </section>
  );
}
