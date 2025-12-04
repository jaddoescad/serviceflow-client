"use client";

import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import type { DealRecord, ScheduleDealInput, UpdateDealAppointmentInput } from "@/features/deals";
import { useDealInvalidation } from "@/features/deals";
import type { ContactAddressRecord, ContactRecord } from "@/features/contacts";
import { useSupabaseBrowserClient } from "@/hooks/useSupabaseBrowserClient";
import { createDeal, scheduleDeal, updateDealAppointment, deleteAppointment } from "@/features/deals";
import { createContact, addContactAddresses } from "@/features/contacts";
import { getCommunicationTemplateByKey, toCommunicationTemplateSnapshot } from "@/features/communications";
import type { CommunicationTemplateSnapshot } from "@/features/communications";
import { syncAppointmentToGoogle } from "@/lib/google-calendar-sync";
import { formatFullName } from "@/lib/name";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "@/components/ui/library";

import type { ScheduleDealModalProps, FormState, AddressFormState, CommunicationMethod } from "./types";
import { DEFAULT_MODAL_COPY, NEW_CONTACT_OPTION } from "./constants";
import {
  EMPTY_ADDRESS_FORM,
  buildDateTime,
  hasAddressFormContent,
  mapContactAddressToForm,
  resolveMemberUserId,
  sortContacts,
  getTimeOffset,
  buildAppointmentTemplateVars,
  populateAppointmentTemplate,
} from "./utils";
import { useScheduleDealForm, useAddressSuggestions, useDealSources } from "./hooks";
import {
  AppointmentSchedulingSection,
  ContactInformationSection,
  DealDetailsSection,
  ServiceAddressSection,
  TeamAssignmentSection,
  CommunicationStep,
} from "./sections";

export type { ScheduleDealModalProps } from "./types";

type Step = "details" | "communication";

export function ScheduleDealModal({
  open,
  mode = "existing",
  companyId,
  companyName,
  deal,
  appointment = null,
  onClose,
  onScheduled,
  onContactCreated,
  companyMembers,
  stageOnSchedule = "estimate_scheduled",
  copyOverrides,
}: ScheduleDealModalProps) {
  const supabase = useSupabaseBrowserClient();
  const { invalidateDashboard, invalidateCompanyDeals } = useDealInvalidation();

  // Step state
  const [step, setStep] = useState<Step>("details");

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Template loading
  const [appointmentTemplate, setAppointmentTemplate] = useState<CommunicationTemplateSnapshot>(() =>
    toCommunicationTemplateSnapshot("appointment_confirmation", null)
  );
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");

  const modalCopy = useMemo(
    () => ({ ...DEFAULT_MODAL_COPY, ...copyOverrides }),
    [copyOverrides]
  );

  // Form state management
  const {
    form,
    setForm,
    addressForm,
    setAddressForm,
    selectedAddressId,
    setSelectedAddressId,
    savedContactAddresses,
    setSavedContactAddresses,
    contactOptions,
    selectedContactId,
    selectedContact,
    isExistingContactSelected,
    handleSelectContact,
    addContactToOptions,
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
    assignmentOptions,
    salespersonOptions,
    projectManagerOptions,
    isNewMode,
    isEditMode,
    activeAppointment,
  } = useScheduleDealForm({
    open,
    mode,
    deal,
    appointment,
    companyId,
    companyMembers,
    appointmentTemplate,
  });

  // Deal sources
  const { dealSources, isLoading: isLoadingDealSources } = useDealSources({
    open,
    companyId,
    currentLeadSource: deal?.lead_source,
  });

  // Address suggestions
  const {
    suggestions: addressSuggestions,
    isFetching: isFetchingAddress,
    showSuggestions: showAddressSuggestions,
    handleSuggestionSelect,
    handleAddressBlur,
    handleAddressFocus,
  } = useAddressSuggestions({
    open,
    addressLine1: addressForm.addressLine1,
    selectedAddressId,
    onAddressUpdate: (updates) => {
      setAddressForm((prev) => ({ ...prev, ...updates }));
      setSelectedAddressId("new");
    },
  });

  // Load communication template
  useEffect(() => {
    if (!open || !companyId) return;
    let isMounted = true;

    (async () => {
      try {
        const template = await getCommunicationTemplateByKey(companyId, "appointment_confirmation");
        if (isMounted && template) {
          setAppointmentTemplate(template);
        }
      } catch {
        if (isMounted) {
          setAppointmentTemplate(toCommunicationTemplateSnapshot("appointment_confirmation", null));
        }
      }

      const { data, error } = await supabase
        .from("companies")
        .select("phone_number, website")
        .eq("id", companyId)
        .maybeSingle();

      if (error || !data || !isMounted) return;
      setCompanyPhone((data.phone_number ?? "").trim());
      setCompanyWebsite((data.website ?? "").trim());
    })();

    return () => {
      isMounted = false;
    };
  }, [open, companyId, supabase]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setStep("details");
      setError(null);
      setShowDeleteConfirm(false);
      setIsSubmitting(false);
      setIsDeleting(false);
    }
  }, [open]);

  const selectedContactAddress =
    selectedAddressId === "new"
      ? null
      : savedContactAddresses.find((address) => address.id === selectedAddressId) ?? null;

  // Handle close with step reset
  const handleClose = () => {
    setStep("details");
    onClose();
  };

  // Handle back button
  const handleBack = () => {
    setStep("details");
    setError(null);
  };

  // Validate step 1 and go to step 2
  const validateAndProceed = (): boolean => {
    if (!form) return false;

    const trimmedFirst = form.firstName.trim();

    if (!trimmedFirst) {
      setError("First name is required.");
      return false;
    }

    if (!form.scheduledDate || !form.startTime || !form.endTime) {
      setError("Please provide complete scheduling details.");
      return false;
    }

    if (form.startTime === form.endTime) {
      setError("End time must be after the start time.");
      return false;
    }

    const startDate = buildDateTime(form.scheduledDate, form.startTime);
    const endDate = buildDateTime(form.scheduledDate, form.endTime);

    if (!startDate || !endDate) {
      setError("Please provide valid scheduling details.");
      return false;
    }

    setError(null);
    return true;
  };

  const handleNext = () => {
    if (validateAndProceed()) {
      setStep("communication");
    }
  };

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      if (!form) return;

      const target = event.target;
      const { name, value, type } = target;
      const isCheckbox = type === "checkbox" && target instanceof HTMLInputElement;

      if (isCheckbox) {
        const checked = target.checked;
        setForm((prev) => (prev ? { ...prev, [name]: checked } : prev));
        return;
      }

      if (name === "startTime") {
        setForm((prev) => {
          if (!prev) return prev;
          const updated: FormState = { ...prev, startTime: value };
          if (!value) return updated;

          const inferredEnd = getTimeOffset(value, 60);
          if (!prev.endTime || prev.endTime <= value) {
            updated.endTime = inferredEnd ?? prev.endTime ?? value;
          }
          return updated;
        });
        return;
      }

      if (name === "projectManager" && value === "none") {
        setForm((prev) => (prev ? { ...prev, projectManager: "" } : prev));
        return;
      }

      setForm((prev) => (prev ? { ...prev, [name]: value } : prev));
    },
    [form, setForm]
  );

  const handleAddressFieldChange = useCallback(
    <K extends keyof AddressFormState>(field: K) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setAddressForm((prev) => ({ ...prev, [field]: event.target.value }));
      setSelectedAddressId("new");
    },
    [setAddressForm, setSelectedAddressId]
  );

  const handleSelectSavedAddress = useCallback(
    (address: ContactAddressRecord) => {
      setSelectedAddressId(address.id);
      setAddressForm(mapContactAddressToForm(address));
    },
    [setSelectedAddressId, setAddressForm]
  );

  const handleUseNewAddress = useCallback(() => {
    const currentSelection =
      selectedAddressId === "new"
        ? null
        : savedContactAddresses.find((addr) => addr.id === selectedAddressId) ?? null;

    if (currentSelection) {
      setAddressForm(mapContactAddressToForm(currentSelection));
    } else if (!isNewMode && deal?.service_address) {
      setAddressForm(mapContactAddressToForm(deal.service_address));
    } else if (isNewMode && selectedContact?.addresses?.length) {
      setAddressForm(mapContactAddressToForm(selectedContact.addresses[0]));
    } else {
      setAddressForm(EMPTY_ADDRESS_FORM);
    }

    setSelectedAddressId("new");
  }, [selectedAddressId, savedContactAddresses, isNewMode, deal, selectedContact, setAddressForm, setSelectedAddressId]);

  const handleClearAddress = useCallback(() => {
    setSelectedAddressId("new");
    setAddressForm(EMPTY_ADDRESS_FORM);
  }, [setSelectedAddressId, setAddressForm]);

  const handleCommunicationMethodChange = useCallback(
    (method: CommunicationMethod) => {
      setForm((prev) => (prev ? { ...prev, communicationMethod: method } : prev));
    },
    [setForm]
  );

  const handleSubmit = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    if (!form) return;

    const trimmedFirst = form.firstName.trim();
    const trimmedLast = form.lastName.trim();
    const normalizedLast = trimmedLast || null;

    if (!trimmedFirst) {
      setError("First name is required.");
      return;
    }

    if (!form.scheduledDate || !form.startTime || !form.endTime) {
      setError("Please provide complete scheduling details.");
      return;
    }

    if (form.startTime === form.endTime) {
      setError("End time must be after the start time.");
      return;
    }

    const startDate = buildDateTime(form.scheduledDate, form.startTime);
    const endDate = buildDateTime(form.scheduledDate, form.endTime);

    if (!startDate || !endDate) {
      setError("Please provide valid scheduling details.");
      return;
    }

    if (endDate <= startDate) {
      endDate.setDate(endDate.getDate() + 1);
    }

    if (endDate <= startDate) {
      setError("End time must be after the start time.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const trimmedEmail = form.email.trim();
    const trimmedPhone = form.phone.trim();
    const assignedToId = resolveMemberUserId(form.assignedTo.trim(), companyMembers ?? []);

    const trimmedAddressForm: AddressFormState = {
      addressLine1: addressForm.addressLine1.trim(),
      addressLine2: addressForm.addressLine2.trim(),
      city: addressForm.city.trim(),
      state: addressForm.state.trim(),
      postalCode: addressForm.postalCode.trim(),
      country: addressForm.country.trim(),
    };

    const addressHasContent = hasAddressFormContent(trimmedAddressForm);
    const templateVars = buildAppointmentTemplateVars(
      { ...form, firstName: trimmedFirst, lastName: trimmedLast, email: trimmedEmail, phone: trimmedPhone },
      trimmedAddressForm,
      companyName,
      companyPhone,
      companyWebsite
    );

    const renderedEmailSubject = populateAppointmentTemplate(emailSubject.trim(), templateVars);
    const renderedEmailBody = populateAppointmentTemplate(emailBody.trim(), templateVars);
    const renderedSmsBody = populateAppointmentTemplate(smsBody.trim(), templateVars);

    // Determine if we should actually send based on step 2 choices
    const shouldSendConfirmation = form.sendConfirmation && form.communicationMethod !== "none";
    const shouldSendEmail = shouldSendConfirmation && (form.communicationMethod === "email" || form.communicationMethod === "both");
    const shouldSendSms = shouldSendConfirmation && (form.communicationMethod === "sms" || form.communicationMethod === "both");

    try {
      let contactRecord: ContactRecord | null = deal?.contact ?? null;
      let contactId: string | null = deal?.contact_id ?? deal?.contact?.id ?? null;

      if (isNewMode) {
        if (isExistingContactSelected && selectedContact) {
          contactRecord = selectedContact;
          contactId = selectedContact.id;
          setSavedContactAddresses(selectedContact.addresses ?? []);
        } else {
          const createdContact = await createContact({
            company_id: companyId,
            first_name: trimmedFirst,
            last_name: normalizedLast,
            email: trimmedEmail || null,
            phone: trimmedPhone || null,
          });
          contactRecord = createdContact;
          contactId = createdContact.id;
          onContactCreated?.(createdContact);
          addContactToOptions(createdContact);
        }
      }

      let addressRecord = selectedContactAddress;
      if (!addressRecord && selectedAddressId !== "new") {
        addressRecord = savedContactAddresses.find((addr) => addr.id === selectedAddressId) ?? null;
      }

      if (selectedAddressId === "new" && contactId && addressHasContent) {
        const [insertedAddress] = await addContactAddresses(contactId, [
          {
            address_line1: trimmedAddressForm.addressLine1 || null,
            address_line2: trimmedAddressForm.addressLine2 || null,
            city: trimmedAddressForm.city || null,
            state: trimmedAddressForm.state || null,
            postal_code: trimmedAddressForm.postalCode || null,
            country: trimmedAddressForm.country || null,
          },
        ]);

        if (insertedAddress) {
          addressRecord = insertedAddress;
          setSavedContactAddresses((prev) => [...prev, insertedAddress]);
          setSelectedAddressId(insertedAddress.id);
          setAddressForm(mapContactAddressToForm(insertedAddress));
        }
      }

      const resolvedLastName = normalizedLast ?? contactRecord?.last_name ?? deal?.last_name ?? null;

      const dealPayload = {
        first_name: trimmedFirst || contactRecord?.first_name || "",
        last_name: resolvedLastName,
        email: trimmedEmail || contactRecord?.email || null,
        phone: trimmedPhone || contactRecord?.phone || null,
        lead_source: form.leadSource.trim() || null,
        contact_address_id: addressRecord?.id ?? null,
        salesperson: form.salesperson.trim() || null,
        project_manager: form.projectManager.trim() || null,
        assigned_to: assignedToId,
        crew_id: deal?.crew_id ?? null,
        event_color: form.eventColor,
        send_email: shouldSendEmail,
        send_sms: shouldSendSms,
        disable_drips: form.disableDrips,
      };

      let currentDeal = deal;

      if (!currentDeal) {
        currentDeal = await createDeal({
          company_id: companyId,
          contact_id: contactId,
          contact_address_id: dealPayload.contact_address_id,
          first_name: dealPayload.first_name,
          last_name: dealPayload.last_name,
          email: dealPayload.email,
          phone: dealPayload.phone,
          lead_source: dealPayload.lead_source,
          stage: "estimate_scheduled",
          salesperson: dealPayload.salesperson,
          project_manager: dealPayload.project_manager,
          assigned_to: dealPayload.assigned_to,
          crew_id: dealPayload.crew_id,
          event_color: dealPayload.event_color,
          send_email: dealPayload.send_email,
          send_sms: dealPayload.send_sms,
          disable_drips: dealPayload.disable_drips,
        });
      }

      if (!currentDeal) {
        throw new Error("Failed to create or retrieve deal.");
      }

      const appointmentPayload = {
        company_id: currentDeal.company_id ?? companyId,
        assigned_to: dealPayload.assigned_to,
        crew_id: dealPayload.crew_id,
        event_color: form.eventColor,
        scheduled_start: startDate.toISOString(),
        scheduled_end: endDate.toISOString(),
        appointment_notes: form.notes.trim() || null,
        send_email: dealPayload.send_email,
        send_sms: dealPayload.send_sms,
      } satisfies ScheduleDealInput["appointment"];

      if (isEditMode) {
        if (!activeAppointment) {
          throw new Error("Appointment unavailable for editing.");
        }

        const communications: UpdateDealAppointmentInput["communications"] = {};
        if (shouldSendEmail && trimmedEmail) {
          communications.email = { to: trimmedEmail, subject: renderedEmailSubject, body: renderedEmailBody };
        }
        if (shouldSendSms && trimmedPhone) {
          communications.sms = { to: trimmedPhone, body: renderedSmsBody };
        }

        const updated = await updateDealAppointment(currentDeal.id, {
          appointmentId: activeAppointment.id,
          appointment: appointmentPayload,
          deal: dealPayload,
          communications: Object.keys(communications).length > 0 ? communications : undefined,
          // Pass reminder settings to backend
          sendReminder: form.sendReminder && form.communicationMethod !== "none",
          reminderChannel: form.communicationMethod,
        });

        // Invalidate React Query cache
        invalidateDashboard(companyId, "sales");
        invalidateDashboard(companyId, "jobs");
        invalidateCompanyDeals(companyId);

        void syncAppointmentToGoogle(updated, updated.latest_appointment, companyName);
        onScheduled(updated);
        handleClose();
        return;
      }

      const communications: ScheduleDealInput["communications"] = {};
      if (shouldSendEmail && trimmedEmail) {
        communications.email = { to: trimmedEmail, subject: renderedEmailSubject, body: renderedEmailBody };
      }
      if (shouldSendSms && trimmedPhone) {
        communications.sms = { to: trimmedPhone, body: renderedSmsBody };
      }

      const payload: ScheduleDealInput = {
        stage: stageOnSchedule,
        appointment: appointmentPayload,
        deal: dealPayload,
        communications: Object.keys(communications).length > 0 ? communications : undefined,
        // Pass reminder settings to backend
        sendReminder: form.sendReminder && form.communicationMethod !== "none",
        reminderChannel: form.communicationMethod,
      };

      const updated = await scheduleDeal(currentDeal.id, payload);

      // Invalidate React Query cache
      invalidateDashboard(companyId, "sales");
      invalidateDashboard(companyId, "jobs");
      invalidateCompanyDeals(companyId);

      void syncAppointmentToGoogle(updated, updated.latest_appointment, companyName);
      onScheduled(updated);
      handleClose();
    } catch (err) {
      console.error("Failed to schedule deal", err);
      setError(err instanceof Error ? err.message : "Could not schedule deal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = () => setShowDeleteConfirm(true);
  const handleDeleteCancel = () => setShowDeleteConfirm(false);

  const handleDeleteConfirm = async () => {
    if (!deal?.id || !activeAppointment?.id) return;

    setIsDeleting(true);
    setError(null);

    try {
      await deleteAppointment(deal.id, activeAppointment.id);

      // Invalidate React Query cache
      invalidateDashboard(companyId, "sales");
      invalidateDashboard(companyId, "jobs");
      invalidateCompanyDeals(companyId);

      onScheduled({ ...deal, latest_appointment: null });
      setShowDeleteConfirm(false);
      handleClose();
    } catch (err) {
      console.error("Failed to delete appointment", err);
      setError(err instanceof Error ? err.message : "Failed to delete appointment");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!open || !form) return null;

  const contactName = formatFullName({ first_name: form.firstName, last_name: form.lastName });
  const modalTitle = contactName || (deal ? `Deal #${deal.id.slice(0, 6)}` : "");
  const headerLabel = isEditMode ? modalCopy.editHeader : modalCopy.createHeader;
  const primaryActionLabel = isEditMode ? modalCopy.editAction : modalCopy.createAction;
  const primaryActionPendingLabel = isEditMode ? modalCopy.editPendingAction : modalCopy.createPendingAction;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      labelledBy="schedule-deal-modal-title"
      ariaLabel="Schedule appointment"
      size="xl"
      align="top"
    >
      <ModalHeader
        title={step === "communication" ? "Notifications" : headerLabel}
        subtitle={modalTitle || undefined}
        titleId="schedule-deal-modal-title"
        onClose={handleClose}
      >
        {step === "communication" && (
          <button
            type="button"
            onClick={handleBack}
            className="absolute left-4 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none"
            aria-label="Go back"
          >
            ←
          </button>
        )}
      </ModalHeader>

      {step === "details" ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleNext();
          }}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <ModalBody className="flex flex-col gap-4 overflow-x-hidden bg-slate-50 text-[13px] sm:text-[12px]">
            <AppointmentSchedulingSection
              form={form}
              assignmentOptions={assignmentOptions}
              onInputChange={handleInputChange}
            />

            <ContactInformationSection
              form={form}
              onInputChange={handleInputChange}
            />

            <DealDetailsSection
              form={form}
              dealSources={dealSources}
              isLoadingDealSources={isLoadingDealSources}
              onInputChange={handleInputChange}
            />

            <ServiceAddressSection
              addressForm={addressForm}
              selectedAddressId={selectedAddressId}
              contactAddresses={savedContactAddresses}
              selectedContactAddress={selectedContactAddress}
              suggestions={addressSuggestions}
              showSuggestions={showAddressSuggestions}
              isFetchingAddress={isFetchingAddress}
              onAddressFieldChange={handleAddressFieldChange}
              onAddressBlur={handleAddressBlur}
              onAddressFocus={handleAddressFocus}
              onSelectSavedAddress={handleSelectSavedAddress}
              onUseNewAddress={handleUseNewAddress}
              onClearAddress={handleClearAddress}
              onSuggestionSelect={handleSuggestionSelect}
            />

            <TeamAssignmentSection
              form={form}
              salespersonOptions={salespersonOptions}
              projectManagerOptions={projectManagerOptions}
              onInputChange={handleInputChange}
            />

            {error ? (
              <p className="rounded border border-red-200 bg-red-100 px-3 py-2 text-[12px] font-medium text-red-600">
                {error}
              </p>
            ) : null}
          </ModalBody>

          <ModalFooter>
            <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Next
            </Button>
          </ModalFooter>
        </form>
      ) : (
        <>
          <ModalBody className="flex flex-col gap-4 overflow-x-hidden bg-slate-50 text-[13px] sm:text-[12px]">
            <CommunicationStep
              form={form}
              onCheckboxChange={handleInputChange}
              onCommunicationMethodChange={handleCommunicationMethodChange}
            />

            {error ? (
              <p className="rounded border border-red-200 bg-red-100 px-3 py-2 text-[12px] font-medium text-red-600">
                {error}
              </p>
            ) : null}
          </ModalBody>

          <ModalFooter className="justify-between">
            <div>
              {isEditMode && activeAppointment && !showDeleteConfirm ? (
                <Button
                  variant="danger"
                  onClick={handleDeleteClick}
                  disabled={isSubmitting || isDeleting}
                >
                  Delete
                </Button>
              ) : null}
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={handleClose}
                disabled={isSubmitting || isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => handleSubmit()}
                disabled={isSubmitting || isDeleting}
              >
                {isSubmitting ? primaryActionPendingLabel : primaryActionLabel}
              </Button>
            </div>
          </ModalFooter>
        </>
      )}

      {showDeleteConfirm ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-4 shadow-xl">
            <h3 className="mb-2 text-sm font-semibold text-slate-900">Delete Appointment?</h3>
            <p className="mb-4 text-[12px] text-slate-600">
              This will permanently delete the appointment. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={handleDeleteCancel} disabled={isDeleting}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDeleteConfirm} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
