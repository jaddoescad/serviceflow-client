// Types
export type {
  AppointmentRecord,
  CreateAppointmentInput,
  NewAppointmentPayload,
  AppointmentCalendarDeal,
  AppointmentCalendarRecord,
  AppointmentCalendarEvent,
  AppointmentCalendarResponse,
} from "./types";

// Constants
export {
  APPOINTMENT_FIELDS,
  APPOINTMENT_CALENDAR_FIELDS,
  APPOINTMENT_TYPE_LABEL,
  APPOINTMENT_DEFAULT_EMAIL_SUBJECT,
  APPOINTMENT_DEFAULT_EMAIL_BODY,
  APPOINTMENT_DEFAULT_SMS_BODY,
} from "./constants";

// Query Keys
export { appointmentKeys } from "./query-keys";

// API
export { fetchCalendarAppointments, type CalendarScope } from "./api";

// Hooks
export { useCalendarAppointments, useInvalidateAppointments } from "./hooks";

// Utils
export { mapAppointmentsToCalendarEvents } from "./utils";
