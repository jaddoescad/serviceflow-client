import type { AppointmentRecord } from "@/types/appointments";
import type { DealRecord } from "@/features/deals";
import type { ContactAddressRecord } from "@/types/contacts";
import { apiClient } from "@/services/api";

const buildDealName = (deal: DealRecord) => {
  const name = `${deal.first_name ?? ""} ${deal.last_name ?? ""}`.trim();
  return name || deal.email || deal.phone || "Appointment";
};

const formatAddress = (address: ContactAddressRecord | null | undefined) => {
  if (!address) return null;

  const parts = [
    address.address_line1,
    address.address_line2,
    address.city,
    address.state,
    address.postal_code,
  ]
    .map((part) => part?.trim())
    .filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : null;
};

const buildAddress = (deal: DealRecord) => {
  // Prefer service_address; fallback to contact's first address if present.
  const serviceAddress = formatAddress(deal.service_address);
  if (serviceAddress) return serviceAddress;

  const contactAddress = formatAddress(deal.contact?.addresses?.[0]);
  if (contactAddress) return contactAddress;

  return null;
};

const buildSummary = (deal: DealRecord, companyName?: string | null) => {
  const name = buildDealName(deal);
  const prefix = companyName?.trim() || "Appointment";
  return `${prefix} - ${name}`;
};

export const syncAppointmentToGoogle = async (
  deal: DealRecord,
  appointment: AppointmentRecord | null | undefined,
  companyName?: string | null
) => {
  if (!appointment) {
    return;
  }

  if (!appointment.scheduled_start || !appointment.scheduled_end) {
    return;
  }

  let location = buildAddress(deal);

  // Best-effort fetch of address if missing.
  if (!location) {
    try {
      const hydrated = await apiClient<DealRecord>(`/deals/${deal.id}`);
      location = buildAddress(hydrated);
    } catch (error) {
      // ignore and continue without location
    }
  }

  const payload = {
    id: appointment.id,
    dealId: deal.id,
    contactId: deal.contact_id,
    dealName: buildSummary(deal, companyName),
    scheduledStart: appointment.scheduled_start,
    scheduledEnd: appointment.scheduled_end,
    stage: deal.stage ?? null,
    assignedTo: appointment.assigned_to ?? deal.assigned_to ?? null,
    salesperson: deal.salesperson ?? null,
    location: location ?? undefined,
    notes:
      [
        appointment.appointment_notes ?? null,
        location ? `Address: ${location}` : null,
      ]
        .filter(Boolean)
        .join("\n") || null,
    eventColor: appointment.event_color ?? deal.event_color ?? null,
  };

  try {
    await apiClient("/google-calendar/sync", {
      method: "POST",
      body: JSON.stringify({ events: [payload] }),
    });
  } catch (error) {
    console.error("Failed to sync appointment to Google Calendar", error);
  }
};
