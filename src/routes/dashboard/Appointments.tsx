import { useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSessionContext, useCompanyContext, useMembersContext } from "@/contexts/AuthContext";
import { AppointmentsCalendar } from "@/components/appointments/appointments-calendar";
import { useContactsList, useDealsList } from "@/hooks";
import { useCalendarAppointments, mapAppointmentsToCalendarEvents } from "@/features/appointments";
import {
  addMonths,
  buildMonthHref,
  parseMonthFromParams,
  type MonthSearchParams,
} from "@/lib/calendar-month";
import { AppointmentsCalendarSkeleton } from "@/components/ui/skeleton";

const APPOINTMENTS_PATH = "/appointments";

function extractParams(searchParams: URLSearchParams): MonthSearchParams {
  const params: MonthSearchParams = {};
  const year = searchParams.get('year');
  const month = searchParams.get('month');
  if (year) params.year = year;
  if (month) params.month = month;
  return params;
}

export default function AppointmentsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isLoading: authLoading } = useSessionContext();
  const { company } = useCompanyContext();
  const { companyMembers } = useMembersContext();

  const monthParams = extractParams(searchParams);
  const month = parseMonthFromParams(monthParams);

  const { data: calendarData, isLoading: calendarLoading } = useCalendarAppointments(
    company?.id,
    "appointments",
    month
  );
  const { data: contactsData } = useContactsList(company?.id);
  const contacts = contactsData?.rows ?? [];
  const { data: deals = [] } = useDealsList(company?.id);

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

    const dealNameByDealId = new Map(
      deals.map((deal: any) => {
        const contact = Array.isArray(deal.contact) ? deal.contact[0] ?? null : (deal.contact ?? null);
        const name =
          `${contact?.first_name ?? deal.first_name ?? ""} ${contact?.last_name ?? deal.last_name ?? ""}`.trim() ||
          contact?.email ||
          contact?.phone ||
          deal.email ||
          deal.phone ||
          deal.id;
        return [deal.id, name] as const;
      })
    );

    const events = mapAppointmentsToCalendarEvents(
      calendarData.appointments,
      assigneeNameByUserId,
      contactNameByContactId,
      dealNameByDealId
    );

    const navigation = {
      prevHref: buildMonthHref(APPOINTMENTS_PATH, addMonths(month, -1)),
      nextHref: buildMonthHref(APPOINTMENTS_PATH, addMonths(month, 1)),
    };

    return {
      currentMonth: {
        year: month.getFullYear(),
        monthIndex: month.getMonth()
      },
      events,
      navigation
    };
  }, [calendarData, company, companyMembers, contacts, deals, month]);

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
      />
    </div>
  );
}
