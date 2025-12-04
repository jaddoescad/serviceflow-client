import type { AppointmentRecord, NewAppointmentPayload } from "@/features/appointments";
import type { CrewSummary } from "@/features/crews";
import type { ContactAddressRecord, ContactRecord } from "@/features/contacts";

export type DealPipelineId = "sales" | "jobs";

export type SalesDealStageId =
  | "cold_leads"
  | "estimate_scheduled"
  | "in_draft"
  | "proposals_sent"
  | "proposals_rejected";

export type JobsDealStageId =
  | "project_accepted"
  | "project_scheduled"
  | "project_in_progress"
  | "project_complete";

export type DealStageId = SalesDealStageId | JobsDealStageId;

export type DealStageOption = {
  id: DealStageId;
  label: string;
};

export type DealSourceRecord = {
  id: string;
  company_id: string;
  name: string;
  is_default: boolean;
  created_by_user_id: string | null;
  created_at?: string;
  updated_at?: string;
};

export type DealRecord = {
  id: string;
  company_id: string;
  contact_id: string | null;
  contact_address_id: string | null;
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  lead_source: string | null;
  stage: DealStageId;
  salesperson: string | null;
  project_manager: string | null;
  assigned_to: string | null;
  event_color: string | null;
  send_email: boolean;
  send_sms: boolean;
  disable_drips: boolean;
  crew_id: string | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  contact: ContactRecord | null;
  service_address: ContactAddressRecord | null;
  crew: CrewSummary | null;
  latest_appointment: AppointmentRecord | null;
};

export type DealSmsContact = {
  id: string;
  phone: string | null;
};

export type DealSmsContext = {
  id: string;
  contact_id: string | null;
  phone: string | null;
  salesperson: string | null;
  assigned_to: string | null;
  contact: DealSmsContact | null;
};

export type CreateDealInput = {
  company_id: string;
  contact_id?: string | null;
  contact_address_id?: string | null;
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  lead_source: string | null;
  stage: DealStageId;
  salesperson: string | null;
  project_manager: string | null;
  assigned_to?: string | null;
  crew_id?: string | null;
  event_color?: string | null;
  send_email?: boolean;
  send_sms?: boolean;
  disable_drips: boolean;
};

export type UpdateDealInput = {
  contact_id?: string | null;
  contact_address_id?: string | null;
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  lead_source: string | null;
  salesperson: string | null;
  project_manager: string | null;
  assigned_to: string | null;
  crew_id: string | null;
  event_color: string | null;
  send_email: boolean;
  send_sms: boolean;
  disable_drips: boolean;
};

export type ScheduleDealStageId = "estimate_scheduled" | "project_scheduled";

export type ReminderChannel = "both" | "email" | "sms" | "none";

export type ScheduleDealInput = {
  stage: ScheduleDealStageId;
  appointment: NewAppointmentPayload;
  deal: UpdateDealInput;
  communications?: {
    email?: {
      to: string;
      subject: string;
      body: string;
    };
    sms?: {
      to: string;
      body: string;
    };
  };
  // Reminder settings
  sendReminder?: boolean;
  reminderChannel?: ReminderChannel;
};

export type UpdateDealAppointmentInput = {
  appointmentId: string;
  appointment: NewAppointmentPayload;
  deal: UpdateDealInput;
  communications?: {
    email?: {
      to: string;
      subject: string;
      body: string;
    };
    sms?: {
      to: string;
      body: string;
    };
  };
  // Reminder settings
  sendReminder?: boolean;
  reminderChannel?: ReminderChannel;
};

export type UpdateDealDetailsInput = {
  contact_id: string | null;
  contact_address_id: string | null;
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  lead_source: string | null;
  salesperson: string | null;
  project_manager: string | null;
  crew_id: string | null;
  disable_drips: boolean;
  // Note: stage must be updated separately via updateDealStage()
};

// Pagination types
export type PaginationMeta = {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export type DealListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  pipeline?: string;
  stage?: string;
  salesperson?: string;
  lead_source?: string;
};

export type DealListSummary = {
  totalDeals: number;
  salespeople: string[];
  leadSources: string[];
};

export type PaginatedDealListResponse = {
  data: DealRecord[];
  pagination: PaginationMeta;
  summary: DealListSummary;
};
