export const APPOINTMENT_FIELDS =
  "id, company_id, deal_id, assigned_to, crew_id, event_color, scheduled_start, scheduled_end, appointment_notes, send_email, send_sms, created_at, updated_at";

const APPOINTMENT_CALENDAR_DEAL_FIELDS =
  "id, first_name, last_name, stage, salesperson, assigned_to, event_color";

export const APPOINTMENT_CALENDAR_FIELDS =
  `${APPOINTMENT_FIELDS}, deal:deals!appointments_deal_id_fkey(${APPOINTMENT_CALENDAR_DEAL_FIELDS})`;

export const APPOINTMENT_TYPE_LABEL = "On-Site Estimate";

export const APPOINTMENT_DEFAULT_EMAIL_SUBJECT = "Appointment Confirmation";
export const APPOINTMENT_DEFAULT_EMAIL_BODY =
  "Hi {first-name},\n\nYour appointment with {company-name} is scheduled for {job-date} at {job-time}.\nIf you need to reschedule, call {company-phone} or visit {company-website}.\n\nThanks,\n{company-name}";
export const APPOINTMENT_DEFAULT_SMS_BODY =
  "Appointment with {company-name} on {job-date} at {job-time}. Questions? {company-phone}";
