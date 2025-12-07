import { useEffect, useMemo, useState } from "react";
import type { DealRecord } from "@/features/deals";
import type { ContactRecord, ContactAddressRecord } from "@/features/contacts";
import type { CompanyMemberRecord } from "@/features/companies";
import { useCompanyMembers } from "@/features/companies";
import type { AppointmentRecord } from "@/features/appointments";
import type { CommunicationTemplateSnapshot } from "@/features/communications";
import { EMPTY_ADDRESS_FORM, type AddressFormState } from "@/components/shared";
import type { FormState } from "../types";
import { NEW_CONTACT_OPTION } from "../constants";
import {
  createInitialFormState,
  applyContactToForm,
  mapContactAddressToForm,
  buildMemberOptions,
  includeCurrentValue,
  sortContacts,
} from "../utils";

type UseScheduleDealFormProps = {
  open: boolean;
  mode: "existing" | "new" | "edit";
  deal: DealRecord | null;
  appointment: AppointmentRecord | null;
  companyId: string;
  companyMembers?: CompanyMemberRecord[];
  appointmentTemplate: CommunicationTemplateSnapshot;
};

export function useScheduleDealForm({
  open,
  mode,
  deal,
  appointment,
  companyId,
  companyMembers: externalCompanyMembers,
  appointmentTemplate,
}: UseScheduleDealFormProps) {
  // Fetch company members only when modal is open and not provided externally
  const { data: fetchedCompanyMembers = [] } = useCompanyMembers(
    open && !externalCompanyMembers ? companyId : undefined
  );
  const companyMembers = externalCompanyMembers ?? fetchedCompanyMembers;
  const [form, setForm] = useState<FormState | null>(null);
  const [addressForm, setAddressForm] = useState<AddressFormState>(EMPTY_ADDRESS_FORM);
  const [selectedAddressId, setSelectedAddressId] = useState<string | "new">("new");
  const [savedContactAddresses, setSavedContactAddresses] = useState<ContactAddressRecord[]>(
    () => deal?.contact?.addresses ?? []
  );
  const [contactOptions, setContactOptions] = useState<ContactRecord[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string>(NEW_CONTACT_OPTION);

  // Email/SMS template state
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [smsBody, setSmsBody] = useState("");
  const [emailSubjectEdited, setEmailSubjectEdited] = useState(false);
  const [emailBodyEdited, setEmailBodyEdited] = useState(false);
  const [smsBodyEdited, setSmsBodyEdited] = useState(false);

  const isNewMode = mode === "new";
  const isEditMode = mode === "edit";
  const activeAppointment = appointment ?? deal?.latest_appointment ?? null;

  // Selected contact from dropdown
  const selectedContact = useMemo(() => {
    if (!isNewMode || selectedContactId === NEW_CONTACT_OPTION) {
      return null;
    }
    return contactOptions.find((contact) => contact.id === selectedContactId) ?? null;
  }, [contactOptions, isNewMode, selectedContactId]);

  const isExistingContactSelected = Boolean(selectedContact);

  // Member options for dropdowns
  const assignmentMembers = useMemo(
    () =>
      companyMembers.filter(
        (member) => member.role === "sales" || member.role === "project_manager" || member.role === "admin"
      ),
    [companyMembers]
  );

  const salesMembers = useMemo(
    () => companyMembers.filter((member) => member.role === "sales" || member.role === "admin"),
    [companyMembers]
  );

  const projectManagerMembers = useMemo(
    () => companyMembers.filter((member) => member.role === "project_manager" || member.role === "admin"),
    [companyMembers]
  );

  const assignmentOptions = useMemo(
    () => includeCurrentValue(buildMemberOptions(assignmentMembers), form?.assignedTo),
    [assignmentMembers, form?.assignedTo]
  );

  const salespersonOptions = useMemo(
    () => includeCurrentValue(buildMemberOptions(salesMembers), form?.salesperson),
    [salesMembers, form?.salesperson]
  );

  const projectManagerOptions = useMemo(
    () => includeCurrentValue(buildMemberOptions(projectManagerMembers), form?.projectManager),
    [projectManagerMembers, form?.projectManager]
  );

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!open) {
      setForm(null);
      setAddressForm(EMPTY_ADDRESS_FORM);
      setSelectedAddressId("new");
      setSavedContactAddresses([]);
      setContactOptions([]);
      setSelectedContactId(NEW_CONTACT_OPTION);
      setEmailSubject("");
      setEmailBody("");
      setSmsBody("");
      setEmailSubjectEdited(false);
      setEmailBodyEdited(false);
      setSmsBodyEdited(false);
      return;
    }

    if (mode === "new") {
      const baseForm = applyContactToForm(createInitialFormState(null, null), null);
      setForm(baseForm);
      setSavedContactAddresses([]);
      setSelectedAddressId("new");
      setAddressForm(EMPTY_ADDRESS_FORM);
      setSelectedContactId(NEW_CONTACT_OPTION);
      setContactOptions([]);
      return;
    }

    if (!deal) {
      setForm(createInitialFormState(null, null));
      setSavedContactAddresses([]);
      setSelectedAddressId("new");
      setAddressForm(EMPTY_ADDRESS_FORM);
      return;
    }

    setForm(createInitialFormState(deal, activeAppointment));
    const contactAddresses = deal.contact?.addresses ?? [];
    setSavedContactAddresses(contactAddresses);

    const preferredAddress =
      contactAddresses.find((address) => address.id === deal.contact_address_id) ??
      contactAddresses[0] ??
      deal.service_address ??
      null;

    if (preferredAddress) {
      setSelectedAddressId(preferredAddress.id);
      setAddressForm(mapContactAddressToForm(preferredAddress));
    } else {
      setSelectedAddressId("new");
      setAddressForm(EMPTY_ADDRESS_FORM);
    }

    setContactOptions([]);
    setSelectedContactId(NEW_CONTACT_OPTION);
  }, [open, mode, deal, activeAppointment]);

  // Populate communication templates when form data changes
  useEffect(() => {
    if (!form || !open) {
      return;
    }

    if (!emailSubjectEdited) {
      setEmailSubject(appointmentTemplate.emailSubject);
    }
    if (!emailBodyEdited) {
      setEmailBody(appointmentTemplate.emailBody);
    }
    if (!smsBodyEdited) {
      setSmsBody(appointmentTemplate.smsBody);
    }
  }, [form, open, appointmentTemplate, emailSubjectEdited, emailBodyEdited, smsBodyEdited]);

  // Contact selection handler
  const handleSelectContact = (contactId: string) => {
    setSelectedContactId(contactId);

    if (!form) {
      return;
    }

    if (contactId === NEW_CONTACT_OPTION) {
      setForm((previous) => {
        if (!previous) return previous;
        return {
          ...previous,
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
        };
      });
      setSavedContactAddresses([]);
      setSelectedAddressId("new");
      setAddressForm(EMPTY_ADDRESS_FORM);
      return;
    }

    const nextContact = contactOptions.find((item) => item.id === contactId) ?? null;
    setForm((previous) => {
      if (!previous) return previous;
      return applyContactToForm(previous, nextContact);
    });

    const addresses = nextContact?.addresses ?? [];
    setSavedContactAddresses(addresses);

    if (addresses.length) {
      const primaryAddress = addresses[0];
      setSelectedAddressId(primaryAddress.id);
      setAddressForm(mapContactAddressToForm(primaryAddress));
    } else {
      setSelectedAddressId("new");
      setAddressForm(EMPTY_ADDRESS_FORM);
    }
  };

  // Add new contact to options
  const addContactToOptions = (contact: ContactRecord) => {
    setContactOptions((previous) => sortContacts([...previous, contact]));
    setSelectedContactId(contact.id);
    setSavedContactAddresses(contact.addresses ?? []);
    if (contact.addresses?.length) {
      const primary = contact.addresses[0];
      setSelectedAddressId(primary.id);
      setAddressForm(mapContactAddressToForm(primary));
    } else {
      setSelectedAddressId("new");
      setAddressForm(EMPTY_ADDRESS_FORM);
    }
  };

  return {
    // Form state
    form,
    setForm,
    addressForm,
    setAddressForm,
    selectedAddressId,
    setSelectedAddressId,
    savedContactAddresses,
    setSavedContactAddresses,

    // Contact state
    contactOptions,
    selectedContactId,
    selectedContact,
    isExistingContactSelected,
    handleSelectContact,
    addContactToOptions,

    // Template state
    emailSubject,
    setEmailSubject,
    emailBody,
    setEmailBody,
    smsBody,
    setSmsBody,
    emailSubjectEdited,
    setEmailSubjectEdited,
    emailBodyEdited,
    setEmailBodyEdited,
    smsBodyEdited,
    setSmsBodyEdited,

    // Member options
    assignmentOptions,
    salespersonOptions,
    projectManagerOptions,

    // Derived state
    isNewMode,
    isEditMode,
    activeAppointment,
  };
}
