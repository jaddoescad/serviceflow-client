import { apiClient } from "@/services/api";
import type {
  ContactRecord,
  ContactListRow,
  ContactListSummary,
  CreateContactInput,
  UpdateContactInput,
  CreateContactAddressInput,
  ContactListParams,
  PaginatedContactListResponse,
} from "./types";

export const getContact = async (contactId: string): Promise<ContactRecord> => {
  return apiClient<ContactRecord>(`/contacts/${contactId}`);
};

export const getContactForCompany = async (
  companyId: string,
  contactId: string
): Promise<ContactRecord> => {
  return getContact(contactId);
};

export const createContact = async (
  data: CreateContactInput
): Promise<ContactRecord> => {
  return apiClient<ContactRecord>("/contacts", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateContact = async (
  id: string,
  data: UpdateContactInput
): Promise<ContactRecord> => {
  return apiClient<ContactRecord>(`/contacts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

export const addContactAddresses = async (
  contactId: string,
  addresses: CreateContactAddressInput[]
): Promise<ContactRecord> => {
  return apiClient<ContactRecord>(`/contacts/${contactId}/addresses`, {
    method: "POST",
    body: JSON.stringify({ addresses }),
  });
};

/**
 * Fetch raw contacts for a company (for dropdowns, etc.)
 */
export const fetchContacts = async (companyId: string): Promise<ContactRecord[]> => {
  return apiClient<ContactRecord[]>("/contacts", {
    params: { company_id: companyId },
  });
};

export const fetchContactListData = async (
  companyId: string,
  options?: { salespersonName?: string | null }
): Promise<{ rows: ContactListRow[]; summary: ContactListSummary }> => {
  const contacts = await apiClient<ContactRecord[]>("/contacts", {
    params: { company_id: companyId },
  });

  const filteredContacts = options?.salespersonName ? contacts : contacts;

  const rows: ContactListRow[] = filteredContacts.map((c) => ({
    id: c.id,
    name: `${c.first_name} ${c.last_name || ""}`.trim(),
    email: c.email,
    phone: c.phone,
    type: "lead",
    source: null,
    address: null,
    salesperson: null,
    balance: 0,
    archived: false,
  }));

  const summary: ContactListSummary = {
    invalidPhoneCount: 0,
    totalContacts: rows.length,
    types: [],
    sources: [],
    salespeople: [],
    statuses: [],
  };

  return { rows, summary };
};

/**
 * Fetch contacts with server-side pagination
 */
export const fetchContactsPaginated = async (
  companyId: string,
  params: ContactListParams = {}
): Promise<PaginatedContactListResponse> => {
  const queryParams: Record<string, string> = {
    company_id: companyId,
  };

  if (params.page) queryParams.page = String(params.page);
  if (params.pageSize) queryParams.pageSize = String(params.pageSize);
  if (params.search) queryParams.search = params.search;
  if (params.showArchived) queryParams.showArchived = "true";

  return apiClient<PaginatedContactListResponse>("/contacts/paginated", {
    params: queryParams,
  });
};
