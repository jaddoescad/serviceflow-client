import type { AppointmentCalendarRecord, AppointmentCalendarEvent } from "./types";

export const mapAppointmentsToCalendarEvents = (
  appointments: AppointmentCalendarRecord[],
  assigneeNameByUserId?: Map<string, string>,
  contactNameByContactId?: Map<string, string>,
  dealNameByDealId?: Map<string, string>
): AppointmentCalendarEvent[] => {
  return appointments
    .map((appointment) => {
      const deal = Array.isArray(appointment.deal)
        ? appointment.deal[0] ?? null
        : appointment.deal ?? null;

      const dealId = deal?.id ?? appointment.deal_id ?? null;
      if (!dealId) return null;

      const contact =
        deal && Array.isArray(deal.contact)
          ? deal.contact[0] ?? null
          : deal?.contact ?? null;

      const contactNameFromContact =
        `${contact?.first_name ?? ""} ${contact?.last_name ?? ""}`.trim();
      const contactNameFromDeal =
        `${deal?.first_name ?? ""} ${deal?.last_name ?? ""}`.trim();
      const dealEmail = deal?.email ?? null;
      const dealPhone = deal?.phone ?? null;
      const contactEmail = contact?.email ?? null;
      const contactPhone = contact?.phone ?? null;
      const contactId = contact?.id ?? deal?.contact_id ?? null;

      const contactNameFromMap = contactId
        ? contactNameByContactId?.get(contactId) ?? ""
        : "";
      const dealNameFromMap = dealNameByDealId?.get(dealId) ?? "";

      const dealName =
        contactNameFromContact ||
        contactNameFromMap ||
        dealNameFromMap ||
        contactNameFromDeal ||
        dealEmail ||
        dealPhone ||
        contactEmail ||
        contactPhone ||
        "Appointment";

      const eventColor = appointment.event_color ?? deal?.event_color ?? null;
      const assignedTo =
        assigneeNameByUserId?.get(appointment.assigned_to ?? "") ??
        appointment.assigned_to ??
        null;

      return {
        id: appointment.id,
        dealId,
        dealName,
        contactId,
        scheduledStart: appointment.scheduled_start,
        scheduledEnd: appointment.scheduled_end,
        stage: deal?.stage || null,
        assignedTo,
        salesperson: deal?.salesperson || null,
        notes: appointment.appointment_notes,
        eventColor,
      };
    })
    .filter((event): event is AppointmentCalendarEvent => event !== null);
};
