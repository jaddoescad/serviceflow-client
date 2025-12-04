import type { DealRecord } from "@/features/deals";
import type { ContactRecord, ContactAddressRecord } from "@/features/contacts";
import type { CompanyMemberRecord } from "@/features/companies";
import type { AppointmentRecord } from "@/features/appointments";
import type { FormState, AddressFormState, CommunicationMethod, MemberOption } from "./types";
import {
  DEFAULT_COLOR,
  DEFAULT_START_TIME,
  DEFAULT_END_TIME,
  TIME_OPTIONS,
  TIME_STEP_MINUTES,
} from "./constants";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isValidUuid = (value: string): boolean => UUID_REGEX.test(value);

export const EMPTY_ADDRESS_FORM: AddressFormState = {
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
};

// Template population
export const populateAppointmentTemplate = (
  template: string,
  vars: Record<string, string>
): string => {
  const toAliases = (key: string) => {
    const dashed = key.replace(/_/g, "-");
    const underscored = key.replace(/-/g, "_");
    return Array.from(new Set([key, dashed, underscored]));
  };

  const expanded = new Map<string, string>();
  Object.entries(vars).forEach(([key, value]) => {
    toAliases(key).forEach((alias) => {
      if (!expanded.has(alias)) {
        expanded.set(alias, value ?? "");
      }
    });
  });

  let result = template;
  expanded.forEach((value, key) => {
    const bracePattern = new RegExp(`\\{\\s*${key}\\s*\\}`, "gi");
    const doubleBracePattern = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, "gi");
    result = result.replace(doubleBracePattern, value).replace(bracePattern, value);
  });

  return result;
};

// Time utilities
export const isValidTimeValue = (value: string): boolean =>
  TIME_OPTIONS.some((option) => option.value === value);

export const coerceTimeValue = (value: string, fallback: string): string =>
  isValidTimeValue(value) ? value : fallback;

export const getTimeOffset = (value: string, offsetMinutes: number): string | null => {
  const steps = Math.round(offsetMinutes / TIME_STEP_MINUTES);
  if (steps <= 0) {
    return value;
  }

  const index = TIME_OPTIONS.findIndex((option) => option.value === value);
  if (index === -1) {
    return null;
  }

  const nextIndex = index + steps;
  if (nextIndex >= TIME_OPTIONS.length) {
    return null;
  }

  return TIME_OPTIONS[nextIndex]?.value ?? null;
};

// Date utilities
export const formatDateInput = (value: Date): string => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatTimeInput = (value: Date): string => {
  const hours = String(value.getHours()).padStart(2, "0");
  const minutes = String(value.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

export const formatAppointmentTime = (startTime: string): string => {
  const [hours, minutes] = startTime.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return "";
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = ((hours + 11) % 12) + 1;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
};

export const getDefaultSchedule = () => {
  const start = new Date();
  start.setDate(start.getDate() + 1);
  const [startHour, startMinute] = DEFAULT_START_TIME.split(":").map((part) => Number.parseInt(part, 10));
  start.setHours(startHour || 7, startMinute || 0, 0, 0);

  return {
    date: formatDateInput(start),
    startTime: DEFAULT_START_TIME,
    endTime: DEFAULT_END_TIME,
  };
};

export const toDateTimeParts = (value: string | null): { date: string; time: string } => {
  if (!value) {
    return { date: "", time: "" };
  }

  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return { date: "", time: "" };
    }

    return {
      date: formatDateInput(date),
      time: formatTimeInput(date),
    };
  } catch (error) {
    console.warn("Invalid datetime value provided to schedule modal", error);
    return { date: "", time: "" };
  }
};

export const buildDateTime = (date: string, time: string): Date | null => {
  if (!date || !time) {
    return null;
  }

  const [yearString, monthString, dayString] = date.split("-");
  const [hourString, minuteString = "00"] = time.split(":");

  const year = Number.parseInt(yearString, 10);
  const month = Number.parseInt(monthString, 10);
  const day = Number.parseInt(dayString, 10);
  const hours = Number.parseInt(hourString, 10);
  const minutes = Number.parseInt(minuteString, 10);

  if ([year, month, day, hours, minutes].some((part) => Number.isNaN(part))) {
    return null;
  }

  const candidate = new Date();
  candidate.setFullYear(year, month - 1, day);
  candidate.setHours(hours, minutes, 0, 0);

  if (Number.isNaN(candidate.getTime())) {
    return null;
  }

  return candidate;
};

// Communication method
export const determineCommunicationMethod = (sendEmail: boolean, sendSms: boolean): CommunicationMethod => {
  if (sendEmail && sendSms) return "both";
  if (sendEmail) return "email";
  if (sendSms) return "sms";
  return "none";
};

// Form state initialization
export const createInitialFormState = (
  deal: DealRecord | null,
  appointment: AppointmentRecord | null
): FormState => {
  const contact = deal?.contact ?? null;
  const latestAppointment = appointment ?? deal?.latest_appointment ?? null;
  const defaults = getDefaultSchedule();
  const startParts = toDateTimeParts(latestAppointment?.scheduled_start ?? null);
  const endParts = toDateTimeParts(latestAppointment?.scheduled_end ?? null);
  const scheduledDate = startParts.date || defaults.date;
  const startTime = coerceTimeValue(startParts.time, defaults.startTime);
  const inferredEndFromStart = getTimeOffset(startTime, 60) ?? defaults.endTime;
  const endTime = endParts.time && isValidTimeValue(endParts.time)
    ? endParts.time
    : inferredEndFromStart;

  return {
    firstName: contact?.first_name ?? deal?.first_name ?? "",
    lastName: contact?.last_name ?? deal?.last_name ?? "",
    email: contact?.email ?? deal?.email ?? "",
    phone: contact?.phone ?? deal?.phone ?? "",
    leadSource: deal?.lead_source ?? "",
    salesperson: deal?.salesperson ?? "",
    projectManager: deal?.project_manager ?? "",
    disableDrips: deal?.disable_drips ?? false,
    assignedTo: latestAppointment?.assigned_to ?? deal?.assigned_to ?? deal?.salesperson ?? "",
    eventColor: latestAppointment?.event_color ?? deal?.event_color ?? DEFAULT_COLOR,
    scheduledDate,
    startTime,
    endTime,
    communicationMethod: determineCommunicationMethod(
      latestAppointment?.send_email ?? deal?.send_email ?? false,
      latestAppointment?.send_sms ?? deal?.send_sms ?? false
    ),
    reminders: {
      email1DayBefore: true,
      email1HourBefore: true,
      sms1DayBefore: true,
      sms1HourBefore: true,
    },
    notes: latestAppointment?.appointment_notes ?? "",
  };
};

// Address utilities
export const mapContactAddressToForm = (address: ContactAddressRecord): AddressFormState => ({
  addressLine1: address.address_line1 ?? "",
  addressLine2: address.address_line2 ?? "",
  city: address.city ?? "",
  state: address.state ?? "",
  postalCode: address.postal_code ?? "",
  country: address.country ?? "",
});

export const formatAddressSummary = (address: ContactAddressRecord): string => {
  const parts = [
    address.address_line1,
    address.city,
    address.state,
    address.postal_code,
  ].filter((part) => Boolean(part && part.trim()));

  if (parts.length === 0) {
    return "Address not provided";
  }

  return parts.join(", ");
};

export const hasAddressFormContent = (address: AddressFormState): boolean => {
  return [
    address.addressLine1,
    address.addressLine2,
    address.city,
    address.state,
    address.postalCode,
    address.country,
  ].some((value) => value.trim() !== "");
};

// Contact utilities
export const sortContacts = (items: ContactRecord[]): ContactRecord[] => {
  return [...items].sort((a, b) => {
    const lastCompare = (a.last_name ?? "").localeCompare(b.last_name ?? "");
    if (lastCompare !== 0) {
      return lastCompare;
    }
    return (a.first_name ?? "").localeCompare(b.first_name ?? "");
  });
};

export const getContactDisplay = (contact: ContactRecord): string => {
  const name = `${contact.first_name ?? ""} ${contact.last_name ?? ""}`.trim();
  if (name) return name;
  if (contact.email) return contact.email;
  if (contact.phone) return contact.phone;
  return "Unnamed contact";
};

export const applyContactToForm = (form: FormState, contact: ContactRecord | null): FormState => {
  if (!contact) {
    return {
      ...form,
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    };
  }

  return {
    ...form,
    firstName: contact.first_name ?? "",
    lastName: contact.last_name ?? "",
    email: contact.email ?? "",
    phone: contact.phone ?? "",
  };
};

// Member utilities
export const resolveMemberUserId = (raw: string, members: CompanyMemberRecord[]): string | null => {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }

  if (isValidUuid(trimmed)) {
    return trimmed;
  }

  const match = members.find((member) => {
    if (member.user_id === trimmed || member.id === trimmed) {
      return true;
    }

    const display = member.display_name.trim().toLowerCase();
    if (display && display === trimmed.toLowerCase()) {
      return true;
    }

    const email = member.email.trim().toLowerCase();
    if (email && email === trimmed.toLowerCase()) {
      return true;
    }

    return false;
  });

  return match?.user_id ?? null;
};

export const getMemberLabel = (member: CompanyMemberRecord): string => {
  const display = member.display_name.trim();
  if (display) {
    return display;
  }
  return member.email.trim() || member.email;
};

export const buildMemberOptions = (members: CompanyMemberRecord[]): MemberOption[] => {
  const seen = new Set<string>();
  const options: MemberOption[] = [];

  for (const member of members) {
    const label = getMemberLabel(member);
    if (!label || seen.has(label)) {
      continue;
    }
    seen.add(label);
    options.push({ value: label, label });
  }

  return options;
};

export const includeCurrentValue = (
  options: MemberOption[],
  currentValue: string | null | undefined
): MemberOption[] => {
  const trimmed = currentValue?.trim();
  if (!trimmed) {
    return options;
  }

  if (options.some((option) => option.value === trimmed)) {
    return options;
  }

  return [{ value: trimmed, label: trimmed }, ...options];
};

// Template variable building
export const buildAppointmentTemplateVars = (
  form: FormState,
  addressForm: AddressFormState,
  companyName: string,
  companyPhone: string,
  companyWebsite: string
): Record<string, string> => {
  const trimmedFirst = form.firstName.trim();
  const trimmedLast = form.lastName.trim();
  const clientName = `${trimmedFirst || "Client"}${trimmedLast ? ` ${trimmedLast}` : ""}`;

  const appointmentDate = form.scheduledDate
    ? new Date(form.scheduledDate).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const appointmentTime = form.startTime ? formatAppointmentTime(form.startTime) : "";
  const scheduledStart = [appointmentDate, appointmentTime].filter(Boolean).join(" at ");

  const addressParts = [];
  if (addressForm.addressLine1.trim()) addressParts.push(addressForm.addressLine1.trim());
  if (addressForm.city.trim()) addressParts.push(addressForm.city.trim());
  if (addressForm.state.trim()) addressParts.push(addressForm.state.trim());
  if (addressForm.postalCode.trim()) addressParts.push(addressForm.postalCode.trim());
  const appointmentAddress = addressParts.join(", ");

  const salesperson = form.salesperson.trim();
  const salespersonSignature = salesperson || "Your rep";

  return {
    company_name: companyName?.trim() || "Your Company",
    company_phone: companyPhone || "",
    company_website: companyWebsite || "",
    first_name: trimmedFirst || "Client",
    last_name: trimmedLast || "",
    customer_name: clientName,
    client_name: clientName,
    sales_person: salesperson,
    salesperson,
    salesperson_signature: salespersonSignature,
    scheduled_start: scheduledStart || "Date/Time TBD",
    appointment_date: appointmentDate || "Date TBD",
    appointment_time: appointmentTime || "Time TBD",
    job_date: appointmentDate || "Date TBD",
    job_time: appointmentTime || "Time TBD",
    appointment_address: appointmentAddress || "Address TBD",
  };
};
