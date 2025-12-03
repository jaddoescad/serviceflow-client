export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (companyId: string) => [...productKeys.lists(), companyId] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (productId: string) => [...productKeys.details(), productId] as const,
};
