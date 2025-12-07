import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import type { DealStageId } from "@/features/deals";
import { DEFAULT_DEAL_SOURCES } from "@/features/deals";
import type { ContactAddressRecord, ContactRecord } from "@/features/contacts";
import type { CompanyMemberRecord } from "@/features/companies";
import { useCompanyMembers } from "@/features/companies";
import { createDeal, updateDealDetails, updateDealStage, useDealInvalidation } from "@/features/deals";
import { createContact, addContactAddresses, updateContact } from "@/features/contacts";
import { listDealSources } from "@/services/deal-sources";
import {
  useAddressAutocomplete,
  EMPTY_ADDRESS_FORM,
  type AddressFormState,
} from "@/components/shared";

import type {
  FormState,
  NewDealModalProps,
  UseNewDealFormReturn,
} from "./types";
import {
  NEW_CONTACT_OPTION,
  createInitialFormState,
  mapContactAddressToForm,
  hasAddressFormContent,
} from "./types";

export function useNewDealForm({
  open,
  onClose,
  companyId,
  stages,
  defaultStageId,
  companyMembers: externalCompanyMembers,
  onCreated,
  onUpdated,
  mode = "create",
  deal = null,
  onContactCreated,
}: NewDealModalProps): UseNewDealFormReturn {
  // Fetch company members only when modal is open and not provided externally
  const { data: fetchedCompanyMembers = [] } = useCompanyMembers(
    open && !externalCompanyMembers ? companyId : undefined
  );
  const companyMembers = externalCompanyMembers ?? fetchedCompanyMembers;
  const isEditMode = mode === "edit";
  const { invalidateDashboard, invalidateCompanyDeals, invalidateDeal } = useDealInvalidation();
  const initialStage = (deal?.stage ?? defaultStageId ?? stages[0]?.id ?? "cold_leads") as DealStageId;

  const [form, setForm] = useState<FormState>(() => createInitialFormState(initialStage));
  const [addressForm, setAddressForm] = useState<AddressFormState>(EMPTY_ADDRESS_FORM);
  const [selectedAddressId, setSelectedAddressId] = useState<string | typeof NEW_CONTACT_OPTION>(
    deal?.service_address?.id ?? NEW_CONTACT_OPTION
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dealSources, setDealSources] = useState<string[]>(() => [...DEFAULT_DEAL_SOURCES]);
  const [isLoadingDealSources, setIsLoadingDealSources] = useState(false);

  // Use the shared address autocomplete hook
  const handleAddressUpdate = useCallback((updates: Partial<AddressFormState>) => {
    setAddressForm((previous) => ({ ...previous, ...updates }));
    setSelectedAddressId(NEW_CONTACT_OPTION);
  }, []);

  const {
    suggestions: addressSuggestions,
    isFetching: isFetchingAddress,
    showSuggestions: showAddressSuggestions,
    containerRef: addressContainerRef,
    handleSuggestionSelect: handleAddressSuggestionSelect,
    handleAddressBlur,
    handleAddressFocus: handleAddressLine1Focus,
    handleAddressChange,
    setAddressProgrammatically,
  } = useAddressAutocomplete({
    open,
    addressLine1: addressForm.addressLine1,
    onAddressUpdate: handleAddressUpdate,
  });

  const memberOptions = useMemo(() => {
    if (!companyMembers) {
      return {
        sales: [] as CompanyMemberRecord[],
        project: [] as CompanyMemberRecord[],
      };
    }

    const sorted = [...companyMembers].sort((a, b) => a.display_name.localeCompare(b.display_name));

    return {
      sales: sorted.filter((member) => member.role === "sales" || member.role === "admin"),
      project: sorted.filter((member) => member.role === "project_manager" || member.role === "admin"),
    };
  }, [companyMembers]);

  const modalTitle = isEditMode ? "Edit Deal" : "New Deal";
  const submitLabel = isEditMode
    ? isSubmitting
      ? "Saving…"
      : "Save Deal"
    : isSubmitting
      ? "Creating…"
      : "Create Deal";

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!open) {
      return;
    }

    const defaultStageForCreate = (defaultStageId ?? stages[0]?.id ?? "cold_leads") as DealStageId;

    setError(null);

    if (isEditMode && deal) {
      const sourceContact = deal.contact ?? null;
      setForm({
        firstName: sourceContact?.first_name || deal.first_name || "",
        lastName: sourceContact?.last_name || deal.last_name || "",
        email: sourceContact?.email ?? deal.email ?? "",
        phone: sourceContact?.phone ?? deal.phone ?? "",
        leadSource: deal.lead_source ?? "",
        stage: deal.stage,
        salesperson: deal.salesperson ?? "",
        projectManager: deal.project_manager ?? "",
        disableDrips: deal.disable_drips,
      });

      if (deal.service_address) {
        setAddressForm(mapContactAddressToForm(deal.service_address));
        setSelectedAddressId(deal.service_address.id);
        // Mark as programmatic to prevent autocomplete from opening
        setAddressProgrammatically();
      } else {
        setAddressForm(EMPTY_ADDRESS_FORM);
        setSelectedAddressId(NEW_CONTACT_OPTION);
      }
    } else {
      setForm(createInitialFormState(defaultStageForCreate));
      setAddressForm(EMPTY_ADDRESS_FORM);
      setSelectedAddressId(NEW_CONTACT_OPTION);
    }
  }, [open, isEditMode, deal, stages, defaultStageId, setAddressProgrammatically]);

  // Load deal sources
  useEffect(() => {
    if (!open) return;

    let isMounted = true;
    setIsLoadingDealSources(true);

    listDealSources(companyId)
      .then((sources) => {
        if (!isMounted) return;

        const names = sources
          .map((source) => source?.name?.trim())
          .filter((name): name is string => Boolean(name));

        const merged = Array.from(
          new Set([
            ...([...DEFAULT_DEAL_SOURCES] as string[]),
            ...names,
            deal?.lead_source ?? null,
          ].filter(Boolean))
        ) as string[];

        setDealSources(merged);
      })
      .catch((err) => {
        console.error('Failed to load deal sources', err);
        const merged = Array.from(
          new Set([
            ...([...DEFAULT_DEAL_SOURCES] as string[]),
            deal?.lead_source ?? null,
          ].filter(Boolean))
        ) as string[];
        setDealSources(merged);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingDealSources(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [companyId, deal?.lead_source, open]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = event.target;
    const { name, value, type } = target;
    const isCheckbox = type === "checkbox" && target instanceof HTMLInputElement;
    const nextValue = isCheckbox ? target.checked : value;
    setForm((previous) => ({
      ...previous,
      [name]: nextValue,
    }));
  };

  const handleAddressSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;

    if (value === NEW_CONTACT_OPTION) {
      setSelectedAddressId(NEW_CONTACT_OPTION);
      setAddressForm(EMPTY_ADDRESS_FORM);
      return;
    }

    const existingAddresses = deal?.contact?.addresses ?? [];
    const selected = existingAddresses.find((address) => address.id === value) ?? null;

    if (selected) {
      setSelectedAddressId(selected.id);
      setAddressProgrammatically();
      setAddressForm(mapContactAddressToForm(selected));
    } else {
      setSelectedAddressId(NEW_CONTACT_OPTION);
      setAddressForm(EMPTY_ADDRESS_FORM);
    }
  };

  const handleAddressFieldChange = (field: keyof AddressFormState) => {
    return (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setAddressForm((previous) => ({ ...previous, [field]: value }));

      // Notify that user is typing (enables autocomplete)
      if (field === "addressLine1") {
        handleAddressChange();
      }

      if (selectedAddressId !== NEW_CONTACT_OPTION) {
        setSelectedAddressId(NEW_CONTACT_OPTION);
      }
    };
  };

  const validateForm = (): boolean => {
    const trimmedFirst = form.firstName.trim();

    if (!trimmedFirst) {
      setError("First name is required.");
      return false;
    }

    setError(null);
    return true;
  };

  const resetStep = () => {
    setError(null);
  };

  const submitDeal = async (disableDrips: boolean) => {
    const trimmedFirst = form.firstName.trim();
    const trimmedLast = form.lastName.trim();
    const normalizedLast = trimmedLast || null;

    if (!trimmedFirst) {
      setError("First name is required.");
      return;
    }

    const trimmedEmail = form.email.trim();
    const trimmedPhone = form.phone.trim();
    const trimmedDealSource = form.leadSource.trim();
    const trimmedSalesperson = form.salesperson.trim();
    const rawProjectManager = form.projectManager.trim();
    const normalizedProjectManager = rawProjectManager === "none" ? "" : rawProjectManager;

    const trimmedAddressForm = {
      addressLine1: addressForm.addressLine1.trim(),
      addressLine2: addressForm.addressLine2.trim(),
      city: addressForm.city.trim(),
      state: addressForm.state.trim(),
      postalCode: addressForm.postalCode.trim(),
      country: addressForm.country.trim(),
    } satisfies AddressFormState;

    const addressHasContent = hasAddressFormContent(trimmedAddressForm);
    const addressPayload = {
      address_line1: trimmedAddressForm.addressLine1 || null,
      address_line2: trimmedAddressForm.addressLine2 || null,
      city: trimmedAddressForm.city || null,
      state: trimmedAddressForm.state || null,
      postal_code: trimmedAddressForm.postalCode || null,
      country: trimmedAddressForm.country || null,
    };

    setIsSubmitting(true);
    setError(null);

    try {
      if (isEditMode) {
        if (!deal) {
          throw new Error("Deal context is required to update a deal.");
        }

        if (!onUpdated) {
          throw new Error("onUpdated handler is required for editing a deal.");
        }

        let contact: ContactRecord | null = null;
        let addressRecord: ContactAddressRecord | null = null;
        let contactId = deal.contact_id ?? null;

        if (contactId) {
          // Build address payload for update if user modified address fields
          const addressesToUpdate = addressHasContent ? [{
            id: selectedAddressId !== NEW_CONTACT_OPTION ? selectedAddressId : undefined,
            ...addressPayload,
          }] : undefined;

          const updatedContact = await updateContact(contactId, {
            first_name: trimmedFirst,
            last_name: normalizedLast,
            email: trimmedEmail || null,
            phone: trimmedPhone || null,
            addresses: addressesToUpdate,
          });

          contact = updatedContact;

          // Get the address record from the updated contact
          if (updatedContact.addresses && updatedContact.addresses.length > 0) {
            addressRecord = selectedAddressId !== NEW_CONTACT_OPTION
              ? updatedContact.addresses.find(a => a.id === selectedAddressId) ?? updatedContact.addresses[0]
              : updatedContact.addresses[updatedContact.addresses.length - 1];
          }

          onContactCreated?.(updatedContact);
        } else {
          const createdContact = await createContact({
            company_id: companyId,
            first_name: trimmedFirst,
            last_name: normalizedLast,
            email: trimmedEmail || null,
            phone: trimmedPhone || null,
            addresses: addressHasContent ? [addressPayload] : [],
          });

          contact = createdContact;
          contactId = createdContact.id;
          onContactCreated?.(createdContact);

          if (createdContact.addresses.length > 0) {
            addressRecord = createdContact.addresses[0];
          }
        }

        if (!addressRecord && addressHasContent && contact) {
          const updatedContact = await addContactAddresses(contact.id, [addressPayload]);
          if (updatedContact.addresses && updatedContact.addresses.length > 0) {
            addressRecord = updatedContact.addresses[updatedContact.addresses.length - 1];
          }
        }

        const resolvedLastName = normalizedLast ?? contact?.last_name ?? deal.last_name ?? null;

        const updatePayload = {
          contact_id: contactId,
          contact_address_id:
            addressRecord?.id ??
            (selectedAddressId !== NEW_CONTACT_OPTION ? selectedAddressId : null),
          first_name: trimmedFirst,
          last_name: resolvedLastName,
          email: trimmedEmail || null,
          phone: trimmedPhone || null,
          lead_source: trimmedDealSource || null,
          salesperson: trimmedSalesperson || null,
          project_manager: normalizedProjectManager || null,
          crew_id: deal.crew_id ?? null,
          disable_drips: disableDrips,
        };

        if (form.stage !== deal.stage) {
          await updateDealStage(deal.id, form.stage);
        }

        const updatedDeal = await updateDealDetails(deal.id, updatePayload);

        // Invalidate React Query cache
        invalidateDashboard(companyId, "sales");
        invalidateDashboard(companyId, "jobs");
        invalidateCompanyDeals(companyId);
        invalidateDeal(deal.id);

        const enrichedDeal = {
          ...updatedDeal,
          contact: contact ?? updatedDeal.contact,
          service_address: addressRecord ?? updatedDeal.service_address,
          crew: deal.crew,
          latest_appointment: deal.latest_appointment,
        };

        onUpdated(enrichedDeal);
        onClose();
      } else {
        if (!onCreated) {
          throw new Error("onCreated handler is required to create a deal.");
        }

        let contact: ContactRecord | null = null;
        let addressRecord: ContactAddressRecord | null = null;

        const createdContact = await createContact({
          company_id: companyId,
          first_name: trimmedFirst,
          last_name: normalizedLast,
          email: trimmedEmail || null,
          phone: trimmedPhone || null,
          addresses: addressHasContent ? [addressPayload] : [],
        });

        contact = createdContact;
        onContactCreated?.(createdContact);

        const createdAddresses = createdContact.addresses ?? [];
        if (createdAddresses.length > 0) {
          addressRecord = createdAddresses[0];
        }

        if (!contact) {
          throw new Error("A contact is required to create a deal.");
        }

        const payload = {
          company_id: companyId,
          contact_id: contact.id,
          contact_address_id: addressRecord?.id ?? null,
          first_name: contact.first_name,
          last_name: contact.last_name,
          email: contact.email,
          phone: contact.phone,
          lead_source: trimmedDealSource || null,
          stage: form.stage,
          salesperson: trimmedSalesperson || null,
          project_manager: normalizedProjectManager || null,
          assigned_to: null,
          event_color: null,
          send_email: false,
          send_sms: false,
          disable_drips: disableDrips,
        };

        const newDeal = await createDeal(payload);

        // Invalidate React Query cache so navigating away and back shows the new deal
        invalidateDashboard(companyId, "sales");
        invalidateDashboard(companyId, "jobs");
        invalidateCompanyDeals(companyId);

        const enrichedDeal = {
          ...newDeal,
          contact: contact,
          service_address: addressRecord,
        };

        onCreated(enrichedDeal);
        onClose();
      }
    } catch (submitError) {
      console.error(isEditMode ? "Failed to update deal" : "Failed to create deal", submitError);
      setError(
        submitError instanceof Error
          ? submitError.message
          : isEditMode
            ? "Could not update deal."
            : "Could not create deal."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await submitDeal(form.disableDrips);
  };

  return {
    form,
    addressForm,
    selectedAddressId,
    isSubmitting,
    error,
    dealSources,
    isLoadingDealSources,
    addressSuggestions,
    isFetchingAddress,
    showAddressSuggestions,
    addressContainerRef,
    memberOptions,
    modalTitle,
    submitLabel,
    isEditMode,
    handleInputChange,
    handleAddressSelectChange,
    handleAddressFieldChange,
    handleAddressLine1Focus,
    handleAddressBlur,
    handleAddressSuggestionSelect,
    handleSubmit,
    validateForm,
    submitDeal,
    resetStep,
  };
}
