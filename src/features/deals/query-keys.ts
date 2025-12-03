export const dealKeys = {
  all: ['deals'] as const,
  lists: () => [...dealKeys.all, 'list'] as const,
  list: (companyId: string) => [...dealKeys.lists(), companyId] as const,
  details: () => [...dealKeys.all, 'detail'] as const,
  detail: (dealId: string) => [...dealKeys.details(), dealId] as const,
  latestForContact: (companyId: string, contactId: string) =>
    [...dealKeys.all, 'latestForContact', companyId, contactId] as const,
};
