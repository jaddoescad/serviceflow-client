"use client";

import { useId } from "react";
import { APPOINTMENT_TYPE_LABEL } from "@/features/appointments";
import {
  formatAppointmentDateDetail,
  formatAppointmentStartTime,
  formatAppointmentTimeRange,
  formatDealServiceAddress,
} from "@/lib/appointments-format";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "@/components/shared/modal";
import type { AppointmentRecord } from "@/features/appointments";
import type { DealRecord } from "@/features/deals";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (value: string | null | undefined) => !!value && UUID_REGEX.test(value);

type AppointmentDetailsDialogProps = {
  open: boolean;
  appointment: AppointmentRecord | null;
  deal: DealRecord | null;
  onClose: () => void;
  onEdit?: () => void;
  assigneeDisplayName?: string | null;
};

export function AppointmentDetailsDialog({
  open,
  appointment,
  deal,
  onClose,
  onEdit,
  assigneeDisplayName,
}: AppointmentDetailsDialogProps) {
  const titleId = useId();

  if (!open || !appointment || !deal) {
    return null;
  }

  const displayName = `${deal.first_name || deal.contact?.first_name || ""} ${
    deal.last_name || deal.contact?.last_name || ""
  }`.trim();
  const contactName = displayName || "Client";
  const phone = deal.phone?.trim() || deal.contact?.phone?.trim() || null;
  const address = formatDealServiceAddress(deal.service_address);
  const appointmentNotes = appointment.appointment_notes?.trim() || null;

  const assignedName =
    assigneeDisplayName?.trim() ||
    (appointment.assigned_to && !isUuid(appointment.assigned_to) ? appointment.assigned_to.trim() : "");
  const fallbackAssignee = deal.salesperson?.trim() || "Unassigned";
  const assigneeLabel = assignedName || fallbackAssignee;

  return (
    <Modal
      open={open}
      onClose={onClose}
      labelledBy={titleId}
      ariaLabel="Appointment details"
      size="md"
      align="center"
    >
      <ModalHeader
        title={contactName}
        titleId={titleId}
        onClose={onClose}
        className="pb-3"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
          Appointment Details
        </p>
      </ModalHeader>

      <ModalBody className="text-[12px] text-slate-700">
        <dl className="space-y-2">
          <DetailRow label="Type" value={APPOINTMENT_TYPE_LABEL} />
          <DetailRow label="Event Assignee" value={assigneeLabel} />
          <DetailRow label="Name" value={contactName} />
          <DetailRow
            label="Date"
            value={formatAppointmentDateDetail(appointment.scheduled_start)}
          />
          <DetailRow
            label="Time"
            value={formatAppointmentTimeRange(
              appointment.scheduled_start,
              appointment.scheduled_end
            )}
            secondary={formatAppointmentStartTime(appointment.scheduled_start)}
          />
          <DetailRow label="Phone" value={phone ?? "Phone unavailable"} />
          <DetailRow label="Address" value={address ?? "Address unavailable"} />
          {appointmentNotes ? <DetailRow label="Notes" value={appointmentNotes} multiLine /> : null}
        </dl>
      </ModalBody>

      <ModalFooter className="justify-between">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-slate-200 px-3 py-1.5 text-[11px] font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
        >
          Close
        </button>
        {onEdit ? (
          <button
            type="button"
            onClick={() => {
              onEdit();
              onClose();
            }}
            className="rounded-md bg-slate-900 px-3 py-1.5 text-[11px] font-medium text-white transition hover:bg-slate-800"
          >
            Edit appointment
          </button>
        ) : null}
      </ModalFooter>
    </Modal>
  );
}

type DetailRowProps = {
  label: string;
  value: string;
  secondary?: string;
  multiLine?: boolean;
};

function DetailRow({ label, value, secondary, multiLine = false }: DetailRowProps) {
  return (
    <div className="flex items-start gap-2">
      <dt className="w-32 shrink-0 text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">
        {label}
      </dt>
      <dd className={`flex-1 text-[12px] text-slate-700 ${multiLine ? "whitespace-pre-wrap" : ""}`}>
        <span className="font-medium text-slate-700">{value}</span>
        {secondary && secondary !== value ? (
          <span className="ml-1 text-[11px] text-slate-400">({secondary})</span>
        ) : null}
      </dd>
    </div>
  );
}
