import type { DealRecord, ScheduleDealStageId } from "@/features/deals";
import type { ContactRecord } from "@/features/contacts";
import type { CompanyMemberRecord } from "@/features/companies";
import type { AppointmentRecord } from "@/features/appointments";

// Re-export AddressFormState from shared
export type { AddressFormState } from "@/components/shared";

export type ScheduleDealModalCopy = {
  createHeader: string;
  editHeader: string;
  createAction: string;
  createPendingAction: string;
  editAction: string;
  editPendingAction: string;
};

export type CommunicationMethod = "both" | "email" | "sms" | "none";

export type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  leadSource: string;
  salesperson: string;
  projectManager: string;
  disableDrips: boolean;
  assignedTo: string;
  eventColor: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  communicationMethod: CommunicationMethod;
  notes: string;
  // Step 2: Communication options
  sendConfirmation: boolean;
  sendReminder: boolean;
};

export type MemberOption = {
  value: string;
  label: string;
};

export type ScheduleDealModalProps = {
  open: boolean;
  mode?: "existing" | "new" | "edit";
  companyId: string;
  companyName: string;
  deal: DealRecord | null;
  appointment?: AppointmentRecord | null;
  contacts?: ContactRecord[];
  onClose: () => void;
  onScheduled: (deal: DealRecord) => void;
  onContactCreated?: (contact: ContactRecord) => void;
  companyMembers?: CompanyMemberRecord[];
  stageOnSchedule?: ScheduleDealStageId;
  copyOverrides?: Partial<ScheduleDealModalCopy>;
};
