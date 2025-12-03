import { useQuery, useQueryClient } from "@tanstack/react-query";
import { appointmentKeys } from "./query-keys";
import { fetchCalendarAppointments, type CalendarScope } from "./api";
import { buildMonthRange } from "@/lib/calendar-month";

export function useCalendarAppointments(
  companyId: string | undefined,
  scope: CalendarScope,
  month: Date
) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();

  return useQuery({
    queryKey: appointmentKeys.calendar(companyId!, scope, year, monthIndex),
    queryFn: async () => {
      const range = buildMonthRange(month);
      const { response, data } = await fetchCalendarAppointments(
        range,
        scope,
        companyId!
      );

      if (!response.ok || !data) {
        throw new Error(`Failed to load ${scope} calendar`);
      }

      return data;
    },
    enabled: !!companyId,
  });
}

export function useInvalidateAppointments() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () =>
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all }),
    invalidateByCompany: (companyId: string) =>
      queryClient.invalidateQueries({ queryKey: appointmentKeys.list(companyId) }),
    invalidateCalendar: (
      companyId: string,
      scope: CalendarScope,
      year: number,
      month: number
    ) =>
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.calendar(companyId, scope, year, month),
      }),
  };
}
