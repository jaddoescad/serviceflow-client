import type { ScheduleDealModalCopy } from "./types";
import { formatTimeLabel, pad } from "@/lib/form-utils";

export const DEFAULT_MODAL_COPY: ScheduleDealModalCopy = {
  createHeader: "New On-Site Estimate",
  editHeader: "Edit On-Site Estimate",
  createAction: "Schedule",
  createPendingAction: "Scheduling…",
  editAction: "Update",
  editPendingAction: "Updating…",
};

export const NEW_CONTACT_OPTION = "__new_contact__";

export const DEFAULT_COLOR = "purple";
export const DEFAULT_START_TIME = "07:00";
export const DEFAULT_END_TIME = "08:00";

export const EVENT_COLORS = [
  { value: "purple", label: "Purple" },
  { value: "blue", label: "Blue" },
  { value: "green", label: "Green" },
  { value: "orange", label: "Orange" },
];

export const TIME_STEP_MINUTES = 15;
export const MIN_TIME_MINUTES = 7 * 60;
export const MAX_TIME_MINUTES = 19 * 60 + 30;

export const TIME_OPTIONS = (() => {
  const options: { value: string; label: string }[] = [];

  for (let totalMinutes = MIN_TIME_MINUTES; totalMinutes <= MAX_TIME_MINUTES; totalMinutes += TIME_STEP_MINUTES) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const value = `${pad(hours)}:${pad(minutes)}`;
    options.push({ value, label: formatTimeLabel(hours, minutes) });
  }

  return options;
})();

export const TEMPLATE_PARAMETERS = [
  { token: "{first_name}", label: "Client first name" },
  { token: "{last_name}", label: "Client last name" },
  { token: "{client_name}", label: "Client full name" },
  { token: "{company_name}", label: "Company name" },
  { token: "{salesperson}", label: "Salesperson" },
  { token: "{salesperson-signature}", label: "Salesperson signature" },
  { token: "{salesperson_signature}", label: "Salesperson signature" },
  { token: "{scheduled_start}", label: "Date & time" },
  { token: "{appointment_date}", label: "Appointment date" },
  { token: "{appointment_time}", label: "Appointment time" },
  { token: "{appointment_address}", label: "Appointment address" },
];
