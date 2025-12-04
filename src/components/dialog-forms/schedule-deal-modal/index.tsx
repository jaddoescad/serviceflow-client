"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
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
import { Modal } from "@/components/shared/modal";
import { StepIndicator } from "@/components/dialog-forms/shared";

import type { ScheduleDealModalProps, FormState, AddressFormState, CommunicationMethod, ReminderSettings } from "./types";
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
  SendConfirmationSection,
} from "./sections";

type PendingSubmissionData = {
  trimmedFirst: string;
  normalizedLast: string | null;
  trimmedEmail: string;
  trimmedPhone: string;
  assignedToId: string | null;
  trimmedAddressForm: AddressFormState;
  addressHasContent: boolean;
  renderedEmailSubject: string;
  renderedEmailBody: string;
  renderedSmsBody: string;
  startDate: Date;
  endDate: Date;
  contactRecord: ContactRecord | null;
  contactId: string | null;
  addressRecord: ContactAddressRecord | null;
};

export type { ScheduleDealModalProps } from "./types";

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

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Multi-step flow state (new mode only): 1=Details, 2=Confirmation
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [isSavingFinal, setIsSavingFinal] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);
  const pendingSubmissionRef = useRef<PendingSubmissionData | null>(null);

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
      setError(null);
      setShowDeleteConfirm(false);
      setIsSubmitting(false);
      setIsDeleting(false);
      setCurrentStep(1);
      setIsSavingFinal(false);
      setStepError(null);
      pendingSubmissionRef.current = null;
    }
  }, [open]);

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

  const handleAddressSelectChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const value = event.target.value;
      if (value === "new") {
        setSelectedAddressId("new");
        setAddressForm(EMPTY_ADDRESS_FORM);
      } else {
        const selectedAddress = savedContactAddresses.find((addr) => addr.id === value);
        if (selectedAddress) {
          setSelectedAddressId(selectedAddress.id);
          setAddressForm(mapContactAddressToForm(selectedAddress));
        }
      }
    },
    [savedContactAddresses, setSelectedAddressId, setAddressForm]
  );

  const handleCommunicationMethodChange = useCallback(
    (method: CommunicationMethod) => {
      setForm((prev) => (prev ? { ...prev, communicationMethod: method } : prev));
    },
    [setForm]
  );

  const handleReminderChange = useCallback(
    (key: keyof ReminderSettings, value: boolean) => {
      setForm((prev) =>
        prev
          ? { ...prev, reminders: { ...prev.reminders, [key]: value } }
          : prev
      );
    },
    [setForm]
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
    const assignedToId = resolveMemberUserId(form.assignedTo.trim(), companyMembers);

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

      let addressRecord: ContactAddressRecord | null = null;
      if (selectedAddressId !== "new") {
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

      // For new mode or existing mode, move to step 2 (Confirmation)
      if (isNewMode || mode === "existing") {
        pendingSubmissionRef.current = {
          trimmedFirst,
          normalizedLast,
          trimmedEmail,
          trimmedPhone,
          assignedToId,
          trimmedAddressForm,
          addressHasContent,
          renderedEmailSubject,
          renderedEmailBody,
          renderedSmsBody,
          startDate,
          endDate,
          contactRecord,
          contactId,
          addressRecord,
        };
        setIsSubmitting(false);
        setCurrentStep(2);
        return;
      }

      // For edit mode, proceed with the full submission
      await completeSubmission({
        trimmedFirst,
        normalizedLast,
        trimmedEmail,
        trimmedPhone,
        assignedToId,
        trimmedAddressForm,
        addressHasContent,
        renderedEmailSubject,
        renderedEmailBody,
        renderedSmsBody,
        startDate,
        endDate,
        contactRecord,
        contactId,
        addressRecord,
        disableDrips: form.disableDrips,
      });
    } catch (err) {
      console.error("Failed to schedule deal", err);
      setError(err instanceof Error ? err.message : "Could not schedule deal.");
      setIsSubmitting(false);
    }
  };

  const completeSubmission = async (data: PendingSubmissionData & { disableDrips: boolean }) => {
    if (!form) return;

    const {
      trimmedFirst,
      normalizedLast,
      trimmedEmail,
      trimmedPhone,
      assignedToId,
      renderedEmailSubject,
      renderedEmailBody,
      renderedSmsBody,
      startDate,
      endDate,
      contactRecord,
      contactId,
      addressRecord,
      disableDrips,
    } = data;

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
      send_email: form.communicationMethod === "email" || form.communicationMethod === "both",
      send_sms: form.communicationMethod === "sms" || form.communicationMethod === "both",
      disable_drips: disableDrips,
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
      if (appointmentPayload.send_email && trimmedEmail) {
        communications.email = { to: trimmedEmail, subject: renderedEmailSubject, body: renderedEmailBody };
      }
      if (appointmentPayload.send_sms && trimmedPhone) {
        communications.sms = { to: trimmedPhone, body: renderedSmsBody };
      }

      // Build reminders for edit mode
      const editReminders: UpdateDealAppointmentInput["reminders"] = {};
      if (form.communicationMethod === "email" || form.communicationMethod === "both") {
        editReminders.email1DayBefore = form.reminders.email1DayBefore;
        editReminders.email1HourBefore = form.reminders.email1HourBefore;
      }
      if (form.communicationMethod === "sms" || form.communicationMethod === "both") {
        editReminders.sms1DayBefore = form.reminders.sms1DayBefore;
        editReminders.sms1HourBefore = form.reminders.sms1HourBefore;
      }

      const updated = await updateDealAppointment(currentDeal.id, {
        appointmentId: activeAppointment.id,
        appointment: appointmentPayload,
        deal: dealPayload,
        communications: Object.keys(communications).length > 0 ? communications : undefined,
        reminders: Object.keys(editReminders).length > 0 ? editReminders : undefined,
      });

      // Invalidate React Query cache
      invalidateDashboard(companyId, "sales");
      invalidateDashboard(companyId, "jobs");
      invalidateCompanyDeals(companyId);

      void syncAppointmentToGoogle(updated, updated.latest_appointment, companyName);
      onScheduled(updated);
      onClose();
      return;
    }

    const communications: ScheduleDealInput["communications"] = {};
    if (appointmentPayload.send_email && trimmedEmail) {
      communications.email = { to: trimmedEmail, subject: renderedEmailSubject, body: renderedEmailBody };
    }
    if (appointmentPayload.send_sms && trimmedPhone) {
      communications.sms = { to: trimmedPhone, body: renderedSmsBody };
    }

    // Build reminders based on communication method
    const reminders: ScheduleDealInput["reminders"] = {};
    if (form.communicationMethod === "email" || form.communicationMethod === "both") {
      reminders.email1DayBefore = form.reminders.email1DayBefore;
      reminders.email1HourBefore = form.reminders.email1HourBefore;
    }
    if (form.communicationMethod === "sms" || form.communicationMethod === "both") {
      reminders.sms1DayBefore = form.reminders.sms1DayBefore;
      reminders.sms1HourBefore = form.reminders.sms1HourBefore;
    }

    const payload: ScheduleDealInput = {
      stage: stageOnSchedule,
      appointment: appointmentPayload,
      deal: dealPayload,
      communications: Object.keys(communications).length > 0 ? communications : undefined,
      reminders: Object.keys(reminders).length > 0 ? reminders : undefined,
    };

    const updated = await scheduleDeal(currentDeal.id, payload);

    // Invalidate React Query cache
    invalidateDashboard(companyId, "sales");
    invalidateDashboard(companyId, "jobs");
    invalidateCompanyDeals(companyId);

    void syncAppointmentToGoogle(updated, updated.latest_appointment, companyName);
    onScheduled(updated);
    onClose();
  };

  // Step 2: Submit the form
  const handleStep2Submit = useCallback(async () => {
    if (!pendingSubmissionRef.current) return;

    setIsSavingFinal(true);
    setStepError(null);

    try {
      await completeSubmission({
        ...pendingSubmissionRef.current,
        disableDrips: true, // Always disable drips for estimate scheduled
      });
      pendingSubmissionRef.current = null;
    } catch (err) {
      console.error("Failed to schedule deal", err);
      setStepError(err instanceof Error ? err.message : "Could not schedule deal.");
    } finally {
      setIsSavingFinal(false);
    }
  }, []);

  const handleBackStep = useCallback(() => {
    setCurrentStep(1);
  }, []);

  const handleCloseMultiStep = useCallback(() => {
    setCurrentStep(1);
    pendingSubmissionRef.current = null;
    onClose();
  }, [onClose]);

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
      onClose();
    } catch (err) {
      console.error("Failed to delete appointment", err);
      setError(err instanceof Error ? err.message : "Failed to delete appointment");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!open || !form) return null;

  const contactName = formatFullName({ first_name: form.firstName, last_name: form.lastName });
  const modalTitle = contactName || (deal ? `Deal #${deal.id.slice(0, 6)}` : null);
  const headerLabel = isEditMode ? modalCopy.editHeader : modalCopy.createHeader;
  const primaryActionLabel = isEditMode ? modalCopy.editAction : modalCopy.createAction;
  const primaryActionPendingLabel = isEditMode ? modalCopy.editPendingAction : modalCopy.createPendingAction;

  const showStepIndicator = isNewMode || mode === "existing";
  const handleModalClose = currentStep > 1 ? handleCloseMultiStep : onClose;

  return (
    <Modal
      open={open}
      onClose={handleModalClose}
      labelledBy="schedule-deal-modal-title"
      ariaLabel="Schedule appointment"
      size="xl"
      align="top"
    >
      <div className="relative flex max-h-[88vh] w-full max-w-xl flex-col overflow-hidden rounded-lg bg-white shadow-xl">
        <header className="flex items-center justify-between rounded-t-lg border-b border-slate-200 px-3.5 py-2">
          <div className="flex items-center gap-3">
            <div>
              {modalTitle ? (
                <>
                  <p className="text-[11px] uppercase tracking-[0.08em] text-slate-400">{headerLabel}</p>
                  <h2 id="schedule-deal-modal-title" className="text-sm font-semibold text-slate-900">
                    {modalTitle}
                  </h2>
                </>
              ) : (
                <h2 id="schedule-deal-modal-title" className="text-sm font-semibold text-slate-900">
                  {headerLabel}
                </h2>
              )}
            </div>
            {showStepIndicator && (
              <>
                <div className="h-4 w-px bg-slate-300" />
                <StepIndicator currentStep={currentStep} totalSteps={2} />
              </>
            )}
          </div>
          <button
            type="button"
            onClick={handleModalClose}
            className="flex h-6 w-6 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none"
            aria-label="Close"
          >
            ×
          </button>
        </header>

        {/* Step 1: Details */}
        {currentStep === 1 && (
          <form
            onSubmit={handleSubmit}
            className="flex flex-1 flex-col gap-4 overflow-y-auto bg-slate-50 px-3.5 py-4 text-[12px]"
          >
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
              suggestions={addressSuggestions}
              showSuggestions={showAddressSuggestions}
              isFetchingAddress={isFetchingAddress}
              onAddressFieldChange={handleAddressFieldChange}
              onAddressBlur={handleAddressBlur}
              onAddressFocus={handleAddressFocus}
              onAddressSelectChange={handleAddressSelectChange}
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

            <footer className="mt-auto flex justify-between gap-2 border-t border-slate-200 pt-3">
              <div>
                {isEditMode && activeAppointment && !showDeleteConfirm ? (
                  <button
                    type="button"
                    onClick={handleDeleteClick}
                    className="inline-flex items-center justify-center rounded border border-red-200 px-3 py-1.5 text-[12px] font-semibold text-red-600 transition hover:bg-red-50 focus:outline-none"
                    disabled={isSubmitting || isDeleting}
                  >
                    Delete
                  </button>
                ) : null}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center justify-center rounded border border-slate-200 px-3 py-1.5 text-[12px] font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none"
                  disabled={isSubmitting || isDeleting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded bg-accent px-3 py-1.5 text-[12px] font-semibold text-white transition hover:bg-blue-600 focus:outline-none disabled:opacity-60"
                  disabled={isSubmitting || isDeleting}
                >
                  {isSubmitting ? "Continuing…" : isNewMode ? "Continue" : primaryActionLabel}
                </button>
              </div>
            </footer>
          </form>
        )}

        {/* Step 2: Confirmation */}
        {currentStep === 2 && (
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto bg-slate-50 px-3.5 py-4 text-[12px]">
            <SendConfirmationSection
              form={form}
              onCommunicationMethodChange={handleCommunicationMethodChange}
              onReminderChange={handleReminderChange}
            />

            {stepError ? (
              <p className="rounded border border-red-200 bg-red-100 px-3 py-2 text-[12px] font-medium text-red-600">
                {stepError}
              </p>
            ) : null}

            <footer className="mt-auto flex justify-between gap-2 border-t border-slate-200 pt-3">
              <button
                type="button"
                onClick={handleBackStep}
                className="inline-flex items-center justify-center rounded border border-slate-200 px-3 py-1.5 text-[12px] font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none"
                disabled={isSavingFinal}
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleStep2Submit}
                className="inline-flex items-center justify-center rounded bg-accent px-3 py-1.5 text-[12px] font-semibold text-white transition hover:bg-blue-600 focus:outline-none disabled:opacity-60"
                disabled={isSavingFinal}
              >
                {isSavingFinal ? primaryActionPendingLabel : primaryActionLabel}
              </button>
            </footer>
          </div>
        )}

        {showDeleteConfirm ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/60 p-4">
            <div className="w-full max-w-sm rounded-lg bg-white p-4 shadow-xl">
              <h3 className="mb-2 text-sm font-semibold text-slate-900">Delete Appointment?</h3>
              <p className="mb-4 text-[12px] text-slate-600">
                This will permanently delete the appointment. This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleDeleteCancel}
                  className="inline-flex items-center justify-center rounded border border-slate-200 px-3 py-1.5 text-[12px] font-semibold text-slate-600 transition hover:bg-slate-100"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  className="inline-flex items-center justify-center rounded bg-red-600 px-3 py-1.5 text-[12px] font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
