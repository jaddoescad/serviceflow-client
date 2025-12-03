export const contactKeys = {
  all: ['contacts'] as const,
  lists: () => [...contactKeys.all, 'list'] as const,
  list: (companyId: string) => [...contactKeys.lists(), companyId] as const,
  details: () => [...contactKeys.all, 'detail'] as const,
  detail: (contactId: string) => [...contactKeys.details(), contactId] as const,
};
