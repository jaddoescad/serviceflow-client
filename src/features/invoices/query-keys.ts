export const invoiceKeys = {
  all: ["invoices"] as const,
  lists: () => [...invoiceKeys.all, "list"] as const,
  list: (filters?: { dealId?: string; companyId?: string }) =>
    [...invoiceKeys.lists(), filters] as const,
  byDeal: (dealId: string) => [...invoiceKeys.lists(), { dealId }] as const,
  details: () => [...invoiceKeys.all, "detail"] as const,
  detail: (invoiceId: string) => [...invoiceKeys.details(), invoiceId] as const,
  byQuote: (quoteId: string) => [...invoiceKeys.all, "byQuote", quoteId] as const,
  payments: (invoiceId: string) =>
    [...invoiceKeys.detail(invoiceId), "payments"] as const,
  paymentRequests: (invoiceId: string) =>
    [...invoiceKeys.detail(invoiceId), "paymentRequests"] as const,
};
