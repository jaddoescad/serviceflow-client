export const proposalKeys = {
  all: ["proposals"] as const,
  lists: () => [...proposalKeys.all, "list"] as const,
  list: (companyId: string) => [...proposalKeys.lists(), companyId] as const,
  details: () => [...proposalKeys.all, "detail"] as const,
  detail: (proposalId: string) => [...proposalKeys.details(), proposalId] as const,
  attachments: (quoteId: string) =>
    [...proposalKeys.all, "attachments", quoteId] as const,
};
