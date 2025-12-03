export const crewKeys = {
  all: ["crews"] as const,
  lists: () => [...crewKeys.all, "list"] as const,
  list: (companyId: string) => [...crewKeys.lists(), companyId] as const,
  details: () => [...crewKeys.all, "detail"] as const,
  detail: (crewId: string) => [...crewKeys.details(), crewId] as const,
};
