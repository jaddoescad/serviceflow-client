export const quoteKeys = {
  all: ["quotes"] as const,
  lists: () => [...quoteKeys.all, "list"] as const,
  list: (dealId: string) => [...quoteKeys.lists(), dealId] as const,
  details: () => [...quoteKeys.all, "detail"] as const,
  detail: (quoteId: string) => [...quoteKeys.details(), quoteId] as const,
};
