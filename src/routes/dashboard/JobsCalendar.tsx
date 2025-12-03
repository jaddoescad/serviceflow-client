import { useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSessionContext, useCompanyContext, useMembersContext } from "@/contexts/AuthContext";
import { AppointmentsCalendar } from "@/components/appointments/appointments-calendar";
import type { AppointmentsCalendarCopy } from "@/components/appointments/appointments-calendar";
import { useContactsList } from "@/hooks";
import {
  useCalendarAppointments,
  mapAppointmentsToCalendarEvents,
  type AppointmentCalendarEvent,
} from "@/features/appointments";
import {
  addMonths,
  buildMonthHref,
  parseMonthFromParams,
  type MonthSearchParams,
} from "@/lib/calendar-month";
import { AppointmentsCalendarSkeleton } from "@/components/ui/skeleton";

const JOB_CALENDAR_PATH = "/jobs/calendar";

const JOB_CALENDAR_COPY: Partial<AppointmentsCalendarCopy> = {
  summaryLabel: (count) =>
    count === 1
      ? "Showing 1 scheduled job this month"
      : `Showing ${count} scheduled jobs this month`,
  emptyDayLabel: "No jobs scheduled",
};

const SCHEDULED_JOB_STAGE_IDS = new Set(["project_scheduled", "project_in_progress", "project_complete"]);

function extractParams(searchParams: URLSearchParams): MonthSearchParams {
  const params: MonthSearchParams = {};
  const year = searchParams.get('year');
  const month = searchParams.get('month');
  if (year) params.year = year;
  if (month) params.month = month;
  return params;
}

export default function JobsCalendarPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isLoading: authLoading } = useSessionContext();
  const { company } = useCompanyContext();
  const { companyMembers } = useMembersContext();

  const monthParams = extractParams(searchParams);
  const month = parseMonthFromParams(monthParams);

  const { data: calendarData, isLoading: calendarLoading } = useCalendarAppointments(
    company?.id,
    "jobs",
    month
  );
  const { data: contactsData } = useContactsList(company?.id);
  const contacts = contactsData?.rows ?? [];

  const pageData = useMemo(() => {
    if (!calendarData || !company) return null;

    const assigneeNameByUserId = new Map(
      companyMembers
        .map((member) => ({
          id: member.user_id,
          name: member.display_name?.trim() || member.email || member.user_id,
        }))
        .map(({ id, name }) => [id, name] as const)
    );

    const contactNameByContactId = new Map(
      contacts.map((contact: any) => {
        const name =
          `${contact.first_name ?? ""} ${contact.last_name ?? ""}`.trim() ||
          contact.email ||
          contact.phone ||
          contact.id ||
          "Client";
        return [contact.id, name] as const;
      })
    );

    const eventsMap = mapAppointmentsToCalendarEvents(
      calendarData.appointments,
      assigneeNameByUserId,
      contactNameByContactId
    )
      .filter((event) => (event.stage ? SCHEDULED_JOB_STAGE_IDS.has(event.stage) : false))
      .reduce<Map<string, AppointmentCalendarEvent>>((acc, event) => {
        if (!event.dealId) return acc;
        const existing = acc.get(event.dealId);
        if (!existing) {
          acc.set(event.dealId, event);
          return acc;
        }
        const existingTime = new Date(existing.scheduledStart).valueOf();
        const nextTime = new Date(event.scheduledStart).valueOf();
        if (Number.isFinite(nextTime) && nextTime >= existingTime) {
          acc.set(event.dealId, event);
        }
        return acc;
      }, new Map());

    const events: AppointmentCalendarEvent[] = Array.from(eventsMap.values());

    const navigation = {
      prevHref: buildMonthHref(JOB_CALENDAR_PATH, addMonths(month, -1)),
      nextHref: buildMonthHref(JOB_CALENDAR_PATH, addMonths(month, 1)),
    };

    return {
      currentMonth: {
        year: month.getFullYear(),
        monthIndex: month.getMonth()
      },
      events,
      navigation
    };
  }, [calendarData, company, companyMembers, contacts, month]);

  useEffect(() => {
    if (authLoading) return;
    if (!company) {
      navigate("/organizations/select");
    }
  }, [authLoading, company, navigate]);

  if (authLoading || calendarLoading || !pageData) {
    return (
      <div className="flex min-h-0 flex-1 flex-col p-4 lg:p-6">
        <AppointmentsCalendarSkeleton />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col p-4 lg:p-6">
      <AppointmentsCalendar
        currentMonth={pageData.currentMonth}
        events={pageData.events}
        navigation={pageData.navigation}
        copy={JOB_CALENDAR_COPY}
      />
    </div>
  );
}
