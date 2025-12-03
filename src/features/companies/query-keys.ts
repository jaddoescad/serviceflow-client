export const companyKeys = {
  all: ["companies"] as const,
  lists: () => [...companyKeys.all, "list"] as const,
  detail: (companyId: string) => [...companyKeys.all, "detail", companyId] as const,
  forUser: (userId: string) => [...companyKeys.all, "forUser", userId] as const,
  members: (companyId: string) => [...companyKeys.all, "members", companyId] as const,
  settings: {
    all: ["companySettings"] as const,
    detail: (companyId: string) => [...companyKeys.settings.all, companyId] as const,
    emailSettings: (companyId: string) =>
      [...companyKeys.settings.all, "email", companyId] as const,
  },
};
