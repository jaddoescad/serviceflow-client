import type { CompanyMemberRecord } from "@/types/company-members";
import type { DealRecord } from "@/features/deals";
import { pad, formatTimeLabel } from "@/lib/form-utils";
import {
  FormState,
  TIME_STEP_MINUTES,
  DAY_START_MINUTES,
  DAY_END_MINUTES,
} from "./types";

export const TIME_OPTIONS = (() => {
  const items: { value: string; label: string }[] = [];

  for (let minutes = DAY_START_MINUTES; minutes <= DAY_END_MINUTES; minutes += TIME_STEP_MINUTES) {
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    const value = `${pad(hours)}:${pad(remainder)}`;
    items.push({ value, label: formatTimeLabel(hours, remainder) });
  }

  return items;
})();

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isValidUuid = (value: string) => UUID_REGEX.test(value);

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

export const toDateInput = (value: Date): string => {
  const year = value.getFullYear();
  const month = pad(value.getMonth() + 1);
  const day = pad(value.getDate());
  return `${year}-${month}-${day}`;
};

export const toTimeInput = (value: Date): string => `${pad(value.getHours())}:${pad(value.getMinutes())}`;

export const parseDateTime = (date: string, time: string): Date | null => {
  if (!date || !time) {
    return null;
  }

  const [year, month, day] = date.split("-").map((part) => Number.parseInt(part, 10));
  const [hour, minute] = time.split(":").map((part) => Number.parseInt(part, 10));

  if ([year, month, day, hour, minute].some((part) => Number.isNaN(part))) {
    return null;
  }

  const result = new Date();
  result.setFullYear(year, month - 1, day);
  result.setHours(hour, minute, 0, 0);
  return Number.isNaN(result.getTime()) ? null : result;
};

export const formatDateParts = (iso: string | null | undefined) => {
  if (!iso) {
    return { date: "", time: "" };
  }

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return { date: "", time: "" };
  }

  return { date: toDateInput(date), time: toTimeInput(date) };
};

export const formatJobDate = (date: string) => {
  if (!date) return "";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatJobTime = (time: string) => {
  if (!time) return "";
  const [hours, minutes] = time.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return "";
  const period = hours >= 12 ? "PM" : "AM";
  const normalized = ((hours + 11) % 12) + 1;
  return `${normalized}:${pad(minutes)} ${period}`;
};

export const buildJobTemplateVars = (
  form: FormState,
  deal: DealRecord,
  companyName?: string | null
) => {
  const firstName = (deal.contact?.first_name || deal.first_name || "Client").trim();
  const lastName = (deal.contact?.last_name || deal.last_name || "").trim();
  const clientName = [firstName, lastName].filter(Boolean).join(" ") || "Client";
  const jobDate = formatJobDate(form.startDate) || "Date TBD";
  const jobTime = formatJobTime(form.startTime) || "Time TBD";
  const address = (() => {
    const addr = deal.service_address || deal.contact?.addresses?.[0] || null;
    if (!addr) return "";
    const parts = [
      addr.address_line1,
      addr.address_line2,
      addr.city,
      addr.state,
      addr.postal_code,
      addr.country,
    ]
      .map((part) => part?.trim())
      .filter(Boolean);
    return parts.join(", ");
  })();

  const schedule = [jobDate, jobTime].filter(Boolean).join(" at ");

  return {
    first_name: firstName || "Client",
    last_name: lastName || "",
    client_name: clientName,
    customer_name: clientName,
    company_name: companyName?.trim() || "Your Company",
    company_phone: "",
    company_website: "",
    job_date: jobDate,
    job_time: jobTime,
    appointment_date: jobDate,
    appointment_time: jobTime,
    job_address: address || "Address TBD",
    job_schedule: schedule || "Schedule TBD",
    work_order_button: "",
  };
};

export const getDealDisplayName = (deal: DealRecord | null): string => {
  if (!deal) {
    return "";
  }

  const contactName = [deal.contact?.first_name, deal.contact?.last_name]
    .filter((part) => part?.trim())
    .join(" ");

  const fallback = [deal.first_name, deal.last_name]
    .filter((part) => part?.trim())
    .join(" ");

  return contactName || fallback;
};

export const buildMemberOptions = (members: CompanyMemberRecord[]) => {
  const seen = new Set<string>();
  return members.reduce<{ value: string; label: string }[]>((acc, member) => {
    const label = member.display_name.trim() || member.email.trim() || member.email;
    if (!label || seen.has(label)) {
      return acc;
    }
    seen.add(label);
    acc.push({ value: label, label });
    return acc;
  }, []);
};

export const includeCurrentOption = (
  options: { value: string; label: string }[],
  value: string | null | undefined
) => {
  const trimmed = value?.trim();
  if (!trimmed) {
    return options;
  }

  if (options.some((option) => option.value === trimmed)) {
    return options;
  }

  return [{ value: trimmed, label: trimmed }, ...options];
};
