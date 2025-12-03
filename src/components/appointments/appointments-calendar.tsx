import { Link } from "react-router-dom";
import { DEAL_STAGE_OPTIONS } from "@/features/deals";
import type { AppointmentCalendarEvent } from "@/features/appointments";
import { GoogleCalendarIntegration } from "./google-calendar-integration";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const stageLabelMap = new Map(DEAL_STAGE_OPTIONS.map((stage) => [stage.id, stage.label] as const));

const monthFormatter = new Intl.DateTimeFormat(undefined, {
  month: "long",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
});

export type AppointmentsCalendarCopy = {
  summaryLabel: (count: number) => string;
  emptyDayLabel: string;
};

const DEFAULT_COPY: AppointmentsCalendarCopy = {
  summaryLabel: (count) =>
    count === 1 ? "Showing 1 appointment this month" : `Showing ${count} appointments this month`,
  emptyDayLabel: "No appointments",
};

type AppointmentsCalendarProps = {
  currentMonth: {
    year: number;
    monthIndex: number;
  };
  events: AppointmentCalendarEvent[];
  navigation: {
    prevHref: string;
    nextHref: string;
  };
  copy?: Partial<AppointmentsCalendarCopy>;
};

export function AppointmentsCalendar({ currentMonth, events, navigation, copy }: AppointmentsCalendarProps) {
  const monthStartDate = new Date(currentMonth.year, currentMonth.monthIndex, 1);

  const days = buildCalendarDays(monthStartDate);
  const todayKey = formatDateKey(new Date());
  const monthKey = `${currentMonth.year}-${String(currentMonth.monthIndex + 1).padStart(2, "0")}`;

  const sortedEvents = [...events].sort((a, b) => {
    return new Date(a.scheduledStart).valueOf() - new Date(b.scheduledStart).valueOf();
  });

  const eventsByDay = new Map<string, AppointmentCalendarEvent[]>();

  sortedEvents.forEach((event) => {
    const key = event.scheduledStart.slice(0, 10);
    if (!eventsByDay.has(key)) {
      eventsByDay.set(key, []);
    }
    eventsByDay.get(key)?.push(event);
  });

  const appointmentCountForMonth = sortedEvents.filter((event) => event.scheduledStart.startsWith(monthKey)).length;
  const monthLabel = monthFormatter.format(monthStartDate);
  const copyText = { ...DEFAULT_COPY, ...(copy ?? {}) } satisfies AppointmentsCalendarCopy;
  const summaryText = copyText.summaryLabel(appointmentCountForMonth);

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-[20px] font-semibold text-slate-900">{monthLabel}</h1>
          <p className="text-[11px] text-slate-500">{summaryText}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <GoogleCalendarIntegration monthLabel={monthLabel} events={sortedEvents} />
          <div className="flex items-center gap-2 text-[11px] font-semibold">
            <Link
              to={navigation.prevHref}
              className="rounded-md border border-slate-200 px-2.5 py-1.5 text-slate-600 transition hover:bg-slate-100"
            >
              Previous Month
            </Link>
            <Link
              to={navigation.nextHref}
              className="rounded-md border border-slate-200 px-2.5 py-1.5 text-slate-600 transition hover:bg-slate-100"
            >
              Next Month
            </Link>
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-auto">
        <div className="min-w-[720px] grid grid-cols-7 gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          {WEEKDAY_LABELS.map((weekday) => (
            <div
              key={`weekday-${weekday}`}
              className="rounded-md bg-slate-50 px-2 py-1.5 text-center text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500"
            >
              {weekday}
            </div>
          ))}

          {days.map((day) => {
            const dayKey = formatDateKey(day);
            const isCurrentMonth = day.getMonth() === monthStartDate.getMonth();
            const isToday = dayKey === todayKey;
            const dayEvents = eventsByDay.get(dayKey) ?? [];

            const cellClasses = [
              "flex min-h-[140px] flex-col rounded-md border px-2 py-2",
              isCurrentMonth ? "bg-white border-slate-200" : "bg-slate-50 border-slate-100 text-slate-400",
              isToday ? "ring-2 ring-blue-500" : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <div key={dayKey} className={cellClasses}>
                <div className="flex items-start justify-between">
                  <span
                    className={`text-[11px] font-semibold ${
                      isCurrentMonth ? (isToday ? "text-blue-600" : "text-slate-600") : "text-slate-400"
                    }`}
                  >
                    {day.getDate()}
                  </span>
                  {dayEvents.length > 0 ? (
                    <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                      {dayEvents.length}
                    </span>
                  ) : null}
                </div>

                <div className="mt-2 flex flex-col gap-1 overflow-y-auto">
                  {dayEvents.map((event) => (
                    <CalendarEventCard key={event.id} event={event} />
                  ))}

                  {dayEvents.length === 0 ? (
                    <p className="mt-4 text-center text-[10px] text-slate-400">{copyText.emptyDayLabel}</p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CalendarEventCard({ event }: { event: AppointmentCalendarEvent }) {
  const stageLabel = getStageLabel(event.stage);
  const timeRange = formatTimeRange(event.scheduledStart, event.scheduledEnd);
  const assignedLabel = buildAssignedLabel(event.assignedTo, event.salesperson);
  const notesPreview = event.notes ? truncate(event.notes, 80) : null;
  const accentColor = event.eventColor?.trim() || "#1d4ed8";

  const content = (
    <div
      className="flex flex-col gap-0.5 rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-left text-[11px] shadow-sm transition hover:border-blue-200 hover:bg-blue-50"
      style={{ borderLeft: `3px solid ${accentColor}` }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">{timeRange}</p>
      <p className="text-[11px] font-semibold text-slate-900">{event.dealName}</p>
      <div className="flex flex-wrap items-center gap-1 text-[10px] text-slate-500">
        {stageLabel ? (
          <span className="rounded-full bg-white px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-blue-600">
            {stageLabel}
          </span>
        ) : null}
        {assignedLabel ? <span>{assignedLabel}</span> : null}
      </div>
      {notesPreview ? <p className="text-[10px] italic text-slate-500">Note: {notesPreview}</p> : null}
    </div>
  );

  if (event.dealId) {
    return (
      <Link to={`/deals/${event.dealId}`} className="block focus:outline-none focus:ring-2 focus:ring-blue-400">
        {content}
      </Link>
    );
  }

  return content;
}

function buildCalendarDays(monthStartDate: Date): Date[] {
  const firstDayOfMonth = new Date(
    monthStartDate.getFullYear(),
    monthStartDate.getMonth(),
    1
  );

  const startOffset = firstDayOfMonth.getDay();
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(firstDayOfMonth.getDate() - startOffset);

  const lastDayOfMonth = new Date(
    monthStartDate.getFullYear(),
    monthStartDate.getMonth() + 1,
    0
  );

  const endOffset = 6 - lastDayOfMonth.getDay();
  const endDate = new Date(lastDayOfMonth);
  endDate.setDate(lastDayOfMonth.getDate() + endOffset);

  const days: Date[] = [];
  const cursor = new Date(startDate);

  while (cursor <= endDate) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTimeRange(startIso: string, endIso: string): string {
  const startDate = new Date(startIso);
  const endDate = new Date(endIso);

  if (Number.isNaN(startDate.valueOf()) || Number.isNaN(endDate.valueOf())) {
    return "Time TBD";
  }

  const startLabel = timeFormatter.format(startDate);
  const endLabel = timeFormatter.format(endDate);
  return `${startLabel} - ${endLabel}`;
}

function getStageLabel(stage: AppointmentCalendarEvent["stage"]): string | null {
  if (!stage) {
    return null;
  }
  return stageLabelMap.get(stage) ?? null;
}

function buildAssignedLabel(assignedTo: string | null, salesperson: string | null): string | null {
  const hasAssigned = Boolean(assignedTo?.trim());
  const hasSalesperson = salesperson?.trim();

  if (hasAssigned && hasSalesperson && assignedTo !== salesperson) {
    return `Assigned to ${assignedTo} / Rep ${salesperson}`;
  }

  if (hasAssigned) {
    return `Assigned to ${assignedTo}`;
  }

  if (hasSalesperson) {
    return `Rep ${salesperson}`;
  }

  return null;
}

function truncate(value: string, maxLength: number): string {
  const trimmed = value.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  return `${trimmed.slice(0, maxLength - 3)}...`;
}
