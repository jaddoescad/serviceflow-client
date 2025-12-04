import type {
  DealRecord,
  DealStageId,
  DealStageOption,
} from "@/features/deals";
import type { ContactAddressRecord, ContactRecord } from "@/features/contacts";
import type { CompanyMemberRecord } from "@/features/companies";
import type { PlaceSuggestion } from "@/types/google-places";

export type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  leadSource: string;
  stage: DealStageId;
  salesperson: string;
  projectManager: string;
  disableDrips: boolean;
};

export type AddressFormState = {
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export const EMPTY_ADDRESS_FORM: AddressFormState = {
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
};

export const NEW_CONTACT_OPTION = "new" as const;

export type NewDealModalProps = {
  open: boolean;
  onClose: () => void;
  companyId: string;
  stages: DealStageOption[];
  defaultStageId?: DealStageId;
  contacts?: ContactRecord[];
  companyMembers?: CompanyMemberRecord[];
  onCreated?: (deal: DealRecord) => void;
  onUpdated?: (deal: DealRecord) => void;
  mode?: "create" | "edit";
  deal?: DealRecord | null;
  onContactCreated?: (contact: ContactRecord) => void;
};

export type DripPromptState = {
  deal: DealRecord;
  dealLabel: string;
} | null;

export type UseNewDealFormReturn = {
  // Form state
  form: FormState;
  addressForm: AddressFormState;
  selectedAddressId: string | typeof NEW_CONTACT_OPTION;
  isSubmitting: boolean;
  error: string | null;
  dealSources: string[];
  isLoadingDealSources: boolean;

  // Address suggestions
  addressSuggestions: PlaceSuggestion[];
  isFetchingAddress: boolean;
  showAddressSuggestions: boolean;

  // Member options
  memberOptions: {
    sales: CompanyMemberRecord[];
    project: CompanyMemberRecord[];
  };

  // Labels
  modalTitle: string;
  submitLabel: string;
  isEditMode: boolean;

  // Drip prompt state (for two-step flow after deal creation)
  dripPromptState: DripPromptState;
  isSavingDripChoice: boolean;
  dripError: string | null;

  // Handlers
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleAddressSelectChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  handleAddressFieldChange: (field: keyof AddressFormState) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddressLine1Focus: () => void;
  handleAddressBlur: () => void;
  handleAddressSuggestionSelect: (suggestion: PlaceSuggestion) => Promise<void>;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  handleEnableDrips: () => Promise<void>;
  handleDisableDrips: () => Promise<void>;
  handleCloseDripPrompt: () => void;
  handleBackFromDrip: () => void;
};

export function createInitialFormState(defaultStage: DealStageId): FormState {
  return {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    leadSource: "",
    stage: defaultStage,
    salesperson: "",
    projectManager: "",
    disableDrips: false,
  };
}

export function formatAddressSummary(address: ContactAddressRecord): string {
  const parts = [
    address.address_line1,
    address.city,
    address.state,
    address.postal_code,
  ].filter((part) => Boolean(part && part.trim()));

  if (parts.length === 0) {
    return "Address not provided";
  }

  return parts.join(", ");
}

export function mapContactAddressToForm(address: ContactAddressRecord): AddressFormState {
  return {
    addressLine1: address.address_line1 ?? "",
    addressLine2: address.address_line2 ?? "",
    city: address.city ?? "",
    state: address.state ?? "",
    postalCode: address.postal_code ?? "",
    country: address.country ?? "",
  };
}

export function hasAddressFormContent(address: AddressFormState): boolean {
  return [
    address.addressLine1,
    address.addressLine2,
    address.city,
    address.state,
    address.postalCode,
    address.country,
  ].some((value) => value.trim() !== "");
}
