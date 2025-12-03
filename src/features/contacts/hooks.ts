import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { contactKeys } from "./query-keys";
import {
  getContact,
  createContact,
  updateContact,
  addContactAddresses,
  fetchContacts,
  fetchContactListData,
  fetchContactsPaginated,
} from "./api";
import type {
  CreateContactInput,
  UpdateContactInput,
  CreateContactAddressInput,
  ContactListParams,
} from "./types";

export function useContacts(
  companyId: string,
  options?: { salespersonName?: string | null }
) {
  return useQuery({
    queryKey: [...contactKeys.list(companyId), options],
    queryFn: () => fetchContactListData(companyId, options),
    enabled: !!companyId,
  });
}

export function useContactsList(companyId: string | undefined) {
  return useQuery({
    queryKey: contactKeys.list(companyId!),
    queryFn: () => fetchContactListData(companyId!),
    enabled: !!companyId,
  });
}

/**
 * Hook for fetching raw contacts (for dropdowns, etc.)
 */
export function useContactsRaw(companyId: string | undefined) {
  return useQuery({
    queryKey: [...contactKeys.list(companyId!), 'raw'],
    queryFn: () => fetchContacts(companyId!),
    enabled: !!companyId,
  });
}

/**
 * Hook for fetching contacts with server-side pagination
 */
export function useContactsPaginated(
  companyId: string | undefined,
  params: ContactListParams = {}
) {
  return useQuery({
    queryKey: [...contactKeys.list(companyId!), 'paginated', params],
    queryFn: () => fetchContactsPaginated(companyId!, params),
    enabled: !!companyId,
    placeholderData: (previousData) => previousData, // Keep previous data while fetching
  });
}

export function useContact(contactId: string | undefined) {
  return useQuery({
    queryKey: contactKeys.detail(contactId!),
    queryFn: () => getContact(contactId!),
    enabled: !!contactId,
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateContactInput) => createContact(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: contactKeys.list(variables.company_id),
      });
    },
  });
}

export function useUpdateContact(contactId: string, companyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateContactInput) => updateContact(contactId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: contactKeys.detail(contactId),
      });
      queryClient.invalidateQueries({ queryKey: contactKeys.list(companyId) });
    },
  });
}

export function useAddContactAddresses(contactId: string, companyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (addresses: CreateContactAddressInput[]) =>
      addContactAddresses(contactId, addresses),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: contactKeys.detail(contactId),
      });
      queryClient.invalidateQueries({ queryKey: contactKeys.list(companyId) });
    },
  });
}
