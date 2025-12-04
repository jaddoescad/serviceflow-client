"use client";

import { Modal, Button } from "@/components/ui/library";
import type { NewDealModalProps } from "./types";
import { useNewDealForm } from "./useNewDealForm";
import { ContactInfoSection } from "./ContactInfoSection";
import { AddressSection } from "./AddressSection";
import { DealDetailsSection } from "./DealDetailsSection";
import { TeamAssignmentSection } from "./TeamAssignmentSection";

function StepIndicator({ currentStep }: { currentStep: 1 | 2 }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5">
        <div
          className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold ${
            currentStep === 1
              ? "bg-blue-600 text-white"
              : "bg-blue-100 text-blue-600"
          }`}
        >
          {currentStep > 1 ? (
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            "1"
          )}
        </div>
        <span className={`text-[11px] font-medium ${currentStep === 1 ? "text-slate-900" : "text-slate-500"}`}>
          Details
        </span>
      </div>
      <div className="h-px w-4 bg-slate-300" />
      <div className="flex items-center gap-1.5">
        <div
          className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold ${
            currentStep === 2
              ? "bg-blue-600 text-white"
              : "bg-slate-200 text-slate-500"
          }`}
        >
          2
        </div>
        <span className={`text-[11px] font-medium ${currentStep === 2 ? "text-slate-900" : "text-slate-500"}`}>
          Automations
        </span>
      </div>
    </div>
  );
}

export function NewDealModal(props: NewDealModalProps) {
  const { open, onClose, stages, deal } = props;

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
    memberOptions,
    modalTitle,
    submitLabel,
    isEditMode,
    dripPromptState,
    isSavingDripChoice,
    dripError,
    handleInputChange,
    handleAddressSelectChange,
    handleAddressFieldChange,
    handleAddressLine1Focus,
    handleAddressBlur,
    handleAddressSuggestionSelect,
    handleSubmit,
    handleEnableDrips,
    handleDisableDrips,
    handleCloseDripPrompt,
    handleBackFromDrip,
  } = useNewDealForm(props);

  if (!open) {
    return null;
  }

  const currentStep = dripPromptState ? 2 : 1;
  const showStepIndicator = !isEditMode;

  return (
    <Modal
      open={open}
      onClose={dripPromptState ? handleCloseDripPrompt : onClose}
      labelledBy="new-deal-modal-title"
      ariaLabel={modalTitle}
      size="xl"
      align="top"
    >
      <div className="relative flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-lg">
        <header className="flex items-center justify-between rounded-t-lg border-b border-slate-200 px-4 py-3">
          <div className="flex items-center gap-3">
            <h2 id="new-deal-modal-title" className="text-sm font-semibold text-slate-900">
              {modalTitle}
            </h2>
            {showStepIndicator && (
              <>
                <div className="h-4 w-px bg-slate-300" />
                <StepIndicator currentStep={currentStep} />
              </>
            )}
          </div>
          <button
            type="button"
            onClick={dripPromptState ? handleCloseDripPrompt : onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none"
            aria-label="Close"
          >
            ×
          </button>
        </header>

        {/* Step 2: Drip Settings */}
        {dripPromptState ? (
          <div className="flex flex-1 flex-col bg-slate-50 px-4 py-5">
            <div className="mx-auto flex w-full max-w-md flex-col py-8">
              <h3 className="text-[13px] font-semibold text-slate-900">
                Enable automated drips?
              </h3>
              <p className="mt-1 text-[12px] text-slate-500">
                Automatically send follow-up messages to keep this lead engaged.
              </p>

              {dripError ? (
                <p className="mt-4 rounded border border-red-200 bg-red-100 px-3 py-2 text-[12px] font-medium text-red-600">
                  {dripError}
                </p>
              ) : null}
            </div>

            <footer className="mt-auto flex items-center justify-between border-t border-slate-200 pt-3">
              <Button variant="secondary" onClick={handleBackFromDrip} disabled={isSavingDripChoice}>
                Back
              </Button>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={handleDisableDrips} disabled={isSavingDripChoice}>
                  Skip
                </Button>
                <Button variant="primary" onClick={handleEnableDrips} disabled={isSavingDripChoice}>
                  {isSavingDripChoice ? "Creating…" : "Enable drips"}
                </Button>
              </div>
            </footer>
          </div>
        ) : (
          /* Step 1: Deal Details Form */
          <form
            onSubmit={handleSubmit}
            className="flex flex-1 flex-col gap-4 overflow-y-auto bg-slate-50 px-4 py-5"
          >
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

            <footer className="mt-auto flex justify-end gap-2 border-t border-slate-200 pt-3">
              <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {submitLabel}
              </Button>
            </footer>
          </form>
        )}
      </div>
    </Modal>
  );
}
