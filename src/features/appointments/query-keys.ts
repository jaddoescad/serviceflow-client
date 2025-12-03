export const appointmentKeys = {
  all: ["appointments"] as const,
  lists: () => [...appointmentKeys.all, "list"] as const,
  list: (companyId: string) => [...appointmentKeys.lists(), companyId] as const,
  calendar: (companyId: string, type: string, year: number, month: number) =>
    [...appointmentKeys.all, "calendar", companyId, type, year, month] as const,
  details: () => [...appointmentKeys.all, "detail"] as const,
  detail: (appointmentId: string) => [...appointmentKeys.details(), appointmentId] as const,
};
