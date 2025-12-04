import { APPOINTMENT_FIELDS } from "@/constants/appointments";
import { CONTACT_FIELDS } from "@/constants/contacts";
import { CREW_SUMMARY_FIELDS } from "@/constants/crews";
import type { DealPipelineId, DealStageId, DealStageOption } from "./types";

export const DEFAULT_DEAL_SOURCES = [
  "Google",
  "Facebook",
  "Word of Mouth",
  "Angi",
  "Yard Sign",
  "Repeat Customer",
  "Website",
  "Instagram",
  "Phone Call",
  "Mail",
  "Other",
] as const;

export const DEAL_FIELDS = [
  "id",
  "company_id",
  "contact_id",
  "contact_address_id",
  "first_name",
  "last_name",
  "email",
  "phone",
  "lead_source",
  "stage",
  "salesperson",
  "project_manager",
  "assigned_to",
  "crew_id",
  "event_color",
  "send_email",
  "send_sms",
  "disable_drips",
  "created_at",
  "updated_at",
  `contact:contacts!left(${CONTACT_FIELDS})`,
  `latest_appointment:appointments!deal_id(${APPOINTMENT_FIELDS})`,
  `crew:crews!deals_crew_id_fkey(${CREW_SUMMARY_FIELDS})`,
].join(", ");

export const DEAL_SMS_CONTEXT_FIELDS = [
  "id",
  "contact_id",
  "phone",
  "salesperson",
  "assigned_to",
  "contact:contacts!left(id, phone)",
].join(", ");

export const SALES_DEAL_STAGE_OPTIONS = [
  { id: "cold_leads", label: "Cold Deals" },
  { id: "estimate_scheduled", label: "Estimate Scheduled" },
  { id: "in_draft", label: "In Draft" },
  { id: "proposals_sent", label: "Proposal(s) Sent" },
  { id: "proposals_rejected", label: "Proposal(s) Rejected" },
] satisfies DealStageOption[];

// Sales stages that have drip sequences (excludes estimate_scheduled)
export const SALES_DRIP_STAGE_OPTIONS = SALES_DEAL_STAGE_OPTIONS.filter(
  (stage) => stage.id !== "estimate_scheduled"
);

export const JOBS_DEAL_STAGE_OPTIONS = [
  { id: "project_accepted", label: "Project Accepted" },
  { id: "project_scheduled", label: "Project Scheduled" },
  { id: "project_in_progress", label: "Project In Progress" },
  { id: "project_complete", label: "Project Complete" },
] satisfies DealStageOption[];

export const DEAL_STAGE_OPTIONS: DealStageOption[] = [
  ...SALES_DEAL_STAGE_OPTIONS,
  ...JOBS_DEAL_STAGE_OPTIONS,
];

export const DEAL_STAGE_HEADER_THEMES = {
  cold_leads: {
    backgroundClass: "bg-sky-50",
    borderClass: "border-sky-200",
    textClass: "text-sky-800",
    countTextClass: "text-sky-600",
  },
  estimate_scheduled: {
    backgroundClass: "bg-indigo-50",
    borderClass: "border-indigo-200",
    textClass: "text-indigo-800",
    countTextClass: "text-indigo-600",
  },
  in_draft: {
    backgroundClass: "bg-slate-100",
    borderClass: "border-slate-200",
    textClass: "text-slate-800",
    countTextClass: "text-slate-600",
  },
  proposals_sent: {
    backgroundClass: "bg-emerald-50",
    borderClass: "border-emerald-200",
    textClass: "text-emerald-800",
    countTextClass: "text-emerald-600",
  },
  proposals_rejected: {
    backgroundClass: "bg-rose-50",
    borderClass: "border-rose-200",
    textClass: "text-rose-800",
    countTextClass: "text-rose-600",
  },
  project_accepted: {
    backgroundClass: "bg-lime-50",
    borderClass: "border-lime-200",
    textClass: "text-lime-800",
    countTextClass: "text-lime-600",
  },
  project_scheduled: {
    backgroundClass: "bg-teal-50",
    borderClass: "border-teal-200",
    textClass: "text-teal-800",
    countTextClass: "text-teal-600",
  },
  project_in_progress: {
    backgroundClass: "bg-blue-50",
    borderClass: "border-blue-200",
    textClass: "text-blue-800",
    countTextClass: "text-blue-600",
  },
  project_complete: {
    backgroundClass: "bg-fuchsia-50",
    borderClass: "border-fuchsia-200",
    textClass: "text-fuchsia-800",
    countTextClass: "text-fuchsia-600",
  },
} satisfies Record<DealStageId, {
  backgroundClass: string;
  borderClass: string;
  textClass: string;
  countTextClass: string;
}>;

export const DEAL_STAGE_PIPELINE_MAP: Record<DealStageId, DealPipelineId> = {
  cold_leads: "sales",
  estimate_scheduled: "sales",
  in_draft: "sales",
  proposals_sent: "sales",
  proposals_rejected: "sales",
  project_accepted: "jobs",
  project_scheduled: "jobs",
  project_in_progress: "jobs",
  project_complete: "jobs",
};
