// Types
export type {
  DealPipelineId,
  SalesDealStageId,
  JobsDealStageId,
  DealStageId,
  DealStageOption,
  DealSourceRecord,
  DealRecord,
  DealSmsContact,
  DealSmsContext,
  CreateDealInput,
  UpdateDealInput,
  ScheduleDealStageId,
  ScheduleDealInput,
  UpdateDealAppointmentInput,
  UpdateDealDetailsInput,
  PaginationMeta,
  DealListParams,
  DealListSummary,
  PaginatedDealListResponse,
} from './types';

// Constants
export {
  DEFAULT_DEAL_SOURCES,
  DEAL_FIELDS,
  DEAL_SMS_CONTEXT_FIELDS,
  SALES_DEAL_STAGE_OPTIONS,
  JOBS_DEAL_STAGE_OPTIONS,
  DEAL_STAGE_OPTIONS,
  DEAL_STAGE_HEADER_THEMES,
  DEAL_STAGE_PIPELINE_MAP,
} from './constants';

// Query Keys
export { dealKeys } from './query-keys';

// API
export {
  fetchDeals,
  fetchDealsPaginated,
  getDealById,
  getLatestDealForContact,
  createDeal,
  updateDealDetails,
  updateDealStage,
  scheduleDeal,
  updateDealAppointment,
  deleteAppointment,
} from './api';

// Hooks
export {
  useDeals,
  useDealsList,
  useDealsPaginated,
  useDeal,
  useCreateDeal,
  useUpdateDealDetails,
  useUpdateDealStage,
  useScheduleDeal,
  useUpdateDealAppointment,
  useDeleteAppointment,
  useDealInvalidation,
} from './hooks';

// Components
export { DealAppointmentsCard } from './components/deal-appointments-card';
export { DealAttachmentsPanel } from './components/deal-attachments-panel';
export { DealChecklistCard } from './components/deal-checklist-card';
export { DealDetailBoard } from './components/deal-detail-board';
export { DealDocumentsCard } from './components/deal-documents-card';
export { DealDripSelector } from './components/deal-drip-selector';
export { DealJobScheduleCard } from './components/deal-job-schedule-card';
export { DealNotesPanel } from './components/deal-notes-panel';
export { DealStageSelector } from './components/deal-stage-selector';
export { DealSummaryCard } from './components/deal-summary-card';
export { JobScheduleModal } from '@/components/dialog-forms/job-schedule-modal';
