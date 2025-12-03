import type { DealStageId } from "@/features/deals";

export type AppointmentRecord = {
  id: string;
  company_id: string;
  deal_id: string;
  assigned_to: string | null;
  crew_id: string | null;
  event_color: string | null;
  scheduled_start: string;
  scheduled_end: string;
  appointment_notes: string | null;
  send_email: boolean;
  send_sms: boolean;
  created_at: string;
  updated_at: string;
};

export type CreateAppointmentInput = {
  company_id: string;
  deal_id: string;
  assigned_to: string | null;
  crew_id: string | null;
  event_color: string | null;
  scheduled_start: string;
  scheduled_end: string;
  appointment_notes: string | null;
  send_email: boolean;
  send_sms: boolean;
};

export type NewAppointmentPayload = Omit<CreateAppointmentInput, "deal_id">;

export type AppointmentCalendarDeal = {
  id: string;
  contact_id: string | null;
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  stage: DealStageId;
  salesperson: string | null;
  assigned_to: string | null;
  event_color: string | null;
  contact: {
    id: string;
    first_name: string;
    last_name: string | null;
    email: string | null;
    phone: string | null;
  } | null;
};

export type AppointmentCalendarRecord = AppointmentRecord & {
  deal: AppointmentCalendarDeal | null;
};

export type AppointmentCalendarEvent = {
  id: string;
  dealId: string | null;
  contactId: string | null;
  dealName: string;
  scheduledStart: string;
  scheduledEnd: string;
  stage: DealStageId | null;
  assignedTo: string | null;
  salesperson: string | null;
  notes: string | null;
  eventColor: string | null;
};

export type AppointmentCalendarResponse = {
  appointments: AppointmentCalendarRecord[];
};
