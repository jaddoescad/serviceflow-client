import { dealKeys } from '@/features/deals';

export const queryKeys = {
  // Deals - using feature query keys
  deals: dealKeys,

  // Contacts
  contacts: {
    all: ['contacts'] as const,
    lists: () => [...queryKeys.contacts.all, 'list'] as const,
    list: (companyId: string) => [...queryKeys.contacts.lists(), companyId] as const,
    details: () => [...queryKeys.contacts.all, 'detail'] as const,
    detail: (contactId: string) => [...queryKeys.contacts.details(), contactId] as const,
  },

  // Invoices
  invoices: {
    all: ['invoices'] as const,
    lists: () => [...queryKeys.invoices.all, 'list'] as const,
    list: (filters?: { dealId?: string; companyId?: string }) =>
      [...queryKeys.invoices.lists(), filters] as const,
    byDeal: (dealId: string) => [...queryKeys.invoices.lists(), { dealId }] as const,
    details: () => [...queryKeys.invoices.all, 'detail'] as const,
    detail: (invoiceId: string) => [...queryKeys.invoices.details(), invoiceId] as const,
    byQuote: (quoteId: string) => [...queryKeys.invoices.all, 'byQuote', quoteId] as const,
    payments: (invoiceId: string) => [...queryKeys.invoices.detail(invoiceId), 'payments'] as const,
    paymentRequests: (invoiceId: string) =>
      [...queryKeys.invoices.detail(invoiceId), 'paymentRequests'] as const,
  },

  // Quotes
  quotes: {
    all: ['quotes'] as const,
    lists: () => [...queryKeys.quotes.all, 'list'] as const,
    list: (dealId: string) => [...queryKeys.quotes.lists(), dealId] as const,
    details: () => [...queryKeys.quotes.all, 'detail'] as const,
    detail: (quoteId: string) => [...queryKeys.quotes.details(), quoteId] as const,
  },

  // Crews
  crews: {
    all: ['crews'] as const,
    list: (companyId: string) => [...queryKeys.crews.all, 'list', companyId] as const,
  },

  // Users
  users: {
    all: ['users'] as const,
    detail: (userId: string) => [...queryKeys.users.all, 'detail', userId] as const,
    organizations: (userId: string) => [...queryKeys.users.all, 'organizations', userId] as const,
  },

  // Companies
  companies: {
    all: ['companies'] as const,
    detail: (companyId: string) => [...queryKeys.companies.all, 'detail', companyId] as const,
    forUser: (userId: string) => [...queryKeys.companies.all, 'forUser', userId] as const,
    members: (companyId: string) => [...queryKeys.companies.all, 'members', companyId] as const,
  },

  // Products / Product Templates
  products: {
    all: ['products'] as const,
    list: (companyId: string) => [...queryKeys.products.all, 'list', companyId] as const,
  },

  // Deal Sources
  dealSources: {
    all: ['dealSources'] as const,
    list: (companyId: string) => [...queryKeys.dealSources.all, 'list', companyId] as const,
  },

  // Drip Sequences
  drips: {
    all: ['drips'] as const,
    list: (companyId: string, pipelineId: string) =>
      [...queryKeys.drips.all, 'list', companyId, pipelineId] as const,
    byStage: (companyId: string, pipelineId: string, stageId: string) =>
      [...queryKeys.drips.all, 'byStage', companyId, pipelineId, stageId] as const,
  },

  // Communication Templates
  communicationTemplates: {
    all: ['communicationTemplates'] as const,
    list: (companyId: string) => [...queryKeys.communicationTemplates.all, 'list', companyId] as const,
    byKey: (companyId: string, key: string) =>
      [...queryKeys.communicationTemplates.all, 'byKey', companyId, key] as const,
  },

  // Change Orders
  changeOrders: {
    all: ['changeOrders'] as const,
    list: (dealId: string) => [...queryKeys.changeOrders.all, 'list', dealId] as const,
  },

  // Deal Notes
  dealNotes: {
    all: ['dealNotes'] as const,
    list: (dealId: string) => [...queryKeys.dealNotes.all, 'list', dealId] as const,
  },

  // Sales List
  salesList: {
    all: ['salesList'] as const,
    list: (companyId: string) => [...queryKeys.salesList.all, 'list', companyId] as const,
  },

  // Invoice List
  invoiceList: {
    all: ['invoiceList'] as const,
    list: (companyId: string) => [...queryKeys.invoiceList.all, 'list', companyId] as const,
  },

  // Proposal List
  proposalList: {
    all: ['proposalList'] as const,
    list: (companyId: string) => [...queryKeys.proposalList.all, 'list', companyId] as const,
  },

  // Jobs List
  jobsList: {
    all: ['jobsList'] as const,
    list: (companyId: string) => [...queryKeys.jobsList.all, 'list', companyId] as const,
  },

  // Proposal Summaries (for pipeline views)
  proposalSummaries: {
    all: ['proposalSummaries'] as const,
    list: (companyId: string) => [...queryKeys.proposalSummaries.all, 'list', companyId] as const,
  },

  // Invoice Summaries (for pipeline views)
  invoiceSummaries: {
    all: ['invoiceSummaries'] as const,
    list: (companyId: string) => [...queryKeys.invoiceSummaries.all, 'list', companyId] as const,
  },

  // Deal Detail (comprehensive view)
  dealDetail: {
    all: ['dealDetail'] as const,
    detail: (dealId: string) => [...queryKeys.dealDetail.all, dealId] as const,
    proposalData: (dealId: string, quoteId?: string | null) =>
      [...queryKeys.dealDetail.all, 'proposalData', dealId, quoteId] as const,
  },

  // Calendar / Appointments
  calendar: {
    all: ['calendar'] as const,
    appointments: (companyId: string, type: string, year: number, month: number) =>
      [...queryKeys.calendar.all, 'appointments', companyId, type, year, month] as const,
  },

  // Company Settings (extended)
  companySettings: {
    all: ['companySettings'] as const,
    detail: (companyId: string) => [...queryKeys.companySettings.all, companyId] as const,
    emailSettings: (companyId: string) =>
      [...queryKeys.companySettings.all, 'email', companyId] as const,
  },
} as const;
