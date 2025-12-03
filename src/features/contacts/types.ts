// Contact Address Types
export type ContactAddressRecord = {
  id: string;
  contact_id: string;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  created_at: string;
  updated_at: string;
};

// Contact Types
export type ContactRecord = {
  id: string;
  company_id: string;
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  archived: boolean;
  created_at: string;
  updated_at: string;
  addresses: ContactAddressRecord[];
};

export type CreateContactAddressInput = {
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
};

export type CreateContactInput = {
  company_id: string;
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  addresses?: CreateContactAddressInput[];
};

export type UpdateContactAddressInput = {
  id?: string;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
};

export type UpdateContactInput = {
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  addresses?: UpdateContactAddressInput[];
};

// Contact List Types
export type ContactListType = "customer" | "lead";

export type ContactListStatus = "active" | "archived";

export type ContactTypeOption = {
  value: ContactListType;
  label: string;
};

export type ContactStatusOption = {
  value: ContactListStatus;
  label: string;
};

export type ContactListRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  type: ContactListType;
  source: string | null;
  address: string | null;
  salesperson: string | null;
  balance: number;
  archived: boolean;
};

export type ContactListSummary = {
  invalidPhoneCount: number;
  totalContacts: number;
  types: ContactListType[];
  sources: string[];
  salespeople: string[];
  statuses: ContactListStatus[];
};

export type ContactListData = {
  rows: ContactListRow[];
  summary: ContactListSummary;
};

// Pagination types
export type PaginationMeta = {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export type ContactListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  showArchived?: boolean;
};

export type PaginatedContactListResponse = {
  data: ContactRecord[];
  pagination: PaginationMeta;
  summary: ContactListSummary;
};
