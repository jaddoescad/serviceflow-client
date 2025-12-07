"use client";

import { useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "@/components/ui/library";
import type { NewDealModalProps } from "./types";
import { useNewDealForm } from "./useNewDealForm";
import { ContactInfoSection } from "./ContactInfoSection";
import { AddressSection } from "./AddressSection";
import { DealDetailsSection } from "./DealDetailsSection";
import { TeamAssignmentSection } from "./TeamAssignmentSection";

type Step = "form" | "drips";

export function NewDealModal(props: NewDealModalProps) {
  const { open, onClose, stages, deal } = props;
  const [step, setStep] = useState<Step>("form");

  const {
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
    isEditMode,
    handleInputChange,
    handleAddressSelectChange,
    handleAddressFieldChange,
    handleAddressLine1Focus,
    handleAddressBlur,
    handleAddressSuggestionSelect,
    validateForm,
    submitDeal,
    resetStep,
  } = useNewDealForm(props);

  // Reset step when modal closes
  const handleClose = () => {
    setStep("form");
    resetStep();
    onClose();
  };

  // Handle "Next" button - validate form and go to drips step
  const handleNext = () => {
    const isValid = validateForm();
    if (isValid) {
      setStep("drips");
    }
  };

  // Handle "Back" button - go back to form step
  const handleBack = () => {
    setStep("form");
  };

  // Handle drip selection and submit
  const handleDripChoice = async (disableDrips: boolean) => {
    await submitDeal(disableDrips);
    setStep("form");
  };

  if (!open) {
    return null;
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      labelledBy="new-deal-modal-title"
      ariaLabel={modalTitle}
      size="xl"
      align="top"
    >
      <ModalHeader
        title={step === "drips" ? "Enable Drips" : modalTitle}
        titleId="new-deal-modal-title"
        onClose={handleClose}
      >
        {step === "drips" && !isEditMode ? (
          <button
            type="button"
            onClick={handleBack}
            className="absolute left-4 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none"
            aria-label="Go back"
          >
            ←
          </button>
        ) : null}
      </ModalHeader>

      {step === "form" ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (isEditMode) {
              submitDeal(form.disableDrips);
            } else {
              handleNext();
            }
          }}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <ModalBody className="flex flex-col gap-4 bg-slate-50">
            <ContactInfoSection
              form={form}
              onInputChange={handleInputChange}
            />

            <AddressSection
              addressForm={addressForm}
              selectedAddressId={selectedAddressId}
              existingAddresses={deal?.contact?.addresses}
              addressSuggestions={addressSuggestions}
              isFetchingAddress={isFetchingAddress}
              showAddressSuggestions={showAddressSuggestions}
              addressContainerRef={addressContainerRef}
              onAddressSelectChange={handleAddressSelectChange}
              onAddressFieldChange={handleAddressFieldChange}
              onAddressLine1Focus={handleAddressLine1Focus}
              onAddressBlur={handleAddressBlur}
              onAddressSuggestionSelect={handleAddressSuggestionSelect}
            />

            <TeamAssignmentSection
              form={form}
              memberOptions={memberOptions}
              dealSources={dealSources}
              isLoadingDealSources={isLoadingDealSources}
              onInputChange={handleInputChange}
            />

            {isEditMode && (
              <DealDetailsSection
                form={form}
                stages={stages}
                onInputChange={handleInputChange}
              />
            )}

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
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isEditMode ? (isSubmitting ? "Saving…" : "Save Deal") : "Next"}
            </Button>
          </ModalFooter>
        </form>
      ) : (
        <>
          <ModalBody className="flex flex-col gap-4 bg-slate-50">
            <div className="space-y-3 text-[12px] sm:text-[13px]">
              <p className="text-slate-500">
                Drips automatically send scheduled messages based on the deal&apos;s pipeline stage.
              </p>
            </div>

            {error ? (
              <p className="rounded border border-red-200 bg-red-100 px-3 py-2 text-[12px] font-medium text-red-600">
                {error}
              </p>
            ) : null}
          </ModalBody>

          <ModalFooter>
            <Button
              variant="secondary"
              onClick={() => handleDripChoice(true)}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating…" : "Disable drips"}
            </Button>
            <Button
              variant="primary"
              onClick={() => handleDripChoice(false)}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating…" : "Enable drips"}
            </Button>
          </ModalFooter>
        </>
      )}
    </Modal>
  );
}
