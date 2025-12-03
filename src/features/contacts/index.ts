// Types
export type {
  ContactAddressRecord,
  ContactRecord,
  CreateContactAddressInput,
  CreateContactInput,
  UpdateContactInput,
  ContactListType,
  ContactListStatus,
  ContactTypeOption,
  ContactStatusOption,
  ContactListRow,
  ContactListSummary,
  ContactListData,
  PaginationMeta,
  ContactListParams,
  PaginatedContactListResponse,
} from "./types";

// Constants
export { CONTACT_ADDRESS_FIELDS, CONTACT_FIELDS } from "./constants";

// Query Keys
export { contactKeys } from "./query-keys";

// API
export {
  getContact,
  getContactForCompany,
  createContact,
  updateContact,
  addContactAddresses,
  fetchContacts,
  fetchContactListData,
  fetchContactsPaginated,
} from "./api";

// Hooks
export {
  useContacts,
  useContactsList,
  useContactsRaw,
  useContactsPaginated,
  useContact,
  useCreateContact,
  useUpdateContact,
  useAddContactAddresses,
} from "./hooks";

// Components
export {
  ContactListFilters,
  type ContactListFiltersProps,
} from "./components/contact-list-filters";
