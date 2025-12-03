import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { requestCalendarAppointments } from '@/lib/appointments-calendar-api';
import { buildMonthRange } from '@/lib/calendar-month';

type CalendarType = 'appointments' | 'jobs';

export function useCalendarAppointments(
  companyId: string | undefined,
  type: CalendarType,
  month: Date
) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();

  return useQuery({
    queryKey: queryKeys.calendar.appointments(companyId!, type, year, monthIndex),
    queryFn: async () => {
      const range = buildMonthRange(month);
      const { response, data } = await requestCalendarAppointments(range, type, companyId!);

      if (!response.ok || !data) {
        throw new Error(`Failed to load ${type} calendar`);
      }

      return data;
    },
    enabled: !!companyId,
  });
}
