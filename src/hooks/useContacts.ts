import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import {
  getContact,
  createContact,
  updateContact,
  addContactAddresses,
  fetchContactListData,
} from '@/features/contacts';
import { useToast } from '@/components/ui/toast';
import { getErrorMessage } from '@/lib/errors';
import type { ContactRecord, CreateContactInput, UpdateContactInput, CreateContactAddressInput } from '@/types/contacts';

export function useContacts(companyId: string, options?: { salespersonName?: string | null }) {
  return useQuery({
    queryKey: [...queryKeys.contacts.list(companyId), options],
    queryFn: () => fetchContactListData(companyId, options),
    enabled: !!companyId,
  });
}

export function useContactsList(companyId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.contacts.list(companyId!),
    queryFn: () => fetchContactListData(companyId!),
    enabled: !!companyId,
  });
}

export function useContact(contactId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.contacts.detail(contactId!),
    queryFn: () => getContact(contactId!),
    enabled: !!contactId,
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (data: CreateContactInput) => createContact(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.list(variables.company_id) });
      toast.success('Contact created', 'The contact has been created successfully.');
    },
    onError: (error) => {
      toast.error('Failed to create contact', getErrorMessage(error));
    },
  });
}

export function useUpdateContact(contactId: string, companyId: string) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (data: UpdateContactInput) => updateContact(contactId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.detail(contactId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.list(companyId) });
      toast.success('Contact updated', 'The contact has been updated successfully.');
    },
    onError: (error) => {
      toast.error('Failed to update contact', getErrorMessage(error));
    },
  });
}

export function useAddContactAddresses(contactId: string, companyId: string) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (addresses: CreateContactAddressInput[]) => addContactAddresses(contactId, addresses),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.detail(contactId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.list(companyId) });
      toast.success('Addresses added', 'The addresses have been added successfully.');
    },
    onError: (error) => {
      toast.error('Failed to add addresses', getErrorMessage(error));
    },
  });
}
