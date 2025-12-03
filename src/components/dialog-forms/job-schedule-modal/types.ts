import type { DealRecord, ScheduleDealInput } from "@/features/deals";
import type { AppointmentRecord } from "@/types/appointments";
import type { CompanyMemberRecord } from "@/types/company-members";
import type { CommunicationTemplateSnapshot } from "@/types/communication-templates";

export type JobScheduleModalProps = {
  open: boolean;
  mode: "existing" | "edit";
  companyId: string;
  companyName?: string;
  deal: DealRecord | null;
  appointment: AppointmentRecord | null;
  onClose: () => void;
  onScheduled: (deal: DealRecord) => void;
  companyMembers?: CompanyMemberRecord[];
  jobScheduleTemplate?: CommunicationTemplateSnapshot;
};

export type FormState = {
  projectManager: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  sendEmail: boolean;
  sendSms: boolean;
  emailSubject: string;
  emailMessage: string;
  smsMessage: string;
  emailRecipients: string;
  smsRecipients: string;
  crewId: string;
};

export const TEMPLATE_TOKENS = [
  "{first_name}",
  "{last_name}",
  "{client_name}",
  "{customer_name}",
  "{company_name}",
  "{company_phone}",
  "{company_website}",
  "{job_date}",
  "{job_time}",
  "{appointment_date}",
  "{appointment_time}",
  "{job_address}",
  "{job_schedule}",
  "{work_order_button}",
];

export const JOB_DEFAULT_EMAIL_SUBJECT = "Your job is scheduled with {company_name}";
export const JOB_DEFAULT_EMAIL_BODY =
  "Hi {client_name},\n\nYour job is scheduled for {job_date} at {job_time}.\nAddress: {job_address}\n\nIf you need to reschedule, reply to this email.";
export const JOB_DEFAULT_SMS_BODY =
  "Your job is scheduled for {job_date} at {job_time}. {job_address}";

export const TIME_STEP_MINUTES = 30;
export const DAY_START_MINUTES = 6 * 60;
export const DAY_END_MINUTES = 21 * 60;
