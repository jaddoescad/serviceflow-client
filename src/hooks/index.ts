// Query keys
export { queryKeys } from './query-keys';

// Domain hooks
export {
  useDeals,
  useDealsList,
  useDeal,
  useCreateDeal,
  useUpdateDealDetails,
  useUpdateDealStage,
  useScheduleDeal,
  useUpdateDealAppointment,
  useDeleteAppointment,
  useDealInvalidation,
} from '@/features/deals';
export * from './useContacts';
export * from './useInvoices';
export {
  useSaveQuote,
  useCreateQuote,
  useDeleteQuote,
  useSendQuoteDelivery,
  useInvalidateQuotes,
} from '@/features/quotes';
export * from './useCrews';
export * from './useUsers';
export * from './useCompanies';
export {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useReorderProducts,
} from '@/features/products';
export * from './useDealSources';
export {
  useDripSequences,
  useDripSequenceByStage,
  useUpsertDripSequence,
  useCreateDripStep,
  useUpdateDripStep,
  useDeleteDripStep,
  useReorderDripSteps,
} from '@/features/drips';
export {
  useCommunicationTemplates,
  useCommunicationTemplate,
  useCommunicationTemplate as useCommunicationTemplateByKey,
  useUpsertCommunicationTemplate,
  useResetCommunicationTemplate,
} from '@/features/communications';
export * from './useChangeOrders';
export * from './useLists';
export * from './useDealDetail';
export { useCalendarAppointments, useInvalidateAppointments } from '@/features/appointments';
export * from './useCompanySettings';

// Existing hooks
export { useSupabaseBrowserClient } from './useSupabaseBrowserClient';
export { useDashboardData, dashboardKeys } from './useDashboardData';
export type { DashboardData } from './useDashboardData';
export { useInvoiceDetail, invoiceDetailKeys } from './useInvoiceDetail';
export type { InvoiceDetailData } from './useInvoiceDetail';

// Error handling
export { useErrorHandler, useMutationErrorHandler, createMutationOptions } from './useErrorHandler';
